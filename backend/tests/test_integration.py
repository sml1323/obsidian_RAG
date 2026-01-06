"""
Integration tests for vault connection end-to-end workflow.
Task 4.2: Integration tests for complete workflow validation.
"""
import pytest
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient

import app.main as main_module


@pytest.fixture(autouse=True)
def reset_vault_state():
    """Reset connected vault state between tests."""
    main_module._connected_vault = None
    yield
    main_module._connected_vault = None


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(main_module.app)


@pytest.fixture
def sample_vault():
    """Create a complete PARA-style vault for integration testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        vault = Path(tmpdir)
        
        # PARA structure
        (vault / "Project").mkdir()
        (vault / "Project" / "active-project.md").write_text("# Active Project\n\nTasks here.")
        (vault / "Project" / "SubProject").mkdir()
        (vault / "Project" / "SubProject" / "nested-note.md").write_text("# Nested")
        
        (vault / "Areas").mkdir()
        (vault / "Areas" / "health.md").write_text("# Health tracking")
        (vault / "Areas" / "finance.md").write_text("# Finance notes")
        
        (vault / "Resources").mkdir()
        (vault / "Resources" / "templates.md").write_text("# Templates")
        
        (vault / "Archive").mkdir()
        (vault / "Archive" / "old-project.md").write_text("# Archived")
        
        # Root file
        (vault / "README.md").write_text("# My Vault")
        
        # Excluded folders
        (vault / ".obsidian").mkdir()
        (vault / ".obsidian" / "config.json").write_text("{}")
        (vault / ".trash").mkdir()
        (vault / ".trash" / "deleted.md").write_text("# Deleted")
        
        yield vault


class TestEndToEndWorkflow:
    """Integration tests for complete vault connection workflow."""
    
    def test_connect_and_get_files_workflow(self, client, sample_vault):
        """
        E2E Test: Connect vault → Get file tree → Verify structure.
        """
        # Step 1: Connect to vault
        connect_response = client.post(
            "/api/vault/connect",
            json={"path": str(sample_vault)}
        )
        assert connect_response.status_code == 200
        connect_data = connect_response.json()
        assert connect_data["success"] is True
        assert connect_data["file_count"] == 7  # 7 .md files (not counting excluded)
        
        # Step 2: Get file tree
        files_response = client.get("/api/vault/files")
        assert files_response.status_code == 200
        files_data = files_response.json()
        assert files_data["success"] is True
        assert "tree" in files_data
        
        # Step 3: Verify tree structure
        tree = files_data["tree"]
        assert tree["type"] == "folder"
        
        # Verify PARA folders are present
        child_names = [c["name"] for c in tree["children"]]
        assert "Project" in child_names
        assert "Areas" in child_names
        assert "Resources" in child_names
        assert "Archive" in child_names
        
        # Verify excluded folders are NOT present
        assert ".obsidian" not in child_names
        assert ".trash" not in child_names
    
    def test_refresh_returns_updated_files(self, client, sample_vault):
        """
        E2E Test: Connect → Refresh → Verify updated content.
        """
        # Connect first
        client.post("/api/vault/connect", json={"path": str(sample_vault)})
        
        # Get initial files
        initial_response = client.get("/api/vault/files")
        initial_data = initial_response.json()
        initial_count = initial_data["tree"]["file_count"]
        
        # Add a new file
        (sample_vault / "new-note.md").write_text("# New Note")
        
        # Refresh (call files endpoint again)
        refresh_response = client.get("/api/vault/files")
        refresh_data = refresh_response.json()
        
        # Verify new file is included
        assert refresh_data["tree"]["file_count"] == initial_count + 1
    
    def test_error_recovery_flow(self, client):
        """
        E2E Test: Invalid path → Error → Retry with valid path.
        """
        # Step 1: Try invalid path
        error_response = client.post(
            "/api/vault/connect",
            json={"path": "/nonexistent/path"}
        )
        assert error_response.status_code == 404
        
        # Step 2: Verify status shows not connected
        status_response = client.get("/api/vault/status")
        status_data = status_response.json()
        assert status_data["connected"] is False
        
        # Step 3: Cannot get files without connection
        files_response = client.get("/api/vault/files")
        assert files_response.status_code == 400
