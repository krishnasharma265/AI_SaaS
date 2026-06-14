from fastapi import APIRouter,Depends,HTTPException,Request
from sqlalchemy.orm import Session
from app.schemas.user import CreateUser,LoginUser
from app.database.connection import get_db
from app.services.auth import hash_password,verify_password,create_token
from app.schemas.response import APIResponse
from app.models.user import User
from app.schemas.token import Token_Response
from app.core.logger import logger
from app.core.limiter import limiter
from app.models.subscription import Subscription
from app.models.plans import Plans
from datetime import date

router=APIRouter(prefix="/auth",tags=["Auth"])

@router.post("/signup")
def signup(request:Request,user:CreateUser,db:Session=Depends(get_db)):
    existing=db.query(User).filter(User.email==user.email).first()

    if existing :
        raise HTTPException(status_code=400, detail="User already exists")

    new_user=User(
        email=user.email,
        password=hash_password(user.password),
        role="user"
    )

    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    free_plan = db.query(Plans).filter(
        Plans.plan == "Free"
    ).first()

    if not free_plan:
        raise HTTPException(
            status_code=500,
            detail="Free plan not configured"
        )

    subscription = Subscription(
        user_id=new_user.id,
        plan_id=free_plan.id,
        start_date=date.today(),
        end_date=None,
        status="active"
    )

    db.add(subscription)
    db.commit()

    logger.info(
        f"{new_user.email} created successfully"
    )
    return APIResponse(
        success=True,
        message="user created"
    )

@router.post("/login")
@limiter.limit("5/minute")
def login(request:Request,user:LoginUser,db:Session=Depends(get_db)):
    db_user=db.query(User).filter(User.email==user.email).first()

    if not db_user :
        logger.info(
            f"{user.email} not found"
        )
        raise HTTPException(status_code=401, detail="Invalid username")
    elif  not verify_password(user.password, db_user.password):
        
        raise HTTPException(status_code=401, detail="Invalid password")
    

    token = create_token({"sub":db_user.email})

    logger.info(
        f"{user.email} logged in successfully"
    )
    return Token_Response(
        access_token=token,
        token_type="bearer"
    )
