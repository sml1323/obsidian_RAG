import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from pathlib import Path
from app.main import app

client = TestClient(app)

@patch("app.main._connected_vault", Path("/tmp/test_vault"))
@patch("app.main.get_pipeline")
@patch("pathlib.Path.exists")
def test_sync_embeddings_success(mock_exists, mock_get_pipeline):
    # Setup mocks
    mock_exists.return_value = True
    
    mock_pipeline = MagicMock()
    mock_get_pipeline.return_value = mock_pipeline
    mock_pipeline.process_vault.return_value = {
        "status": "success",
        "files_processed": 5,
        "chunks_generated": 10,
        "message": "Sync completed"
    }
    
    response = client.post("/api/embeddings/sync", json={"model_type": "local"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["files_processed"] == 5
    assert data["files_processed"] == 5
    mock_get_pipeline.assert_called_with("local", None)
    mock_pipeline.process_vault.assert_called_once()

@patch("app.main._connected_vault", None)
def test_sync_embeddings_no_vault():
    response = client.post("/api/embeddings/sync", json={"model_type": "local"})
    assert response.status_code == 400
    assert "No valid vault connected" in response.json()["detail"]

@patch("app.main._connected_vault", Path("/tmp/test_vault"))
@patch("app.main.get_pipeline")
@patch("pathlib.Path.exists")
def test_sync_embeddings_openai_with_key(mock_exists, mock_get_pipeline):
    mock_exists.return_value = True
    mock_pipeline = MagicMock()
    mock_get_pipeline.return_value = mock_pipeline
    mock_pipeline.process_vault.return_value = {
        "status": "success",
        "files_processed": 5,
        "chunks_generated": 10,
        "message": "Sync completed"
    }

    api_key = "sk-test-123"
    response = client.post("/api/embeddings/sync", json={"model_type": "openai", "api_key": api_key})

    assert response.status_code == 200
    mock_get_pipeline.assert_called_with("openai", api_key)

@patch("app.main._connected_vault", Path("/tmp/test_vault"))
@patch("app.main.get_pipeline") 
@patch("pathlib.Path.exists")
def test_sync_embeddings_pipeline_error(mock_exists, mock_get_pipeline):
    mock_exists.return_value = True
    mock_pipeline = MagicMock()
    mock_get_pipeline.return_value = mock_pipeline
    mock_pipeline.process_vault.return_value = {
        "status": "error",
        "message": "Something went wrong"
    }
    
    response = client.post("/api/embeddings/sync", json={"model_type": "openai"})
    
    assert response.status_code == 500
    assert "Something went wrong" in response.json()["detail"]
