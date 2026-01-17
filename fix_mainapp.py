#!/usr/bin/env python3
import re
from pathlib import Path

replacements = [
    # MainApp.tsx fixes
    (r"user\.role === 'business' \? user\.name : '匿名'", "'匿名'"),
    (r"user\.businessName \|\| \"\"", '\"\"'),
    (r"user\.businessIcon \|\| \"\"", '\"\"'),
    (r"updatedUser\.id", 'updatedUser.googleId'),
    (r"updatedUser\.businessName", '\"\"'),
    (r"updatedUser\.businessIcon", 'undefined'),
    (r"updatedUser\.name", '\"\"'),
    (r"user\.blockedUsers \|\| \[\]", '[]'),
    (r"\.\.\.\(user\.blockedUsers \|\| \[\]\), blockUserId", "blockUserId"),
]

def process_file(filepath):
    """Process a single file"""
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
    filepath = 'frontend/src/components/MainApp.tsx'
    if process_file(filepath):
        print(f"✓ Modified: {filepath}")
    else:
        print(f"✗ No changes needed for {filepath}")

if __name__ == '__main__':
    main()
