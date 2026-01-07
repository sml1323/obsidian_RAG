"""
Tests for Project API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.settings import settings_service

import tempfile
from pathlib import Path
import os
import json

client = TestClient(app)

@pytest.fixture
def sample_vault():
    with tempfile.TemporaryDirectory() as tmpdir:
        vault = Path(tmpdir)
        (vault / "Projects").mkdir()
        (vault / "Projects" / "Project A").mkdir()
        (vault / "Projects" / "Project A" / "note.md").write_text("content")
        yield vault

def test_get_projects_flow(sample_vault):
    """Test full flow: connect vault -> get projects."""
    
    # 1. Connect
    res = client.post("/api/vault/connect", json={"path": str(sample_vault)})
    assert res.status_code == 200
    
    # 2. Get Projects
    res = client.get("/api/projects?root_path=Projects")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["projects"]) == 1
    assert data["projects"][0]["name"] == "Project A"
    assert data["projects"][0]["progress"] == 0

def test_update_progress_flow(sample_vault, monkeypatch):
    """Test updating project progress via API."""
    
    # Mock settings storage to be in temp vault
    settings_dir = sample_vault / "storage"
    settings_dir.mkdir()
    
    # Patch singleton
    original_projects_file = settings_service.projects_file
    settings_service.projects_file = settings_dir / "projects.json"
    
    try:
        # 1. Update Progress
        res = client.patch("/api/projects", json={
            "path": "Projects/Project A",
            "progress": 85
        })
        assert res.status_code == 200
        assert res.json()["success"] is True
        
        # 2. Verify Persistence file
        assert settings_service.projects_file.exists()
        saved = json.loads(settings_service.projects_file.read_text())
        assert saved["Projects/Project A"] == 85
        
        # 3. Verify Get endpoints sees new value (if vault connected)
        client.post("/api/vault/connect", json={"path": str(sample_vault)})
        res = client.get("/api/projects")
        assert res.status_code == 200
        projects = res.json()["projects"]
        proj_a = next(p for p in projects if p["name"] == "Project A")
        assert proj_a["progress"] == 85
    finally:
        settings_service.projects_file = original_projects_file
