from fastapi import APIRouter
from app.database.redis_connection import redis_client

router=APIRouter(tags=["Redis"])

@router.get("/messages")
def get_redis_cache():
    redis_client.set(
        "message","hello world"
    )

    value=redis_client.get("message")

    return{
        "redis value":value
    }