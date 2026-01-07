
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from pathlib import Path
from app.main import app

client = TestClient(app)

@patch("app.main._connected_vault", Path("/mock/vault"))
@patch("app.main.Path.exists", return_value=True) # Mock vault path exists check
@patch("app.main.get_random_review_notes")
def test_get_random_reviews_default(mock_get_notes, mock_exists):
    """Test default behavior (N=5)."""
    # Mock return value
    mock_get_notes.return_value = [
        Path("vault/Note1.md"), 
        Path("vault/Note2.md"),
        Path("vault/Note3.md"),
        Path("vault/Note4.md"),
        Path("vault/Note5.md")
    ] 
    
    # Patch vault_scanner.get_file_metadata because main imports it from there
    with patch("app.vault_scanner.get_file_metadata") as mock_meta:
        mock_meta.side_effect = lambda p, v: {"name": p.name, "path": str(p), "modified": "2024-01-01", "type": "file"}
        
        response = client.get("/api/reviews/random")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert data[0]["name"] == "Note1.md"
        
        # Verify service called with default count
        mock_get_notes.assert_called_once()
        args, kwargs = mock_get_notes.call_args
        assert kwargs.get("count") == 5 or args[1] == 5

@patch("app.main._connected_vault", Path("/mock/vault"))
@patch("app.main.Path.exists", return_value=True)
@patch("app.main.get_random_review_notes")
def test_get_random_reviews_custom_count(mock_get_notes, mock_exists):
    """Test custom count parameter."""
    mock_get_notes.return_value = [Path("vault/Note1.md")]
    
    with patch("app.vault_scanner.get_file_metadata") as mock_meta:
        mock_meta.return_value = {"name": "Note1.md", "path": "vault/Note1.md", "modified": "2024-01-01", "type": "file"}
        
        response = client.get("/api/reviews/random?count=1")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        
        # Verify service called with custom count
        mock_get_notes.assert_called_once()
        args, kwargs = mock_get_notes.call_args
        assert kwargs.get("count") == 1 or args[1] == 1
