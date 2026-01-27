
import sys
import os

filename = 'e2e_report_docker.json'

print(f"File size: {os.path.getsize(filename)} bytes")

try:
    with open(filename, 'rb') as f:
        raw = f.read(2000)
        print("--- RAW BYTES (first 100) ---")
        print(raw[:100])
        
        print("\n--- DECODED (UTF-16) ---")
        try:
            print(raw.decode('utf-16'))
        except Exception as e:
            print(f"Failed to decode as utf-16: {e}")
            
        print("\n--- DECODED (UTF-8) ---")
        try:
            print(raw.decode('utf-8'))
        except Exception as e:
            print(f"Failed to decode as utf-8: {e}")
            
except Exception as e:
    print(f"Error reading file: {e}")
