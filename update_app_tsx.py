#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Define replacements for App.tsx
app_replacements = [
    (r'id: `user_\$\{Date\.now\(\)\}`,\s*\n\s*email: \'user@example\.com\',\s*\n\s*// 一般会員はユーザー名を不要にするため空文字にする\s*\n\s*name: role === \'business\' \? \'山田商店\' : role === \'admin\' \? \'管理者\' : \'\',\s*\n\s*role,\s*\n\s*businessName: role === \'business\' \? \'山田商店\' : undefined,\s*\n\s*businessIcon: role === \'business\' \? \'[^\']+\' : undefined,\s*\n\s*createdAt: new Date\(\),', 
     'googleId: `user_${Date.now()}`,\n      gmail: \'user@example.com\',\n      role,\n      registrationDate: new Date().toISOString(),'),
]

def process_app():
    """Process App.tsx specifically"""
    try:
        filepath = 'frontend/src/App.tsx'
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in app_replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing App.tsx: {e}")
        return False

def main():
    if process_app():
        print("✓ Modified: App.tsx")
    else:
        print("✗ No changes made to App.tsx")

if __name__ == '__main__':
    main()
