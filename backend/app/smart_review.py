import random
from pathlib import Path
from typing import List
from app.vault_scanner import get_all_markdown_files

def get_random_review_notes(vault_path: Path, count: int = 5) -> List[Path]:
    """
    Selects N random markdown files from the vault, excluding 'Archive' and 'Templates'.
    
    Args:
        vault_path: Root path of the vault.
        count: Number of notes to return.
        
    Returns:
        List of Path objects for the selected notes.
    """
    all_files = get_all_markdown_files(vault_path)
    
    # Filter out Archive and Templates
    # We check if 'Archive' or 'Templates' is in any part of the relative path
    # We also explicitly check for hidden folders/files just in case, though vault_scanner handles most
    valid_files = []
    
    for file_path in all_files:
        try:
            rel_path = file_path.relative_to(vault_path)
        except ValueError:
            continue
            
        parts = rel_path.parts
        
        # Check for excluded keywords in path
        is_excluded = False
        for part in parts:
            if part in ["Archive", "Templates"] or part.startswith("."):
                is_excluded = True
                break
        
        if not is_excluded:
            valid_files.append(file_path)
    
    # Random selection
    if len(valid_files) <= count:
        return valid_files
        
    return random.sample(valid_files, count)
