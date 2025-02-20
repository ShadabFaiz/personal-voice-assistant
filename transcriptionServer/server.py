from fastapi import FastAPI, Request
import io
import numpy as np
import torch
import torchaudio
import logging
import faster_whisper

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize FastAPI app
app = FastAPI()

# Load Faster-Whisper model
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = faster_whisper.WhisperModel("small", device=DEVICE)

def load_audio(audio_bytes: bytes):
    """Convert raw audio bytes into a waveform tensor."""
    try:
        audio_buffer = io.BytesIO(audio_bytes)
        waveform, sample_rate = torchaudio.load(audio_buffer)
        return waveform, sample_rate
    except Exception as e:
        logging.error("Failed to load audio", exc_info=True)
        raise ValueError("Invalid audio data") from e

def transcribe_audio(waveform: torch.Tensor):
    """Run Faster-Whisper transcription on a waveform tensor."""
    segments, _ = model.transcribe(waveform.numpy(), language="en")
    transcript_text = " ".join(segment.text for segment in segments)
    return transcript_text

@app.post("/transcript")
async def transcript(request: Request):
    """API endpoint to process audio and return transcription."""
    try:
        # Read and validate audio data
        audio_data = await request.body()
        if not audio_data:
            logging.warning("Received empty audio buffer")
            return {"error": "No audio data received"}

        logging.info(f"Processing audio buffer of size: {len(audio_data)} bytes")

        # Convert bytes to waveform
        waveform, sample_rate = load_audio(audio_data)

        # Perform transcription
        transcript_text = transcribe_audio(waveform)

        logging.info(f"Transcription completed: {transcript_text[:50]}...")

        return {"transcript": transcript_text}

    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        logging.exception("Unexpected error during transcription")
        return {"error": "Internal server error"}
