import chromadb
from chromadb.utils import embedding_functions
import os

chroma_host = os.getenv('CHROMA_HOST') or 'localhost'
client = chromadb.HttpClient(host=chroma_host, port=8000)

existing_collection_names = [c.name for c in client.list_collections()]
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

def getCollection(userId: str):
    collection_name = "history" + "_" + userId         
    return client.get_or_create_collection(name=collection_name, embedding_function=embedding_function)
    
def checkExistingContent(collection, content_hash):
    existing = collection.get(where={"content_hash": content_hash}, limit=1)
    if existing and len(existing.get("ids", [])) > 0:
        print("Duplicate content detected !")
        return True
    return False

def addDocument(collection, documents, metadatas, ids):
    collection.add(documents=documents, metadatas=metadatas, ids=ids)

def queryCollection(collection, query):
    results = collection.query(query_texts=[query], n_results=5)
    return results

