"""
Tests for Project Scanner functionality.
Task 1.1: Focused tests for project recognition, metadata, and persistence.
"""
import pytest
import tempfile
import json
from pathlib import Path
from datetime import datetime, timedelta

# We will implement these in app/vault_scanner.py momentarily
from app.vault_scanner import scan_projects
from app.settings import settings_service


@pytest.fixture
def sample_vault_with_projects():
    """Create a temporary vault structure with PARA projects for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        vault = Path(tmpdir)
        
        # Create Project Root
        projects_root = vault / "Projects"
        projects_root.mkdir()
        
        # Project 1: Active
        p1 = projects_root / "Project Alpha"
        p1.mkdir()
        (p1 / "inception.md").write_text("# Inception")
        
        # Project 2: Empty/Just folders
        p2 = projects_root / "Project Beta"
        p2.mkdir()
        (p2 / "resources").mkdir()
        (p2 / "resources" / "res.md").write_text("Resource")
        
        # Project 3: Has hidden stuff
        p3 = projects_root / "Project Gamma"
        p3.mkdir()
        (p3 / ".git").mkdir()
        (p3 / ".git" / "config").write_text("x")
        (p3 / "visible.md").write_text("Visible")
        
        # Non-project files in root (should be ignored)
        (projects_root / "root_note.md").write_text("Ignore me")
        
        # Excluded folder in root (should be ignored)
        (projects_root / ".trash").mkdir()
        
        yield vault

class TestProjectScanning:
    """Tests for scanning project folders."""

    def test_scan_identifies_immediate_subfolders(self, sample_vault_with_projects):
        """Test that only immediate subfolders are recognized as projects."""
        projects = scan_projects(sample_vault_with_projects, "Projects")
        
        project_names = {p["name"] for p in projects}
        assert "Project Alpha" in project_names
        assert "Project Beta" in project_names
        assert "Project Gamma" in project_names
        
        # Should NOT include files or excluded folders
        assert "root_note.md" not in project_names
        assert ".trash" not in project_names
        assert "resources" not in project_names  # Nested folder

    def test_project_metadata_calculation(self, sample_vault_with_projects):
        """Test file counts and modification times."""
        projects = scan_projects(sample_vault_with_projects, "Projects")
        
        alpha = next(p for p in projects if p["name"] == "Project Alpha")
        assert alpha["file_count"] == 1
        
        beta = next(p for p in projects if p["name"] == "Project Beta")
        assert beta["file_count"] == 1
        
        # Check that beta's mtime comes from the nested file
        beta_res_file = sample_vault_with_projects / "Projects" / "Project Beta" / "resources" / "res.md"
        expected_time = datetime.fromtimestamp(beta_res_file.stat().st_mtime).isoformat()
        assert beta["last_modified"] == expected_time

    def test_persistence_save_and_load(self, sample_vault_with_projects, monkeypatch):
        """Test saving and loading progress via SettingsService."""
        # Mock settings service files to temp dir
        settings_dir = sample_vault_with_projects / "storage"
        settings_dir.mkdir()
        
        # Patch the singleton
        original_projects_file = settings_service.projects_file
        settings_service.projects_file = settings_dir / "projects.json"
        
        try:
            # 1. Save progress
            settings_service.save_project_progress("Projects/Project Alpha", 50)
            settings_service.save_project_progress("Projects/Project Beta", 75)
            
            # 2. Verify file content
            data = json.loads(settings_service.projects_file.read_text())
            assert data["Projects/Project Alpha"] == 50
            assert data["Projects/Project Beta"] == 75
            
            # 3. Load progress
            loaded = settings_service.load_projects()
            assert loaded["Projects/Project Alpha"] == 50
            
        finally:
            settings_service.projects_file = original_projects_file

    
    def test_scan_merges_progress(self, sample_vault_with_projects, monkeypatch):
        """Test that scan_projects merges persisted progress data."""
        # Mock settings service files
        settings_dir = sample_vault_with_projects / "storage"
        settings_dir.mkdir()
        
        original_projects_file = settings_service.projects_file
        settings_service.projects_file = settings_dir / "projects.json"
        
        try:
            # Pre-seed progress
            settings_service.save_project_progress("Projects/Project Alpha", 42)
            
            projects = scan_projects(sample_vault_with_projects, "Projects")
            alpha = next(p for p in projects if p["name"] == "Project Alpha")
            
            assert alpha["progress"] == 42
            # Others should imply 0 or None
            beta = next(p for p in projects if p["name"] == "Project Beta")
            assert beta.get("progress", 0) == 0
            
        finally:
            settings_service.projects_file = original_projects_file


    def test_scan_handles_missing_root(self, sample_vault_with_projects):
        """Test behavior when project root doesn't exist."""
        # "Projects" exists, but "BadRoot" does not
        result = scan_projects(sample_vault_with_projects, "BadRoot")
        assert result == [] # Should be empty list or handle gracefully
