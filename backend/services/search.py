from chroma_repository.collections import getCollection, queryCollection

def searchDB(query, userId):
    try:
        # collection_name = "history" + "_" + userId      

        # collection = client.get_or_create_collection(name=collection_name, embedding_function=embedding_function)
        collection = getCollection(userId)
        # results = collection.query(query_texts=[query], n_results=5)
        # return results
        return queryCollection(collection, query)
    
    except Exception as e:
    
        print("Error in querying document:", e)
        return e