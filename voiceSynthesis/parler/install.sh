#!/bin/bash

set -e  # Exit immediately if a command fails
pip install --upgrade pip setuptools wheel

echo "Installing PyTorch dependencies first..."
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

echo "Installing remaining dependencies..."
pip install -r requirements.txt

echo "Installation completed successfully!"
