#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Define replacements
replacements = [
    (r'\buser\.id\b', 'user.googleId'),
    (r'\buser\.email\b', 'user.gmail'),
    (r'\buser\.createdAt\b', 'new Date(user.registrationDate)'),
    (r"'scenery'", "'scene'"),
    (r'"scenery"', '"scene"'),
    (r"'shop'", "'store'"),
    (r'"shop"', '"store"'),
]

# Directories to process
directories_to_process = [
    'frontend/src/components',
    'frontend/src/lib',
]

def process_file(filepath):
    """Process a single file with replacements"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all files"""
    modified_files = []
    
    for directory in directories_to_process:
        dir_path = Path(directory)
        if not dir_path.exists():
            print(f"Directory not found: {directory}")
            continue
        
        for filepath in dir_path.rglob('*.tsx'):
            if process_file(str(filepath)):
                modified_files.append(str(filepath))
                print(f"✓ Modified: {filepath}")
        
        for filepath in dir_path.rglob('*.ts'):
            if str(filepath).endswith('.ts') and not str(filepath).endswith('.d.ts'):
                if process_file(str(filepath)):
                    modified_files.append(str(filepath))
                    print(f"✓ Modified: {filepath}")
    
    print(f"\n\nTotal files modified: {len(modified_files)}")
    for f in modified_files:
        print(f"  - {f}")

if __name__ == '__main__':
    main()
