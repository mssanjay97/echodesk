from chroma_repository.collections import getCollection, queryCollection

def searchDB(query, userId):
    try:
        collection = getCollection(userId)
        return queryCollection(collection, query)
    
    except Exception as e:
    
        print("Error in querying document:", e)
        return e