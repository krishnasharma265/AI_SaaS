from app.database.database import Base
from sqlalchemy.orm import Mapped,relationship
from sqlalchemy import Column,String,Integer,ForeignKey,Text
from sqlalchemy import DateTime
from datetime import datetime



class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(
        Integer,
        ForeignKey("chat-sessions.id")
    )

    role = Column(String,nullable=False)
    content = Column(Text,nullable=False)

    session = relationship(
        "ChatSession",
        back_populates="messages"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )