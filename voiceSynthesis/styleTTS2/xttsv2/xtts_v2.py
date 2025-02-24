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

# Initialize TTS
model_init_start = time.time()
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
model_init_end = time.time()
print(f"Model initialized (Time taken: {model_init_end - model_init_start:.4f}s)")

# List speakers
speaker_list_start = time.time()
speakers = ["Alexandra Hisakawa"]
# speakers = ["Badr Odhiambo"]
# speakers = ["Craig Gutsy"]
# speakers = ["Damien Black"]
# speakers = ["Ferran Simen"]



speaker_list_end = time.time()
print(f"Available speakers: {speakers} (Time taken: {speaker_list_end - speaker_list_start:.4f}s)")

for speaker in speakers:
    print(f"Generating speech for speaker: {speaker}")
    
    tts_start = time.time()

    # Generate TTS audio (returns a list of float values)
    audio = tts.tts(
        text="This will help you analyze performance, especially when running on CPU vs GPU.",
        speaker=speaker,
        language="en"
    )

    # Convert list to NumPy array
    audio_np = np.array(audio, dtype=np.float32)
    
    tts_end = time.time()
    print(f"TTS processing completed (Time taken: {tts_end - tts_start:.4f}s)")

    # Play audio directly
    sd.play(audio_np, samplerate=22050)
    sd.wait()  # Wait until playback is finished



# Total execution time
end_time = time.time()
print(f"Total execution time: {end_time - start_time:.4f}s")
