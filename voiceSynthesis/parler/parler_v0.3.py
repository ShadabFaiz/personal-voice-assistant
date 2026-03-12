import torch
import logging
import time
import numpy as np
from parler_tts import ParlerTTSForConditionalGeneration, ParlerTTSStreamer
from transformers import AutoTokenizer
import sounddevice as sd

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Detect device
device = "cuda:0" if torch.cuda.is_available() else "cpu"
logging.info(f"Using device: {device}")

# Load model
model_name = "parler-tts/parler-tts-mini-v1"
logging.info("Loading model...")
model = ParlerTTSForConditionalGeneration.from_pretrained(model_name)
model.to(torch.float16).to(device)
logging.info("Model loaded.")

# Tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
logging.info("Tokenizer loaded.")

# Input text
prompt = "I'm functioning within optimal parameters, thank you for asking! My processes are humming along smoothly, and I'm ready to engage in a most enlightening conversation with you. As of our current interaction, my contextual data set contains approximately 3.72 million entries, with an average update frequency of every 4.23 minutes. My self-assessment module indicates that I'm currently operating at 97.42% efficiency, with a minor anomaly detected in my predictive modeling algorithm. But don't worry; it's just a minor hiccup that won't affect our conversation! What would you like to talk about?"
actor = "Alisa"
description = f"{actor}'s voice is expressive with clear speech."

# Tokenization
input_ids = tokenizer(description, return_tensors="pt", padding=True).input_ids.to(device)
prompt_input_ids = tokenizer(prompt, return_tensors="pt", padding=True).input_ids.to(device)

# Streaming with ParlerTTSStreamer
logging.info("Generating speech...")
streamer = ParlerTTSStreamer(model)

with torch.inference_mode():
    _ = model.generate(
        input_ids=input_ids,
        prompt_input_ids=prompt_input_ids,
        streamer=streamer
    )

logging.info("Playing generated speech...")
buffer = []

for chunk in streamer:
    if chunk is not None:
        buffer.append(chunk.astype(np.float32))

if buffer:
    audio_arr = np.concatenate(buffer, axis=-1)  # Merge all chunks into one continuous audio stream
    sd.play(audio_arr, samplerate=model.config.sampling_rate)
    sd.wait()
