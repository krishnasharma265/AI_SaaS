from dotenv import load_dotenv
import os
from pydantic_settings import BaseSettings



load_dotenv()

DATABASE_URL=os.getenv("DATABASE_URL")
REDIS_URL=os.getenv("REDIS_URL")
SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",60))


class Settings(BaseSettings):
    GROQ_API_KEY:str
    DATABASE_URL:str
    REDIS_URL:str
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MINUTES:int
    RAZORPAY_KEY_ID:str
    VITE_RAZORPAY_KEY_ID:str
    RAZORPAY_SECRET:str
    RAZORPAY_WEBHOOK_SECRET:str

    class config:
        env_file=".env"

settings=Settings()