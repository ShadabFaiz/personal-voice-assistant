import torch
import logging
import time
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Overall execution timer
total_start_time = time.time()

# Detect device
device = "cuda:0" if torch.cuda.is_available() else "cpu"
logging.info(f"Using device: {device}")

# Model loading timer
model_load_start = time.time()
model_name = "parler-tts/parler-tts-mini-v1"
logging.info("Loading model...")
model = ParlerTTSForConditionalGeneration.from_pretrained(model_name)
model.to(device)
model_load_end = time.time()
logging.info(f"Model loaded in {model_load_end - model_load_start:.2f} seconds.")

# Tokenizer loading timer
tokenizer_load_start = time.time()
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer_load_end = time.time()
logging.info(f"Tokenizer loaded in {tokenizer_load_end - tokenizer_load_start:.2f} seconds.")

# Define input text
prompt = "Hey, how are you doing today?"
actor = "Alisa"
description = f"{actor}'s voice is full with excitement."

# Tokenization timer
tokenization_start = time.time()
input_ids = tokenizer(description, return_tensors="pt", padding=True).input_ids.to(device)
prompt_input_ids = tokenizer(prompt, return_tensors="pt", padding=True).input_ids.to(device)
tokenization_end = time.time()
logging.info(f"Tokenization completed in {tokenization_end - tokenization_start:.2f} seconds.")

# Speech generation timer
generation_start = time.time()
logging.info("Generating speech...")
with torch.no_grad():  # Disable gradients to save memory
    generation = model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids)
generation_end = time.time()
logging.info(f"Speech generation completed in {generation_end - generation_start:.2f} seconds.")

# Convert output to numpy and save
saving_start = time.time()
logging.info("Saving generated speech...")
audio_arr = generation.cpu().numpy().squeeze()
output_file = f"{actor}_parler_tts_out.wav"
sf.write(output_file, audio_arr, model.config.sampling_rate)
saving_end = time.time()
logging.info(f"Audio file saved in {saving_end - saving_start:.2f} seconds.")

# Total execution time
total_end_time = time.time()
total_elapsed_time = total_end_time - total_start_time
logging.info(f"Total execution time: {total_elapsed_time:.2f} seconds.")
