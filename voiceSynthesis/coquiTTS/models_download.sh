#!/bin/bash

# List of multilingual models
models=(
  "tts_models/multilingual/multi-dataset/xtts_v2"
  "tts_models/en/ljspeech/fast_pitch"
  "tts_models/en/ljspeech/vits"
)

# Set model directory
MODEL_DIR="$HOME/.local/share/tts"

# Ensure Python & TTS are installed
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 is not installed!"
  exit 1
fi

# Install Coqui TTS if missing
if ! python3 -c "import TTS" &> /dev/null; then
  echo "🔄 Installing Coqui TTS..."
  pip install TTS
fi

# Auto-confirm Hugging Face downloads
export HF_HUB_ENABLE_HF_TRANSFER=1

# Download each model
for model in "${models[@]}"; do
  echo "⬇️ Downloading model: $model"
  python3 -c "from TTS.api import TTS; TTS('$model').download(); print('✅ Downloaded $model')"
done

echo "🎉 All models downloaded!"
