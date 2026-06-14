from datetime import datetime,timedelta,date
from sqlalchemy.orm import Session
from app.models.plans import Plans
from app.models.subscription import Subscription

def activate_subscription(
        user_id:int,
        plan_id:int,
        db:Session
):
    
    plan = db.query(Plans).filter(
        Plans.id == plan_id
    ).first()

    subscription = db.query(
        Subscription
    ).filter(
        Subscription.user_id == user_id
    ).first()

    if not subscription:
        raise Exception("Subscription not found")
    
    subscription.plan_id = plan.id

    subscription.start_date = date.today()


    subscription.end_date = (
        date.today()
        + timedelta(days=30)
    )

    subscription.status = "active"
    db.commit()