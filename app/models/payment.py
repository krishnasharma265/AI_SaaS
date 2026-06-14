from sqlalchemy import Column,Integer,String,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    plan_id = Column(
        Integer,
        ForeignKey("plans.id")
    )

    order_id = Column(
        String,
        unique=True
    )

    payment_id = Column(
        String,
        unique=True
    )

    amount = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String,
        default="pending",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="payments"
    )