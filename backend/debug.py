
import requests
import sys
import os

# Add the current directory to sys.path so we can import 'app'
current_dir = os.getcwd()
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from app.embedding_engine import VectorStoreManager, LocalEmbeddingStrategy
except ImportError as e:
    print(f"Import Error: {e}")




def check_api_status():
    print("--- Checking API Status ---")
    try:
        res = requests.get("http://localhost:8000/api/vault/status")
        if res.status_code == 200:
            print(f"Status: {res.json()}")
        else:
            print(f"Error accessing API: {res.status_code} {res.text}")
            
        settings_res = requests.get("http://localhost:8000/api/settings")
        print(f"Settings: {settings_res.json()}")
        
    except Exception as e:
        print(f"Failed to connect to API: {e}")

def check_chroma_db():
    print("\n--- Checking Chroma DB ---")
    try:
        # Use Local strategy for inspection (agnostic to what put data in, usually)
        # Note: If different embedding model was used, dimensions might mismatch if we try to embed query,
        # but getting collection count should work.
        strategy = LocalEmbeddingStrategy() 
        manager = VectorStoreManager(strategy, persist_directory="./chroma_db", collection_name="obsidian_vault")
        
        # Access the collection directly via the Chroma client
        collection = manager.vectorstore
        
        # LangChain's Chroma wrapper doesn't expose 'count' directly easily, but we can try getting all IDs?
        # Or use the underlying client?
        # manager.vectorstore._client...
        
        # Let's just try a search which forces a load
        print("Attempting to load vector store...")
        
        # Note: If database is empty, search might return empty
        results = manager.search("test", k=1)
        print(f"Search 'test' returns {len(results)} results")
        
        # Try to inspect underlying client if possible for count
        # This depends on langchain_chroma implementation
        try:
             # Often has a _collection object
             count = manager.vectorstore._collection.count()
             print(f"Total documents in collection: {count}")
        except Exception as e:
             print(f"Could not get precise count: {e}")
             
        # Inspect for 'embedding' or 'design pattern'
        print("Searching for '임베딩'...")
        results_emb = manager.search("임베딩", k=3)
        for doc in results_emb:
            print(f" - [{doc.metadata.get('filename')}] {doc.page_content[:50]}...")

    except Exception as e:
        print(f"Error checking Chroma DB: {e}")

if __name__ == "__main__":
    check_api_status()
    check_chroma_db()
