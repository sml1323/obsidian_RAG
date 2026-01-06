import pytest
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch
from app.processing_pipeline import EmbeddingPipeline
from app.embedding_engine import VectorStoreManager
from langchain_core.documents import Document

def test_pipeline_initialization():
    mock_manager = MagicMock(spec=VectorStoreManager)
    pipeline = EmbeddingPipeline(mock_manager)
    assert pipeline.vector_store_manager == mock_manager
    assert pipeline.text_splitter is not None

@patch("app.processing_pipeline.get_all_markdown_files")
@patch("app.processing_pipeline.get_file_metadata")
def test_process_vault_flow(mock_get_meta, mock_get_files):
    # Setup mocks
    mock_manager = MagicMock(spec=VectorStoreManager)
    pipeline = EmbeddingPipeline(mock_manager)
    
    # Mock files
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as tmp:
        tmp.write("This is a test document that should be chunked.")
        tmp_path = Path(tmp.name)
    
    try:
        mock_get_files.return_value = [tmp_path]
        mock_get_meta.return_value = {"name": "test.md", "path": "test.md", "modified": "2024-01-01"}
        
        # Run pipeline
        result = pipeline.process_vault(tmp_path.parent)
        
        assert result["status"] == "success"
        assert result["files_processed"] == 1
        assert result["chunks_generated"] > 0
        
        # Verify vector store called
        mock_manager.upsert_documents.assert_called_once()
        call_args = mock_manager.upsert_documents.call_args[0][0]
        assert len(call_args) > 0
        assert isinstance(call_args[0], Document)
        assert call_args[0].metadata["source"] == "test.md"

    finally:
        # Cleanup
        if tmp_path.exists():
            tmp_path.unlink()

def test_process_vault_empty():
    mock_manager = MagicMock(spec=VectorStoreManager)
    pipeline = EmbeddingPipeline(mock_manager)
    
    with tempfile.TemporaryDirectory() as tmp_dir:
        result = pipeline.process_vault(Path(tmp_dir))
        assert result["status"] == "success"
        assert result["files_processed"] == 0
        assert result["chunks_generated"] == 0
        mock_manager.upsert_documents.assert_not_called()
