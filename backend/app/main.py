"""
FastAPI application for Obsidian Vault connection.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any

from .vault_scanner import build_tree, count_markdown_files
from .settings import settings_service


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
    
    vault = await _get_or_connect_vault()
    if not vault:
        raise HTTPException(
            status_code=400,
            detail="No vault connected. Use POST /api/vault/connect first."
        )
    
    if not vault.exists():
        _connected_vault = None
        raise HTTPException(
            status_code=404,
            detail="Connected vault no longer exists. Please reconnect."
        )
    
    try:
        tree = build_tree(vault)
        return {
            "success": True,
            "vault_path": str(vault),
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
    
    vault = await _get_or_connect_vault()
    
    if not vault:
        return {
            "connected": False,
            "path": None
        }
    
    return {
        "connected": True,
        "path": str(vault),
        "exists": vault.exists()
    }

async def _get_or_connect_vault():
    """
    Helper to get connected vault or try to recover from settings.
    """
    global _connected_vault
    
    if _connected_vault and _connected_vault.exists():
        return _connected_vault
        
    # Try to recover from settings
    try:
        settings = settings_service.load_settings()
        path_str = settings.get("vault_path")
        
        if path_str:
            path = Path(path_str)
            if path.exists() and path.is_dir():
                _connected_vault = path
                print(f"Auto-connected to vault from settings: {path}")
                return _connected_vault
    except Exception as e:
        print(f"Failed to auto-connect: {e}")
        
    return None



@app.get("/api/vault/files/content")
async def get_file_content(path: str):
    """
    Get the content of a specific file in the vault.
    """
    global _connected_vault
    
    vault = await _get_or_connect_vault()
    
    if not vault:
        raise HTTPException(status_code=400, detail="No vault connected")
        
    try:
        # Secure file reading
        # Ensure the path is relative to the vault root and doesn't escape
        # Note: 'path' param typically comes from the tree structure which is relative or absolute?
        # Our tree structure currently provides 'path' as absolute or relative?
        # scan_projects uses relative, but build_tree might use something else.
        # Let's assume path is relative to vault root
        
        target_path = (vault / path).resolve()
        
        # Security check: Ensure target_path is within vault
        if not str(target_path).startswith(str(vault.resolve())):
             # Fallback: maybe client sent absolute path?
             target_path = Path(path).resolve()
             if not str(target_path).startswith(str(vault.resolve())):
                raise HTTPException(status_code=403, detail="Access denied: Path outside vault")
        
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
            
        if not target_path.is_file():
             raise HTTPException(status_code=400, detail="Not a file")
             
        content = target_path.read_text(encoding="utf-8")
        return {"success": True, "content": content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Settings API ---

class SettingsResponse(BaseModel):
    vault_path: str
    model_type: str
    api_keys: Dict[str, str]

class SettingsUpdate(BaseModel):
    vault_path: Optional[str] = None
    model_type: Optional[str] = None
    api_keys: Optional[Dict[str, str]] = None

@app.get("/api/settings", response_model=SettingsResponse)
async def get_settings():
    """Get current system settings."""
    return settings_service.load_settings()

@app.patch("/api/settings", response_model=SettingsResponse)
async def update_settings(update: SettingsUpdate):
    """
    Update system settings. 
    Partial updates are supported.
    """
    current = settings_service.load_settings()
    
    # Update dict manually to handle nested api_keys if partial
    new_settings = current.copy()
    
    if update.vault_path is not None:
        new_settings["vault_path"] = update.vault_path
    if update.model_type is not None:
        new_settings["model_type"] = update.model_type
    
    if update.api_keys is not None:
        # Merge api keys
        for k, v in update.api_keys.items():
            new_settings["api_keys"][k] = v
            
    success = settings_service.save_settings(new_settings)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to save settings")
         
    return new_settings


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
    vault = await _get_or_connect_vault()
    
    if not vault or not vault.exists():
        raise HTTPException(status_code=400, detail="No valid vault connected")
        
    try:
        pipeline = get_pipeline(request.model_type, request.api_key)
        result = pipeline.process_vault(vault)
        
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
    vault = await _get_or_connect_vault()
    
    if not vault or not vault.exists():
        raise HTTPException(status_code=400, detail="No valid vault connected")
        
    try:
        engine = get_chat_pipeline()
        response = engine.chat(
            query=request.message,
            vault_path=vault,
            model_config=request.config
        )
        return ChatResponse(
            role=response["role"],
            content=response["content"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Projects API ---

from .vault_scanner import scan_projects


class ProjectUpdateRequest(BaseModel):
    path: str
    progress: int

@app.get("/api/projects")
async def get_projects(root_path: str = "Projects"):
    """
    Get list of projects from the connected vault.
    Scans the specified root path (default: "Projects").
    """
    vault = await _get_or_connect_vault()
    
    if not vault:
        raise HTTPException(
            status_code=400,
            detail="No vault connected. Use POST /api/vault/connect first."
        )
        
    if not vault.exists():
         raise HTTPException(status_code=404, detail="Vault path not found")
         
    try:
        projects = scan_projects(vault, root_path)
        return {
            "success": True,
            "root_path": root_path,
            "projects": projects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/projects")
async def update_project(update: ProjectUpdateRequest):
    """
    Update project progress.
    """
    if not (0 <= update.progress <= 100):
        raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        
    success = settings_service.save_project_progress(update.path, update.progress)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to save progress")
        
    return {"success": True, "message": "Progress updated"}


# --- Smart Review API ---

from .smart_review import get_random_review_notes

@app.get("/api/reviews/random")
async def get_random_reviews(count: int = 5):
    """
    Get N random notes for review, filtering out Archive/Templates.
    """
    vault = await _get_or_connect_vault()
    
    if not vault:
        raise HTTPException(
            status_code=400,
            detail="No vault connected. Use POST /api/vault/connect first."
        )
        
    if not vault.exists():
         raise HTTPException(status_code=404, detail="Vault path not found")
         
    try:
        notes = get_random_review_notes(vault, count)
        
        # Return list of file metadata
        # Reuse get_file_metadata logic or simplified return?
        # Requirement said: "Reuse get_file_metadata..." implicitly via reusability check
        # Let's inspect get_file_metadata in vault_scanner again to be sure or just import it.
        # But get_random_review_notes returns Paths.
        
        from .vault_scanner import get_file_metadata
        
        results = []
        for note_path in notes:
             meta = get_file_metadata(note_path, vault)
             results.append(meta)
             
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
