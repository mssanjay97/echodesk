

from utils.parser import extractText
from chroma_repository.collections import getCollection, checkExistingContent, addDocument
from bs4 import BeautifulSoup
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib


def ingestContent(url, htmlText, userId, timestamp):
    # soup = BeautifulSoup(htmlText, 'html.parser')
    # for tag in soup(["script", "style", "noscript"]):
    #     tag.extract()
    # text = soup.get_text()
    
    text = extractText(htmlText)
        
    # collection_name = "history" + "_" + userId         
    # collection = client.get_or_create_collection(name=collection_name, embedding_function=embedding_function)
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