#!/bin/bash

# Base URL for Piper voice models
BASE_URL="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US"

# List of medium-quality English voices
VOICES=("harvard" "hfc_female" "hfc_male" "lessac" "libritts" "lj" "vctk_low" "vctk_high")

# Directory to store voices
DEST_DIR="testing/piper_voices"

# Ensure the destination directory exists
mkdir -p "$DEST_DIR"

for VOICE in "${VOICES[@]}"; do
    # Create subdirectory for each voice
    VOICE_DIR="$DEST_DIR/$VOICE"
    mkdir -p "$VOICE_DIR"

    # Define filenames
    MODEL_FILE="$VOICE_DIR/voice.onnx"
    CONFIG_FILE="$VOICE_DIR/voice.onnx.json"

    # Download model and config
    wget --quiet --show-progress -O "$MODEL_FILE" "$BASE_URL/$VOICE/medium/en_US-$VOICE-medium.onnx"
    wget --quiet --show-progress -O "$CONFIG_FILE" "$BASE_URL/$VOICE/medium/en_US-$VOICE-medium.onnx.json"

    # Verify JSON file is not empty
    if [ ! -s "$CONFIG_FILE" ]; then
        echo "Error: JSON file for $VOICE is empty. Retrying with curl..."
        curl -L -o "$CONFIG_FILE" "$BASE_URL/$VOICE/medium/en_US-$VOICE-medium.onnx.json"
    fi

    # Verify again after retry
    if [ ! -s "$CONFIG_FILE" ]; then
        echo "Failed to download valid JSON for $VOICE. Check the URL."
    else
        echo "Successfully downloaded model and config for $VOICE"
    fi
done
