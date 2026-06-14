from sqlalchemy import Column,Integer,String,ForeignKey
from sqlalchemy.orm import relationship,Mapped
from app.database.database import Base


class Plans(Base):
    __tablename__="plans"
    __allow_unmapped__=True

    id=Column(Integer,primary_key=True,index=True)
    
    plan=Column(String,nullable=False)
    
    price=Column(Integer)
    subscription=relationship("Subscription",back_populates="plan")
