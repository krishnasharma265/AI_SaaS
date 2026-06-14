from app.database.database import Base
from sqlalchemy.orm import relationship,Mapped
from sqlalchemy import Column,Integer,String,ForeignKey,Date

class Subscription(Base):
    __tablename__="subscription"
    __allow_unmapped__=True

    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"),unique=True)
    plan_id=Column(Integer,ForeignKey("plans.id"))
    start_date=Column(Date)
    end_date=Column(Date,nullable=True)
    status=Column(String,default="inactive")
    
    subscribe=relationship("User",back_populates="user_subs")
    plan=relationship("Plans",back_populates="subscription")