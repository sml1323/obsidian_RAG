from fastapi.testclient import TestClient
from app.main import app
from app.settings import settings_service
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_settings_service(monkeypatch, tmp_path):
    """Override SettingsService storage dir for tests."""
    storage_dir = tmp_path / "storage"
    storage_dir.mkdir()
    
    # We need to patch the global instance 'settings_service' used in main.py
    # Since it's imported in main.py, we should patch it there?
    # Or just re-assign the storage_dir of the existing singleton?
    # Re-assigning is easier for the singleton pattern used.
    
    original_storage = settings_service.storage_dir
    settings_service.storage_dir = storage_dir
    settings_service._ensure_storage_dir()
    settings_service.settings_file = storage_dir / "settings.json"
    settings_service.projects_file = storage_dir / "projects.json"
    
    yield
    
    # Restore
    settings_service.storage_dir = original_storage
    settings_service._ensure_storage_dir()
    settings_service.settings_file = settings_service.storage_dir / "settings.json"
    settings_service.projects_file = settings_service.storage_dir / "projects.json"

def test_get_settings_default():
    """Test getting settings returns defaults initially."""
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["vault_path"] == ""
    assert data["model_type"] == "local"

def test_patch_settings():
    """Test updating settings."""
    payload = {
        "vault_path": "/new/vault/path",
        "model_type": "openai",
        "api_keys": {
            "openai": "sk-new-key"
        }
    }
    response = client.patch("/api/settings", json=payload)
    assert response.status_code == 200
    
    # Verify persistence via GET
    response = client.get("/api/settings")
    data = response.json()
    assert data["vault_path"] == "/new/vault/path"
    assert data["model_type"] == "openai"
    assert data["api_keys"]["openai"] == "sk-new-key"

def test_patch_project_progress():
    """Test updating project progress via API."""
    payload = {
        "path": "Projects/MyProject",
        "progress": 75
    }
    response = client.patch("/api/projects", json=payload)
    assert response.status_code == 200
    
    # Verify persistence in service
    projects = settings_service.load_projects()
    assert projects["Projects/MyProject"] == 75

# Note: Testing GET /api/projects integration requires a connected vault or mocking `scan_projects`.
# Since `scan_projects` scans a real directory, testing integration is complex without a real vault fixture.
# We will trust unit tests for `scan_projects` (refactored) and `settings_service` for now.
