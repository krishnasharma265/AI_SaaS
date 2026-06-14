from sqlalchemy import Column,Integer,ForeignKey,DateTime
from app.database.database import Base
from sqlalchemy.orm import Mapped
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class AIUsage(Base):
    __tablename__="ai_usage"
    __allow_unmapped__=True
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"),nullable=False)
    session_id=Column(Integer,ForeignKey("chat-sessions.id"),nullable=False)

    promt_token=Column(Integer,nullable=False)
    output_token=Column(Integer,nullable=False)
    total_token=Column(Integer,nullable=False)

    user=relationship("User",back_populates="usage_records")
    session=relationship("ChatSession",back_populates="usage_records")

    created_at=Column(DateTime(timezone=True) ,server_default=func.now())