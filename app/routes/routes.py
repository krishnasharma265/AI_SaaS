from fastapi import APIRouter,HTTPException
from app.database.connection import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.services.auth import get_current_user
from app.services.auth import hash_password
from app.schemas.user import UserUpdate
from app.schemas.response import APIResponse
from app.models.chatSession import ChatSession
from app.models.message import Message
from app.schemas.message import MessageCreate
from app.core.logger import logger

router=APIRouter()

@router.get("/users/me")
def current_user(
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    
    return user

@router.patch("/users/me")
def change_credentials(
    upd_user:UserUpdate,
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
    
):
    update_data=upd_user.model_dump(exclude_unset=True)
    
    if "password" in update_data :
        update_data["password"]=hash_password(update_data["password"])
    for key,value in update_data.items():
        setattr(user,key,value)

    db.commit()
    db.refresh(user)
    logger.info(
        "user credentials updated successfully"
    )
    return APIResponse(
        success=True,
        message="user credentials updated successfully"
    )


@router.post("/chat/sessions")
def create_chat(title:str,db:Session=Depends(get_db),user=Depends(get_current_user)):
    new_chat=ChatSession(title=title,user_id=user.id)

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    logger.info(
        f"{new_chat} created successfully"
    )
    return APIResponse(
        success=True,
        message=f"new chat {title} generated"
    )

@router.get("/chat/sessions")
def get_user_chat(db:Session=Depends(get_db),user=Depends(get_current_user)):
    chats=db.query(ChatSession).filter(ChatSession.user_id==user.id).all()

    
    return chats

@router.get("/chat/sessions/{session_id}")
def get_user_single_chat(session_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    chat=db.query(ChatSession).filter(ChatSession.user_id==user.id,ChatSession.id==session_id).first()
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="chat not found"
        )
    

    return {
        "id":chat.id
        ,"title":chat.title
    }


@router.post("/chat/sessions/{session_id}/message")
def create_chat_message(session_id:int,message_data:MessageCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    chat=db.query(ChatSession).filter(ChatSession.id==session_id,
                                      ChatSession.user_id==user.id).first()
    
    if not chat:
        logger.info(
            "invalid session_id"
        )
        raise HTTPException(
            status_code=404,
            detail="chat not found"
        )

    new_message=Message(
        session_id=session_id,
        role="user",
        content=message_data.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    logger.info(
        f"{new_message} message created successfully"
    )
    return {
        "id":new_message.id
        ,"content":new_message.content,
        "role":new_message.role
    }


@router.get("/chat/sessions/{session_id}/messages")
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    chat = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user.id
    ).first()

    if not chat:
        logger.info(
            "invalid session_id"
        )
        raise HTTPException(
            status_code=404,
            detail="chat not found"
        )
    
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).all()

    logger.info(
        " messages fetched successfully"
    )
    return messages

@router.delete("/chat/sessions/{session_id}")
def delete_chat(
    session_id:int,
    db:Session=Depends(get_db),user=Depends(get_current_user)
):
    chat=db.query(ChatSession).filter(ChatSession.id==session_id,ChatSession.user_id==user.id).first()

    if not chat:
        logger.info(
            "invalid session_id"
        )
        raise HTTPException(
            status_code=404,
            detail="chat not found"
        )

    db.delete(chat)
    db.commit()

    logger.info(
        f" {chat} deleted  successfully"
    )
    return APIResponse(
        success=True,
        message="Chat deleted successfully",
        
    )

