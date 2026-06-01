import redis
import os

redis_host = os.getenv('REDIS_HOST') or 'localhost'
conn = redis.Redis( host=redis_host, port=6379, decode_responses=False)
cache_conn = redis.Redis( host=redis_host, port=6379, decode_responses=True)