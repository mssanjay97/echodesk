from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
from rq import Queue, Retry
from services.scraper import scrapeUrl
import os
import json
import hashlib
from services.ingestion import ingestContent
from services.search import searchDB
from config.redis_client import conn, cache_conn    
from config.queues import q
from services.cache import get, set, generate_cache_key

redis_host = os.getenv('REDIS_HOST') or 'localhost'
queue_name = os.getenv('QUEUE_NAME') or 'ingestion'

# conn = redis.Redis(host=redis_host, port = 6379, decode_responses = True)
# q = Queue(queue_name, connection=conn)

app = Flask(__name__)
CORS(app)

# def generate_cache_key(query, userId):
#     query_hash = hashlib.sha256(query.strip().lower().encode()).hexdigest()
#     return f"search:{userId}:{query_hash}"

@app.route("/api/v1/queries", methods=["POST"])
def queryHistory():
    try:
        data = request.get_json()

        query, userId = None, None

        if data:
            query = data.get("query")
            userId = data.get("userId")

        print("search queries:", query, userId)

        cache_key = generate_cache_key(query, userId)
        cached_result = get(cache_key)

        if cached_result:
            print("Cache HIT")
            return jsonify(cached_result), 200

        print("Cache MISS")

        results = searchDB(query, userId)
        print(" documents ",results["documents"][0])
        response = { "documents": results["documents"][0], "metadata": results["metadatas"][0]}

        #conn.setex(cache_key, 3600, json.dumps(response))
        set(cache_key, response, ttl=3600)

        return jsonify(response), 200

    except Exception as e:
        print("Error in queryHistory:", e)
        return jsonify({"message": "queryHistory failed"}), 400
    
    

@app.route("/api/v1/url", methods = ["POST"])
def parseAndStoreURL():
    try:
        data = request.get_json()
        url, title, userId = None, None, None
        
        if data:
            url = data.get("url")
            title = data.get("title")
            userId = data.get("userId")
        
        job = q.enqueue(scrapeUrl, url, title, userId, retry=Retry(max=3, interval=[10, 30, 60]))
        
        return jsonify({"message":"enqueued"}), 200
        
    except Exception as e:
        print("Error in parseAndStoreURL:", e)
        return jsonify({"message":"parseAndStoreURL failed"}), 400

@app.route("/api/v1/content", methods = ["POST"])
def storeContent():
    try:
        data = request.get_json()
        htmlText, url, userId, timestamp = None, None, None, None
        
        if data:
            url = data.get("url")
            htmlText = data.get("htmlText")
            userId = data.get("userId")
            timestamp = data.get("timestamp")
        
        job = q.enqueue(ingestContent, url, htmlText, userId, timestamp, retry=Retry(max=3, interval=[10, 30, 60]))
        
        return jsonify({"message":"enqueued"}), 200
        
    except Exception as e:
        print("Error in storeContent:", e)
        return jsonify({"message":"storeContent failed"}), 400
    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug = True)