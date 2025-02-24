import torch
import time
from TTS.api import TTS
import numpy as np
import sounddevice as sd

# Start timing
start_time = time.time()

# Get device
device_start = time.time()
device = "cuda" if torch.cuda.is_available() else "cpu"
device_end = time.time()
print(f"Device selected: {device} (Time taken: {device_end - device_start:.4f}s)")

# Initialize FastSpeech2 TTS
model_init_start = time.time()
tts = TTS("tts_models/en/ljspeech/fast_pitch").to(device)  # Use FastSpeech2 (FastPitch)
model_init_end = time.time()
print(f"Model initialized (Time taken: {model_init_end - model_init_start:.4f}s)")

# Ensure correct sample rate
sample_rate = 22050  # FastSpeech2 models often use 22050Hz

# Generate speech
tts_start = time.time()
text = "Here's your updated code using FastSpeech2 without streaming. It ensures correct text processing, handles sample rate, and avoids ALSA underruns."

audio = tts.tts(text=text, use_phonemes=False)  # Ensure text processing

# Convert to NumPy array
audio_np = np.array(audio, dtype=np.float32)

tts_end = time.time()
print(f"TTS processing completed (Time taken: {tts_end - tts_start:.4f}s)")

# Play audio without streaming
sd.play(audio_np, samplerate=sample_rate, blocking=False)
sd.wait()  # Wait for playback to complete

# Total execution time
end_time = time.time()
print(f"Total execution time: {end_time - start_time:.4f}s")
