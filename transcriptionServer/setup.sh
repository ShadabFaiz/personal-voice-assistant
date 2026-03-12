#!/bin/bash

python3.11 -m venv venv


set -e  # Exit immediately if a command fails
pip install --upgrade pip setuptools wheel

echo "Installing remaining dependencies..."
pip install -r requirements.txt

echo "Installation completed successfully!"
