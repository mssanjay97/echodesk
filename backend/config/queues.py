import os
from rq import Queue
from config.redis_client import conn

queue_name = os.getenv('QUEUE_NAME') or 'ingestion'

q = Queue(queue_name, connection=conn)
