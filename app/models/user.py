from app.database.database import Base
from sqlalchemy.orm import Mapped,relationship
from sqlalchemy import Column,Integer,String

class User(Base):
    __tablename__="users"
    __allow_unmapped__=True

    id=Column(Integer,primary_key=True,autoincrement=True,index=True)
    email=Column(String,unique=True,nullable=False,index=True)
    password=Column(String)
    role=Column(String)

    sessions = relationship(
        "ChatSession",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    user_subs=relationship("Subscription",back_populates="subscribe",cascade="all,delete-orphan",uselist=False)
    usage_records=relationship("AIUsage",
                              back_populates="user",cascade="all,delete-orphan")

    payments= relationship(
        "Payment",
        back_populates="user"
    )