from flask import Flask, request, jsonify
import torch
import time
from TTS.api import TTS
import numpy as np
import sounddevice as sd

app = Flask(__name__)

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device selected: {device}")

# Initialize VITS TTS
tts = TTS("tts_models/en/ljspeech/vits").to(device)
print("Model initialized")

# Ensure correct sample rate
sample_rate = 22050  # VITS models typically use 22050Hz

@app.route("/voice/synthesize", methods=["POST"])
def generate_voice():
    data = request.get_json()
    text = data.get("text", "")
    
    if not text:
        return jsonify({"error": "Text is required"}), 400
    
    print(f"Generating speech for text: {text}")
    tts_start = time.time()
    
    # Generate speech
    audio = tts.tts(text=text, use_phonemes=False)
    
    # Convert to NumPy array
    audio_np = np.array(audio, dtype=np.float32)
    
    tts_end = time.time()
    print(f"TTS processing completed (Time taken: {tts_end - tts_start:.4f}s)")
    
    # Play audio
    sd.play(audio_np, samplerate=sample_rate, blocking=False)
    sd.wait()  # Wait for playback to complete
    
    return jsonify({"message": "Speech played successfully"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
