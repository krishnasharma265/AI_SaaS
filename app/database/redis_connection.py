import redis
import os
from app.core.config import settings
redis_client=redis.from_url(os.environ["REDIS_URL"])