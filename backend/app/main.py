"""
FastAPI application for Obsidian Vault connection.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any

from .vault_scanner import build_tree, count_markdown_files

app = FastAPI(
    title="Obsidian Vault API",
    description="API for connecting to and scanning Obsidian vaults",
    version="0.1.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for connected vault path
_connected_vault: Optional[Path] = None


class VaultConnectRequest(BaseModel):
    """Request body for vault connection."""
    path: str


class VaultConnectResponse(BaseModel):
    """Response for successful vault connection."""
    success: bool
    path: str
    file_count: int
    message: str


class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    error: str
    detail: Optional[str] = None


@app.post("/api/vault/connect", response_model=VaultConnectResponse)
async def connect_vault(request: VaultConnectRequest):
    """
    Connect to an Obsidian vault by specifying its path.
    Validates the path exists and is a directory.
    """
    global _connected_vault
    
    vault_path = Path(request.path).expanduser().resolve()
    
    # Validate path exists
    if not vault_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Path does not exist: {request.path}"
        )
    
    # Validate path is a directory
    if not vault_path.is_dir():
        raise HTTPException(
            status_code=400,
            detail=f"Path is not a directory: {request.path}"
        )
    
    # Check read permissions
    try:
        list(vault_path.iterdir())
    except PermissionError:
        raise HTTPException(
            status_code=403,
            detail=f"Permission denied: {request.path}"
        )
    
    # Store connected vault
    _connected_vault = vault_path
    file_count = count_markdown_files(vault_path)
    
    return VaultConnectResponse(
        success=True,
        path=str(vault_path),
        file_count=file_count,
        message=f"Successfully connected to vault with {file_count} markdown files"
    )


@app.get("/api/vault/files")
async def get_vault_files():
    """
    Get the file tree of the connected vault.
    Returns hierarchical structure with folders and markdown files.
    """
    global _connected_vault
    
    if _connected_vault is None:
        raise HTTPException(
            status_code=400,
            detail="No vault connected. Use POST /api/vault/connect first."
        )
    
    if not _connected_vault.exists():
        _connected_vault = None
        raise HTTPException(
            status_code=404,
            detail="Connected vault no longer exists. Please reconnect."
        )
    
    try:
        tree = build_tree(_connected_vault)
        return {
            "success": True,
            "vault_path": str(_connected_vault),
            "tree": tree
        }
    except PermissionError:
        raise HTTPException(
            status_code=403,
            detail="Permission denied while scanning vault"
        )


@app.get("/api/vault/status")
async def get_vault_status():
    """Get the current vault connection status."""
    global _connected_vault
    
    if _connected_vault is None:
        return {
            "connected": False,
            "path": None
        }
    
    return {
        "connected": True,
        "path": str(_connected_vault),
        "exists": _connected_vault.exists()
    }

# --- Embedding Pipeline ---

from .embedding_engine import LocalEmbeddingStrategy, OpenAIEmbeddingStrategy, VectorStoreManager
from .processing_pipeline import EmbeddingPipeline

# Cache for embedding components
_embedding_pipeline: Optional[EmbeddingPipeline] = None
_current_model_type: Optional[str] = None

class SyncRequest(BaseModel):
    model_type: str = "local" # "local" or "openai"
    api_key: Optional[str] = None

class SyncResponse(BaseModel):
    status: str
    files_processed: int
    chunks_generated: int
    message: str

class ChatRequest(BaseModel):
    message: str
    config: Dict[str, Any] # {"type": "local"|"openai", "model_name": "...", "api_key": "..."}

class ChatResponse(BaseModel):
    role: str
    content: str

def get_pipeline(model_type: str, api_key: Optional[str] = None) -> EmbeddingPipeline:
    global _embedding_pipeline, _current_model_type
    
    # Re-initialize if model type changes or not initialized
    # Also need to re-initialize if it is OpenAI and API key is provided (to ensure we use the latest key)
    # But for simplicity, we assume if model type is same, we reuse. 
    # However, if OpenAI and key changes, we should update.
    # Let's simplify: if openai, always re-init if key provided to be safe or checking key equality?
    # For a simple local app, re-initializing OpenAI strategy is cheap.
    
    if _embedding_pipeline is None or _current_model_type != model_type or (model_type == "openai"):
        if model_type == "openai":
            strategy = OpenAIEmbeddingStrategy(api_key=api_key)
        else:
            strategy = LocalEmbeddingStrategy()
            
        manager = VectorStoreManager(strategy)
        _embedding_pipeline = EmbeddingPipeline(manager)
        _current_model_type = model_type
        
    return _embedding_pipeline

from .chat_engine import ChatEngine

def get_chat_pipeline() -> ChatEngine:
    global _embedding_pipeline
    
    # If pipeline not initialized, default to local embedding strategy
    if _embedding_pipeline is None:
        get_pipeline("local")
        
    return ChatEngine(_embedding_pipeline.vector_store_manager)

@app.post("/api/embeddings/sync", response_model=SyncResponse)
async def sync_embeddings(request: SyncRequest):
    """
    Trigger the embedding pipeline to sync the connected vault.
    """
    global _connected_vault
    
    if _connected_vault is None or not _connected_vault.exists():
        raise HTTPException(status_code=400, detail="No valid vault connected")
        
    try:
        pipeline = get_pipeline(request.model_type, request.api_key)
        result = pipeline.process_vault(_connected_vault)
        
        if result.get("status") == "error":
             raise HTTPException(status_code=500, detail=result.get("message"))
             
        return SyncResponse(
            status=result["status"],
            files_processed=result.get("files_processed", 0),
            chunks_generated=result.get("chunks_generated", 0),
            message=result.get("message", "Sync completed")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message using RAG.
    """
    global _connected_vault
    
    if _connected_vault is None or not _connected_vault.exists():
        raise HTTPException(status_code=400, detail="No valid vault connected")
        
    try:
        engine = get_chat_pipeline()
        response = engine.chat(
            query=request.message,
            vault_path=_connected_vault,
            model_config=request.config
        )
        return ChatResponse(
            role=response["role"],
            content=response["content"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
