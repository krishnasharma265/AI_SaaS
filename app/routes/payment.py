from fastapi import APIRouter,Depends,HTTPException,Request
from sqlalchemy.orm import Session
from app.services.auth import get_current_user
import razorpay
import os
from app.models.plans import Plans
from app.database.connection import get_db
from app.models.payment import Payment
from app.services.activation_service import activate_subscription
from app.core.config import settings


router=APIRouter(tags=["payment"])

client=razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_SECRET
    )
)

@router.post("/payment/create-order")
def create_order(
    plan_id:int,
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    plan=db.query(Plans).filter(Plans.id==plan_id).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found"
        )
    
    order=client.order.create({
        "amount":plan.price*100,
        "currency":"INR",
        "payment_capture":1
    })

    payment=Payment(
        user_id=user.id,
        plan_id=plan.id,
        order_id=order["id"],
        amount=plan.price,
        status="pending"

    )
    db.add(payment)
    db.commit()

    return order

@router.post("/payment/verify")
def verify_payment(
    payload:dict,
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id":payload["razorpay_order_id"],
            "razorpay_payment_id":payload["razorpay_payment_id"],
            "razorpay_signature":payload["razorpay_signature"]
        })
    except:
        raise HTTPException(
            status_code=400,
            detail="Invalid signature"
        
        )
    
    payment=db.query(Payment).filter(Payment.order_id==payload["razorpay_order_id"]).first()

    payment.payment_id=payload["razorpay_payment_id"]
    payment.status="success"
    db.commit()
    return {
        "message":"verified"
    }

@router.post("/payment/webhook")
async def rozarpay_webhook(
    request:Request,
    db:Session=Depends(get_db)
):
    body=await request.body()

    signature=request.headers.get("X-Razorpay-Signature")

    try:
        client.utility.verify_webhook_signature(
            body.decode(),
            signature,
            os.getenv("RAZORPAY_WEBHOOK_SECRET")
        )
    except:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook"
        )
    
    payload=await request.json()

    event=payload["event"]

    if event=="payment.captured":
        order_id=payload["payload"]["payment"]["entity"]["order_id"]

        payment=db.query(Payment).filter(Payment.order_id==order_id).first()
        
        if payment.status!="success" :
            payment.status="success"

            activate_subscription(
                payment.user_id,
                payment.plan_id,
                db
            )
            db.commit()

    return {"status":"ok"}
        