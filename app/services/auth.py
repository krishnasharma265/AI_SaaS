from jose import jwt,JWTError
from passlib.context import CryptContext
from app.core.config import settings
from datetime import datetime,timedelta
from fastapi import HTTPException,Depends
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.core.logger import logger

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(password:str):
    return pwd_context.hash(password)

def verify_password(plain,hashed):
    return pwd_context.verify(plain,hashed)

def create_token(data:dict):
    to_encode=data.copy()
    expire=datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,settings.SECRET_KEY,algorithm=settings.ALGORITHM)

def verify_token(token:str):
    try:
        payload=jwt.decode(token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        logger.info(
            "invalid token"
            )
        raise HTTPException(status_code=401,detail="Invalid Token")
    
security=HTTPBearer()

def get_current_user(credentials:HTTPAuthorizationCredentials=Depends(security),
                     db:Session=Depends(get_db)):
    token=credentials.credentials
    payload=verify_token(token)
    email=payload.get("sub") 

    if email is None:
        logger.info(
            "invalid email"
            )
        raise HTTPException(
            status_code=401,
            detail="Invaid token"
        )
    user=db.query(User).filter(User.email==email).first()

    if not user:
        logger.info(
            "user not found"
            )
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user