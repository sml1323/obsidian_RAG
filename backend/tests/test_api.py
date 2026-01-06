"""
Tests for FastAPI vault API endpoints.
Task 1.1 (continued): API endpoint tests.
"""
import pytest
from fastapi.testclient import TestClient
import tempfile
from pathlib import Path

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_vault():
    """Create a temporary vault structure for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        vault = Path(tmpdir)
        
        # Create some basic structure
        (vault / "Project").mkdir()
        (vault / "Project" / "note.md").write_text("# Note")
        (vault / "README.md").write_text("# Vault")
        
        # Create excluded folder
        (vault / ".obsidian").mkdir()
        (vault / ".obsidian" / "config.json").write_text("{}")
        
        yield vault


class TestVaultConnectEndpoint:
    """Tests for POST /api/vault/connect endpoint."""
    
    def test_connect_valid_vault(self, client, sample_vault):
        """Test successful vault connection with valid path."""
        response = client.post(
            "/api/vault/connect",
            json={"path": str(sample_vault)}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["file_count"] == 2  # README.md + note.md
    
    def test_connect_invalid_path(self, client):
        """Test error response for non-existent path."""
        response = client.post(
            "/api/vault/connect",
            json={"path": "/nonexistent/path"}
        )
        
        assert response.status_code == 404
        assert "does not exist" in response.json()["detail"]


class TestVaultFilesEndpoint:
    """Tests for GET /api/vault/files endpoint."""
    
    def test_get_files_returns_tree(self, client, sample_vault):
        """Test that files endpoint returns hierarchical tree."""
        # First connect
        client.post("/api/vault/connect", json={"path": str(sample_vault)})
        
        # Then get files
        response = client.get("/api/vault/files")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "tree" in data
        assert data["tree"]["type"] == "folder"
