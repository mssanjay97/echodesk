import json
from config.redis_client import cache_conn
import hashlib

def generate_cache_key(query, userId):
    query_hash = hashlib.sha256(query.strip().lower().encode()).hexdigest()
    return f"search:{userId}:{query_hash}"


def get(key):
    data = cache_conn.get(key)
    if data:
        return json.loads(data)

    return None


def set(key, value, ttl=3600):
    cache_conn.setex(key, ttl, json.dumps(value))