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

# Initialize VITS TTS
model_init_start = time.time()
tts = TTS("tts_models/en/ljspeech/vits").to(device)  # Using VITS model
model_init_end = time.time()
print(f"Model initialized (Time taken: {model_init_end - model_init_start:.4f}s)")

# Ensure correct sample rate
sample_rate = 22050  # VITS models typically use 22050Hz

# Generate speech
tts_start = time.time()
text = "I'm functioning within optimal parameters, thank you for asking! My processes are humming along smoothly, and I'm ready to engage in a most enlightening conversation with you. As of our current interaction, my contextual data set contains approximately 3.72 million entries, with an average update frequency of every 4.23 minutes. My self-assessment module indicates that I'm currently operating at 97.42% efficiency, with a minor anomaly detected in my predictive modeling algorithm. But don't worry; it's just a minor hiccup that won't affect our conversation! What would you like to talk about?"

audio = tts.tts(text=text, use_phonemes=False)  # Generate speech

# Convert to NumPy array
audio_np = np.array(audio, dtype=np.float32)

tts_end = time.time()
print(f"TTS processing completed (Time taken: {tts_end - tts_start:.4f}s)")

# Play audio
sd.play(audio_np, samplerate=sample_rate, blocking=False)
sd.wait()  # Wait for playback to complete

# Total execution time
end_time = time.time()
print(f"Total execution time: {end_time - start_time:.4f}s")
