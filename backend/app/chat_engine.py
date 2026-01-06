from typing import Dict, Any, Optional, List
from pathlib import Path
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_community.chat_models import ChatOllama
from langchain_openai import ChatOpenAI

from app.embedding_engine import VectorStoreManager

class ChatEngine:
    def __init__(self, vector_store_manager: VectorStoreManager):
        self.vector_store_manager = vector_store_manager
        
    def _get_llm(self, model_config: Dict[str, Any]):
        model_type = model_config.get("type", "local")
        
        if model_type == "openai":
            api_key = model_config.get("api_key")
            model_name = model_config.get("model_name", "gpt-3.5-turbo") # Default fallback
            return ChatOpenAI(model=model_name, api_key=api_key)
        else:
            # Local / Ollama
            model_name = model_config.get("model_name", "llama3")
            base_url = model_config.get("base_url", "http://localhost:11434")
            return ChatOllama(model=model_name, base_url=base_url)

    def chat(self, query: str, vault_path: Path, model_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a chat query using RAG.
        1. Retrieve relevant chunks
        2. Construct prompt
        3. Generate response
        """
        
        # 1. Retrieve
        # Note: In a real app we might want to ensure we're searching strictly within the connected vault.
        # Since we use a single collection "obsidian_vault", it mixes files if we switch vaults without clearing.
        # For this MVP, we assume one active vault seeded in the DB.
        
        docs = self.vector_store_manager.search(query, k=5)
        
        context_text = "\n\n".join([doc.page_content for doc in docs])
        
        if not context_text:
            context_text = "No relevant notes found."

        # 2. Prompt
        template = """You are an intelligent assistant helping a user with their Obsidian notes.
Answer the question based ONLY on the following context from their notes:

{context}

Question: {question}

If the answer is not in the context, say you don't know based on the notes.
"""
        prompt = ChatPromptTemplate.from_template(template)
        
        # 3. Generate
        llm = self._get_llm(model_config)
        chain = prompt | llm | StrOutputParser()
        
        try:
            response_content = chain.invoke({
                "context": context_text,
                "question": query
            })
            
            return {
                "role": "assistant",
                "content": response_content
            }
        except Exception as e:
            return {
                "role": "assistant",
                "content": f"Error generating response: {str(e)}"
            }
