from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
from rq import Queue
from scraper import scraper
import os

redis_host = os.getenv('REDIS_HOST') or 'localhost'
queue_name = os.getenv('QUEUE_NAME') or 'url'

conn = redis.Redis(host=redis_host, port = 6379)
q = Queue(queue_name, connection=conn)

app = Flask(__name__)
CORS(app)

@app.route("/api/v1/queries", methods = ["POST"])
def queryHistory():
    try:
        data = request.get_json()
        query, userId = None, None
        
        if data:
            query = data.get('query')
            userId = data.get('userId')
        print("search queries: ", query, userId)
        results = scraper.searchDB(query, userId)
        print(" documents ",results["documents"][0])
        return jsonify({"documents": results["documents"][0], "metadata": results["metadatas"][0]}), 200
    
    except Exception as e:
        print("Error in getQuery:", e)
        return jsonify({"message":"getQuery failed"}), 400

    

@app.route("/api/v1/url", methods = ["POST"])
def parseAndStoreURL():
    try:
        data = request.get_json()
        url, title, userId = None, None, None
        
        if data:
            url = data.get("url")
            title = data.get("title")
            userId = data.get("userId")
        
        job = q.enqueue(scraper.scrapeUrl, url, title, userId, retry=3, retry_intervals=[10, 30, 60])
        
        return jsonify({"message":"enqueued"}), 200
        
    except Exception as e:
        print("Error in getUrl:", e)
        return jsonify({"message":"getUrl failed"}), 400

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
        
        job = q.enqueue(scraper.storeContent, url, htmlText, userId, retry=3, retry_intervals=[10, 30, 60])
        
        return jsonify({"message":"enqueued"}), 200
        
    except Exception as e:
        print("Error in getUrl:", e)
        return jsonify({"message":"getUrl failed"}), 400
    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug = True)