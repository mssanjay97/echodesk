from bs4 import BeautifulSoup
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
#from sentence_transformers import SentenceTransformer
import chromadb 
from chromadb.utils import embedding_functions
from dateutil import parser
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import os
import time
import hashlib

# client = chromadb.PersistentClient(path="../data-store") 
chroma_host = os.getenv('CHROMA_HOST') or 'localhost'
client = chromadb.HttpClient(host=chroma_host, port=8000)

existing_collection_names = [c.name for c in client.list_collections()]
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

def requestUrl(url):
    retry_strategy = Retry(total = 3, read = 3, connect = 3, 
        backoff_factor = 0.5, status_forcelist = (500, 502, 503, 504, 429), 
        allowed_methods = ["GET", "POST"])
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session = requests.Session()
    user_agents = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    session.headers.update({'User-Agent': user_agents})
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    try:
        response = session.get(url, timeout = 10)
        response.raise_for_status()  
        return response
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed after multiple retries: {e}")
        
def storeContent(url, htmlText, userId):
    soup = BeautifulSoup(htmlText, 'html.parser')
    for tag in soup(["script", "style", "noscript"]):
        tag.extract()
    text = soup.get_text()
        
    collection_name = "history" + "_" + userId         
    collection = client.get_or_create_collection(name=collection_name, embedding_function=embedding_function)
    
    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    existing = collection.get(where={"content_hash": content_hash}, limit=1)
    if existing and len(existing.get("ids", [])) > 0:
        print("Duplicate content detected !")
        return True
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    documents = splitter.split_text(text)
    collection.add(documents = documents, metadatas = [{"url":url, "content_hash": content_hash} for _ in range(len(documents))], ids = [url + "_" + str(i) for i in range(len(documents))])
    
    return True
  
   
def scrapeUrl(url, title, userId):
    
    try:
    
        response = requestUrl(url)
        storeContent(url, response.text, userId)
        #storeContent(url, title, userId)
    
    except Exception as e:
        print("Error in document scraping ",e)
        return e
      
def searchDB(query, userId):
    try:
        collection_name = "history" + "_" + userId      

        collection = client.get_or_create_collection(name=collection_name, embedding_function=embedding_function)
        results = collection.query(query_texts=[query], n_results=5)
        return results
    
    except Exception as e:
    
        print("Error in querying document:", e)
        return e