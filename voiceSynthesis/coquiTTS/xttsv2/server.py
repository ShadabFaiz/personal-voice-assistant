from flask import Flask, request, jsonify, send_file
import torch
import time
from TTS.api import TTS
import numpy as np
import sounddevice as sd


app = Flask(__name__)

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device selected: {device}")

# Initialize TTS model
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# List speakers
# speakers = ["Alexandra Hisakawa"]
# speakers = ["Badr Odhiambo"] # female
# speakers = ["Craig Gutsy"] # Aged Male
# speakers = ["Damien Black"] # Male
speakers = ["Ferran Simen"] # Male

def generate_speech(text, speaker, language="en"):
    """Generate speech from text using the TTS model."""
    tts_start = time.time()
    audio = tts.tts(text=text, speaker=speaker, language=language)    
    tts_end = time.time()
    print(f"TTS processing completed (Time taken: {tts_end - tts_start:.4f}s)")
    return audio

@app.route("/voice/synthesize", methods=["POST"])
def synthesize():
    """API endpoint to generate speech from text."""
    data = request.json
    text = data.get("text")
    
    speaker = data.get("speaker", speakers[0])  # Default speaker
    language = data.get("language", "en")

    if not text:
        return jsonify({"error": "Text input is required."}), 400

    print(f"Text received: {text}")

    try:
        audio = generate_speech(text, speaker, language)
        audio_np = np.array(audio, dtype=np.float32)
        # Play audio directly
        sd.play(audio_np, samplerate=22050)
        sd.wait()  # Wait until playback is finished

        
        return jsonify({"message": "Done"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
