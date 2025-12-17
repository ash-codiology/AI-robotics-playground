import os
from pathlib import Path

# Test the path resolution logic from content_loader.py
current_file = __file__  # This would be the content_loader.py file path
print(f"Current script location: {current_file}")

# Test the path from backend/src/utils to book/docs
backend_utils_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "book", "docs")
print(f"Path from backend/src/utils to book/docs: {backend_utils_path}")
print(f"Does it exist? {os.path.exists(backend_utils_path)}")

# Test the path from backend root to book/docs
backend_root_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "book", "docs")
print(f"Path from backend root to book/docs: {backend_root_path}")
print(f"Does it exist? {os.path.exists(backend_root_path)}")

# Test the path from project root to book/docs
project_root_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "book", "docs")
print(f"Path from project root to book/docs: {project_root_path}")
print(f"Does it exist? {os.path.exists(project_root_path)}")

# Test absolute path from project root
abs_project_path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "book", "docs"))
print(f"Absolute path from project root to book/docs: {abs_project_path}")
print(f"Does it exist? {os.path.exists(abs_project_path)}")

# Let's also check the current working directory
print(f"Current working directory: {os.getcwd()}")

# List contents of the current directory to understand the structure
print(f"Contents of current directory: {os.listdir(os.getcwd())}")

# List contents of parent directory
parent_dir = os.path.dirname(os.getcwd())
print(f"Contents of parent directory: {os.listdir(parent_dir)}")

# List contents of book directory if it exists from parent
book_dir = os.path.join(parent_dir, "book")
if os.path.exists(book_dir):
    print(f"Contents of book directory: {os.listdir(book_dir)}")
    docs_dir = os.path.join(book_dir, "docs")
    if os.path.exists(docs_dir):
        print(f"Contents of book/docs: {os.listdir(docs_dir)}")