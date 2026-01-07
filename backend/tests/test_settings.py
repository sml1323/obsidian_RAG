import pytest
import shutil
import json
from pathlib import Path
from app.settings import SettingsService

# Test fixture to setup/teardown a temporary storage directory
@pytest.fixture
def temp_storage(tmp_path):
    storage_dir = tmp_path / "storage"
    storage_dir.mkdir()
    
    # Initialize service with temp storage path
    service = SettingsService(storage_dir=storage_dir)
    
    yield service
    
    # Cleanup (pytest handles tmp_path cleanup, but good to be explicit if needed)

def test_load_settings_defaults(temp_storage):
    """Test that loading settings when no file exists returns defaults."""
    settings = temp_storage.load_settings()
    
    assert settings["vault_path"] == ""
    assert settings["model_type"] == "local"
    assert "openai" in settings["api_keys"]
    assert "gemini" in settings["api_keys"]

def test_save_and_load_settings(temp_storage):
    """Test saving settings and reloading them."""
    new_settings = {
        "vault_path": "/tmp/test_vault",
        "model_type": "openai",
        "api_keys": {
            "openai": "sk-test-key",
            "gemini": ""
        }
    }
    
    # Save
    saved = temp_storage.save_settings(new_settings)
    assert saved is True
    
    # Reload
    loaded = temp_storage.load_settings()
    assert loaded["vault_path"] == "/tmp/test_vault"
    assert loaded["model_type"] == "openai"
    assert loaded["api_keys"]["openai"] == "sk-test-key"

def test_project_progress_persistence(temp_storage):
    """Test saving and loading project progress."""
    # Initially empty
    progress = temp_storage.load_projects()
    assert progress == {}
    
    # Save progress
    temp_storage.save_project_progress("Project A", 50)
    temp_storage.save_project_progress("Project B", 100)
    
    # Load and verify
    loaded = temp_storage.load_projects()
    assert loaded["Project A"] == 50
    assert loaded["Project B"] == 100
    
    # Update existing
    temp_storage.save_project_progress("Project A", 75)
    updated = temp_storage.load_projects()
    assert updated["Project A"] == 75

def test_settings_file_structure(temp_storage):
    """Verify the actual JSON files are created."""
    temp_storage.save_project_progress("Test", 10)
    
    projects_file = temp_storage.storage_dir / "projects.json"
    assert projects_file.exists()
    
    with open(projects_file) as f:
        data = json.load(f)
        assert data["Test"] == 10
