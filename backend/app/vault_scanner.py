"""
Vault scanning module for Obsidian vault file discovery.
"""
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

# Excluded folders that should not be scanned
EXCLUDED_FOLDERS = [".obsidian", ".trash", "node_modules"]


def is_excluded(path: Path) -> bool:
    """Check if a path should be excluded from scanning."""
    for part in path.parts:
        if part in EXCLUDED_FOLDERS:
            return True
    return False


def get_file_metadata(file_path: Path, vault_path: Path) -> dict:
    """Extract metadata from a markdown file."""
    stat = file_path.stat()
    relative_path = file_path.relative_to(vault_path)
    
    return {
        "name": file_path.name,
        "path": str(relative_path),
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "type": "file"
    }


def build_tree(vault_path: Path) -> dict:
    """
    Recursively scan vault directory and build a hierarchical tree structure.
    
    Returns a tree with folders containing children and files with metadata.
    """
    if not vault_path.exists():
        raise FileNotFoundError(f"Vault path does not exist: {vault_path}")
    
    if not vault_path.is_dir():
        raise NotADirectoryError(f"Vault path is not a directory: {vault_path}")
    
    return _scan_directory(vault_path, vault_path)


def _scan_directory(current_path: Path, vault_path: Path) -> dict:
    """Recursively scan a directory and its contents."""
    result = {
        "name": current_path.name,
        "path": str(current_path.relative_to(vault_path)) if current_path != vault_path else "",
        "type": "folder",
        "children": [],
        "file_count": 0
    }
    
    try:
        entries = sorted(current_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
    except PermissionError:
        result["error"] = "Permission denied"
        return result
    
    for entry in entries:
        # Skip excluded folders
        if entry.is_dir() and entry.name in EXCLUDED_FOLDERS:
            continue
        
        if entry.is_dir():
            child = _scan_directory(entry, vault_path)
            result["children"].append(child)
            result["file_count"] += child["file_count"]
        elif entry.suffix == ".md":
            file_meta = get_file_metadata(entry, vault_path)
            result["children"].append(file_meta)
            result["file_count"] += 1
    
    return result


def count_markdown_files(vault_path: Path) -> int:
    """Count total markdown files in vault (excluding excluded folders)."""
    count = 0
    for root, dirs, files in os.walk(vault_path):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_FOLDERS]
        count += sum(1 for f in files if f.endswith(".md"))
    return count

def get_all_markdown_files(vault_path: Path) -> list[Path]:
    """Get a list of all markdown files in the vault (excluding excluded folders)."""
    md_files = []
    for root, dirs, files in os.walk(vault_path):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_FOLDERS]
        for f in files:
            if f.endswith(".md"):
                md_files.append(Path(root) / f)
    return md_files
