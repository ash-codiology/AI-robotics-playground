#!/usr/bin/env python3
"""
Quickstart validation script for the RAG Chatbot backend.
This script validates that the basic setup is correct and all dependencies are available.
"""

import sys
import os
from pathlib import Path


def validate_python_version():
    """Validate that the Python version is 3.11 or higher."""
    if sys.version_info < (3, 11):
        print(f"[ERROR] Python 3.11 or higher required. Current version: {sys.version_info.major}.{sys.version_info.minor}")
        return False
    print(f"[OK] Python version {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro} is valid")
    return True


def validate_dependencies():
    """Validate that all required dependencies are available."""
    required_packages = [
        "fastapi",
        "uvicorn",
        "cohere",
        "qdrant_client",
        "sqlalchemy",
        "pydantic",
        "dotenv",
        "pytest",
        "jwt",
        "passlib",
        "cryptography"
    ]

    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"[OK] {package} is available")
        except ImportError:
            missing_packages.append(package)
            print(f"[ERROR] {package} is missing")

    if missing_packages:
        print(f"\n[ERROR] Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install -r requirements.txt")
        return False

    print("\n[OK] All required dependencies are available")
    return True


def validate_project_structure():
    """Validate that the expected project structure exists."""
    required_paths = [
        "src",
        "src/config",
        "src/models",
        "src/services",
        "src/api",
        "src/api/routes",
        "src/api/middleware",
        "src/utils",
        "tests",
        "requirements.txt",
        "pyproject.toml",
        ".env.example"
    ]

    missing_paths = []
    for path in required_paths:
        full_path = Path(path)
        if not full_path.exists():
            missing_paths.append(path)
            print(f"[ERROR] {path} does not exist")
        else:
            print(f"[OK] {path} exists")

    if missing_paths:
        print(f"\n[ERROR] Missing paths: {', '.join(missing_paths)}")
        return False

    print("\n[OK] Project structure is valid")
    return True


def validate_core_files():
    """Validate that core implementation files exist and are properly structured."""
    core_files = [
        "src/config/settings.py",
        "src/models/entities.py",
        "src/models/rag.py",
        "src/models/metadata.py",
        "src/services/rag_engine.py",
        "src/services/retrieval.py",
        "src/services/generation.py",
        "src/api/routes/query.py",
        "src/api/main.py",
        "src/utils/validators.py",
        "src/utils/helpers.py"
    ]

    missing_files = []
    for file in core_files:
        full_path = Path(file)
        if not full_path.exists():
            missing_files.append(file)
            print(f"[ERROR] Core file {file} does not exist")
        else:
            # Check if file has content
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if len(content.strip()) == 0:
                    print(f"[ERROR] Core file {file} is empty")
                    missing_files.append(file)
                else:
                    print(f"[OK] Core file {file} exists and has content")

    if missing_files:
        print(f"\n[ERROR] Missing or invalid core files: {', '.join(missing_files)}")
        return False

    print("\n[OK] All core files are present and valid")
    return True


def validate_environment_variables():
    """Validate that environment variables are properly configured."""
    required_env_vars = [
        "COHERE_API_KEY",
        "QDRANT_API_KEY",
        "QDRANT_URL",
        "DATABASE_URL",
        "SECRET_KEY"
    ]

    print("\nChecking for environment variables...")
    print("(Note: This validation checks if .env.example exists with required variables)")

    env_example_path = Path(".env.example")
    if not env_example_path.exists():
        print("[ERROR] .env.example file does not exist")
        return False

    with open(env_example_path, 'r', encoding='utf-8') as f:
        env_content = f.read()

    missing_vars = []
    for var in required_env_vars:
        if var not in env_content:
            missing_vars.append(var)
            print(f"[ERROR] {var} not found in .env.example")
        else:
            print(f"[OK] {var} found in .env.example")

    if missing_vars:
        print(f"\n[ERROR] Missing environment variables in .env.example: {', '.join(missing_vars)}")
        return False

    print("\n[OK] Environment variables are properly configured in .env.example")
    return True


def main():
    """Main validation function."""
    print("Starting RAG Chatbot Backend Validation...")
    print("=" * 50)

    validations = [
        ("Python Version", validate_python_version),
        ("Dependencies", validate_dependencies),
        ("Project Structure", validate_project_structure),
        ("Core Files", validate_core_files),
        ("Environment Variables", validate_environment_variables),
    ]

    results = []
    for name, validation_func in validations:
        print(f"\nValidating {name}...")
        print("-" * 30)
        result = validation_func()
        results.append((name, result))

    print("\n" + "=" * 50)
    print("Validation Summary:")
    print("=" * 50)

    all_passed = True
    for name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{name}: {status}")
        if not result:
            all_passed = False

    print("\n" + "=" * 50)
    if all_passed:
        print("All validations passed! The RAG Chatbot backend is ready for use.")
        print("\nTo start the server:")
        print("  cd backend")
        print("  uvicorn src.api.main:app --reload --port 8000")
        print("\nTo run tests:")
        print("  cd backend")
        print("  pytest")
    else:
        print("Some validations failed. Please address the issues above before proceeding.")
        sys.exit(1)


if __name__ == "__main__":
    main()