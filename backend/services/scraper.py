from chroma_repository.collections import getCollection
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
from utils.parser import extractText
from services.ingestion import ingestContent

def requestWebPage(url):
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

   
def scrapeUrl(url, title, userId):
    
    try:
    
        response = requestWebPage(url)
        ingestContent(url, response.text, userId)
        #ingestContent(url, title, userId)
    
    except Exception as e:
        print("Error in document scraping ",e)
        return e

