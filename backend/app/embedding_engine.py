from abc import ABC, abstractmethod
from typing import List, Any, Optional
import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

class EmbeddingStrategy(ABC):
    @abstractmethod
    def get_embeddings_model(self):
        """Returns the underlying LangChain embeddings model"""
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        pass

class LocalEmbeddingStrategy(EmbeddingStrategy):
    def __init__(self, model_name: str = "BAAI/bge-m3"):
        self.model_name = model_name
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
        
    def get_embeddings_model(self):
        return self.embeddings

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embeddings.embed_documents(texts)
        
    def embed_query(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)

class OpenAIEmbeddingStrategy(EmbeddingStrategy):
    def __init__(self, model_name: str = "text-embedding-3-small", api_key: Optional[str] = None):
        self.model_name = model_name
        # Expects OPENAI_API_KEY environment variable to be set or passed as argument
        self.embeddings = OpenAIEmbeddings(model=model_name, api_key=api_key)

    def get_embeddings_model(self):
        return self.embeddings
        
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embeddings.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)

class VectorStoreManager:
    def __init__(self, strategy: EmbeddingStrategy, persist_directory: str = "./chroma_db", collection_name: str = "obsidian_vault"):
        self.strategy = strategy
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.vectorstore = None
        self._init_client()
        
    def _init_client(self):
        self.vectorstore = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.strategy.get_embeddings_model(),
            persist_directory=self.persist_directory
        )
    
    def upsert_documents(self, documents: List[Document]):
        """
        Upserts documents into the vector store.
        documents: List of langchain_core.documents.Document objects
        """
        if not documents:
            return
        
        # Chroma handles upserts by ID if provided, otherwise adds.
        # We assume documents have meaningful metadata or we might want to generate IDs.
        # For now, let Chroma handle IDs or we can generate them from content/path if needed.
        # But typically we want stable IDs for upsert.
        # Let's assume the documents passed in might have IDs, or we let Chroma generate.
        # However, specifically for 'upsert', we usually need IDs.
        # If we just use add_documents, it might duplicate if we don't manage IDs.
        
        # Strategies for ID generation: hash of content or file path.
        # For Obsidian vault, file path is a good candidate for ID if one-to-one, 
        # but with chunking, it's file_path + chunk_index.
        
        # We will extract IDs if they exist in the documents, or rely on add_documents behavior.
        # Ideally, the caller should provide IDs.
        self.vectorstore.add_documents(documents)

    def search(self, query: str, k: int = 5) -> List[Document]:
        """
        Search for documents similar to the query.
        """
        if not self.vectorstore:
            return []
            
        return self.vectorstore.similarity_search(query, k=k)
