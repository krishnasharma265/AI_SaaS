from app.models.ai_usage import AIUsage
from sqlalchemy.orm import Session
from app.database.database import SessionLocal

def save_usage(user_id:int,
               session_id:int,
               promt_token:int,
               output_token:int,
               total_token:int
               ):
    

    
    
    db = SessionLocal()
    try:
        Aiusage=AIUsage(
            user_id=user_id,
            session_id=session_id,
            promt_token=promt_token,
            output_token=output_token,
            total_token=total_token
        )
        db.add(Aiusage)
        db.commit()
    finally:
        db.close()