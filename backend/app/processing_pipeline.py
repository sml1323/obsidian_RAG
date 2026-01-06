from typing import List, Dict, Any
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.embedding_engine import VectorStoreManager
from app.vault_scanner import get_all_markdown_files, get_file_metadata

class EmbeddingPipeline:
    def __init__(self, vector_store_manager: VectorStoreManager):
        self.vector_store_manager = vector_store_manager
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def process_vault(self, vault_path: Path) -> Dict[str, Any]:
        """
        Scans vault, chunks content, generates embeddings, and stores them.
        Returns a summary of the operation.
        """
        if not vault_path.exists():
             return {"status": "error", "message": f"Vault path not found: {vault_path}"}

        # 1. Scan files
        files = get_all_markdown_files(vault_path)
        total_files = len(files)
        total_chunks = 0
        
        documents_to_embed = []
        
        for file_path in files:
            try:
                content = file_path.read_text(encoding='utf-8')
                metadata = get_file_metadata(file_path, vault_path)
                
                # 2. Chunk text
                # We create a base document to split
                # We add source metadata immediately so chunks inherit it
                base_doc_metadata = {
                    "source": str(metadata["path"]),
                    "filename": metadata["name"],
                    "modified": metadata["modified"]
                }
                
                chunks = self.text_splitter.create_documents(
                    texts=[content], 
                    metadatas=[base_doc_metadata]
                )
                
                documents_to_embed.extend(chunks)
                total_chunks += len(chunks)
                
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")
                # Continue processing other files
                continue
        
        # 3. Embed and Store
        if documents_to_embed:
            self.vector_store_manager.upsert_documents(documents_to_embed)
            
        return {
            "status": "success",
            "files_processed": total_files,
            "chunks_generated": total_chunks,
            "message": f"Successfully processed {total_files} files into {total_chunks} chunks."
        }
