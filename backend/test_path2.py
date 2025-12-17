import os
from pathlib import Path

# Test the exact path calculation used in content_loader.py
# __file__ would be backend/src/utils/content_loader.py
fake_file_path = "D:\\Q4_Hackathon\\backend\\src\\utils\\content_loader.py"

# Calculate the path as done in content_loader.py
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(fake_file_path))))
print(f"Project root calculated: {project_root}")

docs_path = os.path.join(project_root, "book", "docs")
print(f"Docs path calculated: {docs_path}")
print(f"Docs path exists: {os.path.exists(docs_path)}")

if os.path.exists(docs_path):
    print(f"Contents of docs: {os.listdir(docs_path)[:5]}")  # Show first 5 items
else:
    print("Docs path does not exist!")

# Let's also try the path from the current working directory perspective
print("\nFrom current working directory perspective:")
current_project_root = os.path.dirname(os.getcwd())
print(f"Current dir: {os.getcwd()}")
print(f"Current project root: {current_project_root}")
current_docs_path = os.path.join(current_project_root, "book", "docs")
print(f"Current docs path: {current_docs_path}")
print(f"Current docs path exists: {os.path.exists(current_docs_path)}")