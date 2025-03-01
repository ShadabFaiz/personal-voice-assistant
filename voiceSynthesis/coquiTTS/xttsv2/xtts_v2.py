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
# speakers = ["Alexandra Hisakawa"]
# speakers = ["Badr Odhiambo"] # female
# speakers = ["Craig Gutsy"] # Aged Male
# speakers = ["Damien Black"] # Male
speakers = ["Ferran Simen"] # Male



speaker_list_end = time.time()
print(f"Available speakers: {speakers} (Time taken: {speaker_list_end - speaker_list_start:.4f}s)")

for speaker in speakers:
    print(f"Generating speech for speaker: {speaker}")
    
    tts_start = time.time()

    # Generate TTS audio (returns a list of float values)
    audio = tts.tts(
        text="I'm functioning within optimal parameters, thank you for asking! My processes are humming along smoothly, and I'm ready to engage in a most enlightening conversation with you. As of our current interaction, my contextual data set contains approximately 3.72 million entries, with an average update frequency of every 4.23 minutes. My self-assessment module indicates that I'm currently operating at 97.42% efficiency, with a minor anomaly detected in my predictive modeling algorithm. But don't worry; it's just a minor hiccup that won't affect our conversation! What would you like to talk about?",
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
