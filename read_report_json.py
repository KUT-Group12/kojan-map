
import json
import sys

def read_report(filename):
    print(f"--- Reading {filename} ---")
    content = ""
    try:
        with open(filename, 'r', encoding='utf-16') as f:
            content = f.read()
    except Exception:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            return

        content = content.replace('\ufeff', '')
        
        # Extract substring from first '{' to last '}'
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx:end_idx+1]
            data = json.loads(json_str)
            stats = data.get('stats', {})
            print(f"Stats: {stats}")
            # print("Failures:")
            for suite in data.get('suites', []):
                 process_suite(suite)
        else:
             print("Content does not look like JSON. Printing first 500 chars:")
             print(content[:500])
             
    except Exception as e:
        print(f"Error parsing JSON: {e}")

def process_suite(suite):
    if suite.get('specs'):
        for spec in suite.get('specs', []):
            if not spec.get('ok', True):
                 print(f"Spec: {spec.get('title')}: {spec.get('file')}")
                 for test in spec.get('tests', []):
                     for result in test.get('results', []):
                         if result.get('status') != 'passed':
                             print(f"  Status: {result.get('status')}")
                             if result.get('error'):
                                msg = result['error'].get('message') or ""
                                stack = result['error'].get('stack') or ""
                                print(f"  Error: {msg[:200]}...") # truncate
    
    if suite.get('suites'):
        for child in suite.get('suites'):
             process_suite(child)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        read_report(sys.argv[1])
    else:
        read_report('e2e_report_docker.json')
