
def read_file(filename):
    print(f"--- Reading {filename} ---")
    try:
        with open(filename, 'r', encoding='utf-16') as f:
            print(f.read())
    except Exception:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                print(f.read())
        except Exception as e:
            print(f"Error reading {filename}: {e}")

read_file('lint_errors.txt')
read_file('test_errors.txt')
