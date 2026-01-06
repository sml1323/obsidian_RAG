"""
Tests for vault scanning functionality.
Task 1.1: 5 focused tests covering critical vault scanning behaviors.
"""
import pytest
import tempfile
import os
from pathlib import Path
from datetime import datetime

from app.vault_scanner import (
    build_tree,
    is_excluded,
    get_file_metadata,
    count_markdown_files,
    EXCLUDED_FOLDERS
)


@pytest.fixture
def sample_vault():
    """Create a temporary vault structure for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        vault = Path(tmpdir)
        
        # Create PARA folder structure
        (vault / "Project").mkdir()
        (vault / "Areas").mkdir()
        (vault / "Resources").mkdir()
        (vault / "Archive").mkdir()
        
        # Create some markdown files
        (vault / "Project" / "project-note.md").write_text("# Project Note")
        (vault / "Areas" / "daily-notes.md").write_text("# Daily Notes")
        (vault / "Resources" / "reference.md").write_text("# Reference")
        (vault / "README.md").write_text("# My Vault")
        
        # Create nested folder
        (vault / "Project" / "SubProject").mkdir()
        (vault / "Project" / "SubProject" / "nested.md").write_text("# Nested")
        
        # Create excluded folders with content
        (vault / ".obsidian").mkdir()
        (vault / ".obsidian" / "config.json").write_text("{}")
        (vault / ".trash").mkdir()
        (vault / ".trash" / "deleted.md").write_text("# Deleted")
        (vault / "node_modules").mkdir()
        (vault / "node_modules" / "package.md").write_text("# Package")
        
        yield vault


class TestVaultScanning:
    """Tests for vault scanning functionality."""
    
    def test_valid_vault_path_connection(self, sample_vault):
        """Test that a valid vault path can be scanned successfully."""
        tree = build_tree(sample_vault)
        
        assert tree["type"] == "folder"
        assert tree["name"] == sample_vault.name
        assert len(tree["children"]) > 0
    
    def test_invalid_path_raises_error(self):
        """Test that non-existent path raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            build_tree(Path("/nonexistent/path/to/vault"))
    
    def test_recursive_markdown_discovery(self, sample_vault):
        """Test that markdown files are discovered recursively."""
        tree = build_tree(sample_vault)
        
        # Count all markdown files in tree
        def count_files(node):
            if node["type"] == "file":
                return 1
            return sum(count_files(child) for child in node.get("children", []))
        
        total_files = count_files(tree)
        # Should find: README.md, project-note.md, daily-notes.md, reference.md, nested.md
        assert total_files == 5
    
    def test_excluded_folders_are_filtered(self, sample_vault):
        """Test that .obsidian, .trash, and node_modules are excluded."""
        tree = build_tree(sample_vault)
        
        # Check that excluded folders are not in children
        root_folder_names = [child["name"] for child in tree["children"]]
        
        for excluded in EXCLUDED_FOLDERS:
            assert excluded not in root_folder_names, f"{excluded} should be excluded"
    
    def test_file_metadata_extraction(self, sample_vault):
        """Test that file metadata (name, path, modified time) is extracted."""
        readme_path = sample_vault / "README.md"
        metadata = get_file_metadata(readme_path, sample_vault)
        
        assert metadata["name"] == "README.md"
        assert metadata["path"] == "README.md"
        assert metadata["type"] == "file"
        # Verify modified time is ISO 8601 format
        datetime.fromisoformat(metadata["modified"])


class TestExclusionLogic:
    """Tests for folder exclusion logic."""
    
    def test_is_excluded_detects_obsidian_folder(self):
        """Test that .obsidian paths are detected as excluded."""
        assert is_excluded(Path(".obsidian/config.json"))
        assert is_excluded(Path("vault/.obsidian/plugins"))
    
    def test_is_excluded_detects_all_excluded_folders(self):
        """Test all excluded folder patterns are detected."""
        assert is_excluded(Path(".trash/deleted.md"))
        assert is_excluded(Path("node_modules/package/index.md"))
    
    def test_is_excluded_allows_normal_paths(self):
        """Test that normal paths are not excluded."""
        assert not is_excluded(Path("Project/note.md"))
        assert not is_excluded(Path("Areas/work/task.md"))
