

from utils.parser import extractText
from chroma_repository.collections import getCollection, checkExistingContent, addDocument
from bs4 import BeautifulSoup
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib


def ingestContent(url, htmlText, userId, timestamp):
    
    text = extractText(htmlText)
    collection = getCollection(userId)
    
    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    if checkExistingContent(collection, content_hash):
        return True
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    documents = splitter.split_text(text)
    metadatas = [{"timestamp": timestamp, "url":url, "content_hash": content_hash} for _ in range(len(documents))]
    ids = [url + "_" + str(i) for i in range(len(documents))]
    addDocument(collection, documents, metadatas, ids)
    
    return True