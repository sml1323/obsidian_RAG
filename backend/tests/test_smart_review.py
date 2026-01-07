
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.smart_review import get_random_review_notes

@pytest.fixture
def mock_vault_files():
    return [
        Path("vault/Note1.md"),
        Path("vault/Note2.md"),
        Path("vault/Project/Note3.md"),
        Path("vault/Archive/OldNote.md"),
        Path("vault/Templates/DailyTemplate.md"),
        Path("vault/.obsidian/config.md"), # Should be excluded by scanner anyway, but good to ensure service handles it if scanner leaks
        Path("vault/Deep/Nested/Note4.md"),
        Path("vault/Trash/Deleted.md"),     # Assuming we filter 'Trash' or similar if needed, based on requirements 'Archive' and 'Templates' were specific.
        Path("vault/Reviewable5.md"),
        Path("vault/Reviewable6.md")
    ]

@patch("app.smart_review.get_all_markdown_files")
def test_get_random_review_notes_filtering(mock_get_files, mock_vault_files):
    """Test that Archive, Templates, and hidden folders are filtered out."""
    mock_get_files.return_value = mock_vault_files
    
    # We ask for a large number to get all valid notes
    results = get_random_review_notes(Path("vault"), count=10)
    
    result_paths = [str(p) for p in results]
    
    # Assertions
    assert "vault/Archive/OldNote.md" not in result_paths
    assert "vault/Templates/DailyTemplate.md" not in result_paths
    assert "vault/.obsidian/config.md" not in result_paths
    
    # Valid notes should be present
    assert "vault/Note1.md" in result_paths
    assert "vault/Note2.md" in result_paths
    assert "vault/Project/Note3.md" in result_paths

@patch("app.smart_review.get_all_markdown_files")
def test_get_random_review_notes_count(mock_get_files, mock_vault_files):
    """Test that it returns exactly N notes."""
    mock_get_files.return_value = mock_vault_files
    
    # Request 2 notes
    results = get_random_review_notes(Path("vault"), count=2)
    assert len(results) == 2

@patch("app.smart_review.get_all_markdown_files")
def test_get_random_review_notes_undersize(mock_get_files, mock_vault_files):
    """Test behavior when requested count > available valid notes."""
    mock_get_files.return_value = [Path("vault/Note1.md"), Path("vault/Note2.md")] # Only 2 valid notes
    
    results = get_random_review_notes(Path("vault"), count=5)
    assert len(results) == 2 # Should return all available
