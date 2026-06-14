from fastapi import APIRouter, Depends, HTTPException,Request
from sqlalchemy.orm import Session
import json
from app.services.auth import get_current_user
from app.database.connection import get_db
from datetime import date
from app.models.chatSession import ChatSession
from app.models.message import Message
from app.models.ai_usage import AIUsage
from app.schemas.message import MessageCreate
from app.models.subscription import Subscription
from app.models.plans import Plans
from app.services.ai_services import AIServices
from app.core.logger import logger
from app.database.redis_connection import redis_client
from app.core.limiter import limiter
from fastapi import BackgroundTasks
from app.services.ai_usage_service import save_usage

router=APIRouter(
    prefix="/ai",
    tags=["AI"]
)



@router.post("/chat/{session_id}")
@limiter.limit("30/minute")
async def chat_with_ai(
    request:Request,
    backgroundtasks:BackgroundTasks,
    session_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):  
    #user request --------------------------------------------
    chat = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user.id
    ).first()

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="chat not found"
        )
    
    user_message = Message(
        session_id=session_id,
        role="user",
        content=message_data.content
    )

    

    db.add(user_message)
    db.flush()


    # user request + old messages getout from db------------------------------------
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.id.asc()).all()

    chat_history = [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in messages[-30:]
    ]

    # quota key for tracking daily limit------------------
    quota_key=f"user:{user.id}:daily_requests"
    used=int(redis_client.get(quota_key) or 0)

    

    subscription=db.query(Subscription).filter(Subscription.user_id==user.id).first()

    if not subscription:
        plan_data="free"
        # raise HTTPException(
        #     status_code=404,detail="subscription not found"
        # )
    
    ### check plan expirary
    elif subscription:
        plan_data=subscription.plan
    if not plan_data:
        raise HTTPException(
            status_code=404,
            detail="subscription details not found"
        )
    if plan_data!="free":

        if subscription.end_date is not None and subscription.end_date<date.today():
            subscription.status="inactive"
            
            subscription.plan="free"
            print( "plan expired returned to free")
            db.commit()
    plans={
        "free":100,
        "pro":1000,
        "enterprise":10000
    }
    limit=plans.get(plan_data,100)
    

    if used>=limit:
        raise HTTPException(
            status_code=429,detail="daily limit exceeds"
        )

    current=redis_client.incr(quota_key )


    if current==1:
        redis_client.expire(
            quota_key,86400
        )

    # used Redis Caching for giving response to user if avialable ----------------------------
    cache_key=f"session:{session_id}:msg:{message_data.content}"
    cached_response=redis_client.get(cache_key)
    if cached_response :
        assistant_message = Message(
                    session_id=session_id,
                    role="assistant",
                    content=cached_response
                )

        db.add(assistant_message)
        db.commit()
        return{
            "response":cached_response,
            "source":"cache"
        }
    

    # ai_response from groq and save responses of AI in redis for 1 hour------------------------------
    ai_response = await AIServices.generate_response(
        chat_history
    )

    if "error" in ai_response:
        db.rollback()
        logger.info(
            f"ai gives error in generating response"
        )
        raise HTTPException(status_code=503, detail=ai_response["error"])
                            
    redis_client.setex(
        cache_key,3600,ai_response["content"]
    )


    # save response and token used for each request in database ---------------------------
    assistant_message = Message(
        session_id=session_id,
        role="assistant",
        content=ai_response["content"]
    )

    backgroundtasks.add_task(
        save_usage,
        user.id,
        session_id,
        ai_response["prompt_tokens"],
        ai_response["output_tokens"],
        ai_response["total_tokens"]
    )

   


    db.add(assistant_message)
    
    db.commit()

    backgroundtasks.add_task(
        logger.info,
        "AI successfully generate response"
    )
    
    return {
        "response": ai_response["content"],
        "source":"Groq"
    }