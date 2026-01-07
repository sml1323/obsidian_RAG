import json
from pathlib import Path
from typing import Dict, Any, Optional
import os

class SettingsService:
    def __init__(self, storage_dir: Optional[Path] = None):
        # Default to 'storage' in the app root (parent of app package)
        if storage_dir:
            self.storage_dir = storage_dir
        else:
            # Assuming this file is in backend/app/, parent is backend/app, parent.parent is backend/
            # We want backend/storage/
            base_dir = Path(__file__).parent.parent
            self.storage_dir = base_dir / "storage"
            
        self._ensure_storage_dir()
        self.settings_file = self.storage_dir / "settings.json"
        self.projects_file = self.storage_dir / "projects.json"
        
    def _ensure_storage_dir(self):
        """Ensure storage directory exists."""
        if not self.storage_dir.exists():
            self.storage_dir.mkdir(parents=True, exist_ok=True)

    def get_default_settings(self) -> Dict[str, Any]:
        """Return default system settings."""
        return {
            "vault_path": "",
            "model_type": "local",
            "api_keys": {
                "openai": "",
                "gemini": ""
            }
        }

    def load_settings(self) -> Dict[str, Any]:
        """Load settings from JSON file or return defaults."""
        if not self.settings_file.exists():
            return self.get_default_settings()
            
        try:
            with open(self.settings_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Merge with defaults to ensure all keys exist (migrations separate/future)
                defaults = self.get_default_settings()
                self._deep_update(defaults, data)
                return defaults
        except (json.JSONDecodeError, OSError) as e:
            print(f"Error loading settings: {e}")
            return self.get_default_settings()

    def save_settings(self, settings: Dict[str, Any]) -> bool:
        """Save settings to JSON file."""
        try:
            # Atomic write pattern: write to temp, then rename
            temp_file = self.settings_file.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(settings, f, indent=2)
            
            # Atomic rename (on POSIX)
            temp_file.replace(self.settings_file)
            return True
        except OSError as e:
            print(f"Error saving settings: {e}")
            return False

    def load_projects(self) -> Dict[str, int]:
        """Load project progress metadata."""
        if not self.projects_file.exists():
            return {}
            
        try:
            with open(self.projects_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return {}

    def save_project_progress(self, project_path: str, progress: int) -> bool:
        """Save progress for a project."""
        data = self.load_projects()
        data[project_path] = progress
        
        try:
            temp_file = self.projects_file.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
            temp_file.replace(self.projects_file)
            return True
        except OSError as e:
            print(f"Error saving project progress: {e}")
            return False

    def _deep_update(self, base_dict, update_dict):
        """Recursively update dictionary."""
        for key, value in update_dict.items():
            if isinstance(value, dict) and key in base_dict and isinstance(base_dict[key], dict):
                self._deep_update(base_dict[key], value)
            else:
                base_dict[key] = value

# Singleton instance
settings_service = SettingsService()
