from fastapi import FastAPI

# from app.models import user, payment, subscription, plans, chatSession, ai_usage, message
from app.routes import auth,routes,ai_chat,test_redis,payment
from app.database.connection import db_init
from fastapi.middleware.cors import CORSMiddleware
from app.core.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from app.database.database import SessionLocal
from app.models.plans import Plans

db_init()
app=FastAPI()

app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"],        # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(ai_chat.router)
app.include_router(test_redis.router)
app.include_router(payment.router)

app.state.limiter=limiter

app.add_exception_handler(RateLimitExceeded,_rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

@app.on_event("startup")
def seed_plans():
    db=SessionLocal()

    plans=[
        ("free",0),
        ("pro",299),
        ("enterprise",999)
    ]

    for name,price in plans:
        exists=db.query(Plans).filter(Plans.plan==name).first()

        if not exists:
            db.add(Plans(
                plan=name,
                price=price
            ))

    db.commit()
    db.close()