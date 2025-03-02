import numpy as np
import sounddevice as sd
import io
import wave
import time
from piper import PiperVoice

# Load Piper voice model
start_time = time.time()
speaker="kristin"
voice = PiperVoice.load(f"testing/piper_voices/{speaker}/voice.onnx")
print(f"Model loaded in {time.time() - start_time:.2f} seconds")

# Text to synthesize
text = "I'm functioning within optimal parameters, thank you for asking! My processes are humming along smoothly, and I'm ready to engage in a most enlightening conversation with you. As of our current interaction, my contextual data set contains approximately 3.72 million entries, with an average update frequency of every 4.23 minutes. My self-assessment module indicates that I'm currently operating at 97.42% efficiency, with a minor anomaly detected in my predictive modeling algorithm. But don't worry; it's just a minor hiccup that won't affect our conversation! What would you like to talk about?."

# Create an in-memory buffer
buffer = io.BytesIO()

# Generate speech and write to buffer
synthesis_start = time.time()
with wave.open(buffer, "wb") as wav_file:
    wav_file.setnchannels(1)  # Mono audio
    wav_file.setsampwidth(2)  # 16-bit audio (2 bytes per sample)
    wav_file.setframerate(voice.config.sample_rate)  # Use Piper's sample rate
    voice.synthesize(text, wav_file)
print(f"Synthesis completed in {time.time() - synthesis_start:.2f} seconds")

# Read raw audio from buffer
buffer.seek(0)  # Reset buffer position
with wave.open(buffer, "rb") as wav_file:
    sample_rate = wav_file.getframerate()
    audio_data = np.frombuffer(wav_file.readframes(wav_file.getnframes()), dtype=np.int16)

# Normalize audio for playback (-1.0 to 1.0)
audio_data = audio_data.astype(np.float32) / 32768.0

# Play audio
print("Playing audio...")
playback_start = time.time()
sd.play(audio_data, samplerate=sample_rate)
sd.wait()
print(f"Playback completed in {time.time() - playback_start:.2f} seconds")

print("Playback complete.")
