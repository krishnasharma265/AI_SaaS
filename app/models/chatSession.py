from app.database.database import Base
from sqlalchemy.orm import Mapped,relationship
from sqlalchemy import Column,String,Integer,ForeignKey
from sqlalchemy import DateTime
from datetime import datetime

class ChatSession(Base):
    __tablename__="chat-sessions"
    __allow_unmapped__=True

    id=Column(Integer,primary_key=True)
    title=Column(String,nullable=False)
    user_id=Column(Integer,ForeignKey("users.id"))

    user=relationship("User",back_populates="sessions")
    messages=relationship("Message",back_populates="session",cascade="all,delete-orphan")
    usage_records=relationship("AIUsage",back_populates="session",cascade="all,delete-orphan")
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )