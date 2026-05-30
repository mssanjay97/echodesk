import redis
from rq_win import WindowsWorker
import os

redis_host = os.getenv('REDIS_HOST') or 'localhost'
queue_name = os.getenv('QUEUE_NAME') or 'url'
conn = redis.Redis(host=redis_host, port = 6379)
os.sys.path.insert(0, os.path.abspath('.'))

if __name__ == "__main__":
    worker = WindowsWorker([queue_name], connection = conn)
    worker.work()
