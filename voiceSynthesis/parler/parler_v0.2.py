import torch
import logging
import time
import numpy as np
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import sounddevice as sd
torch.backends.cudnn.benchmark = True



# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Overall execution timer
total_start_time = time.time()

# Detect device
device = "cuda:0" if torch.cuda.is_available() else "cpu"

logging.info(f"Using device: {device}")

# Model loading timer
model_load_start = time.time()
# model_name = "parler-tts/parler-tts-mini-v1"
model_name = "parler-tts/parler-tiny-v1-jenny"

logging.info("Loading model...")
model = ParlerTTSForConditionalGeneration.from_pretrained(model_name)
model.to(torch.float16).to(device)
model_load_end = time.time()
logging.info(f"Model loaded in {model_load_end - model_load_start:.2f} seconds.")

# Only use if PyTorch 2.0+ is installed
if hasattr(torch, "compile"):
    model = torch.compile(model)

# Tokenizer loading timer
tokenizer_load_start = time.time()
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer_load_end = time.time()
logging.info(f"Tokenizer loaded in {tokenizer_load_end - tokenizer_load_start:.2f} seconds.")

# Define input text
prompt = "Here's a simple Python script to generate speech using Coqui TTS with a pretrained model. This script:"
actor = "Alisa"
description = f"{actor}'s voice is very expressive and clear speech with a moderate speed and pitch. The recording is of high quality, with the speaker's voice sounding clear and very close up"

# Tokenization timer
tokenization_start = time.time()
input_ids = tokenizer(description, return_tensors="pt", padding=True).input_ids.to(device)
attention_mask = (input_ids != tokenizer.pad_token_id).to(device)

prompt_input_ids = tokenizer(prompt, return_tensors="pt", padding=True).input_ids.to(device)
prompt_attention_mask = (prompt_input_ids != tokenizer.pad_token_id).to(device)

tokenization_end = time.time()
logging.info(f"Tokenization completed in {tokenization_end - tokenization_start:.2f} seconds.")

# Speech generation timer
generation_start = time.time()
logging.info("Generating speech...")
with torch.inference_mode():  # Disable gradients to save memory
    generation = model.generate(
        input_ids=input_ids,
        attention_mask=attention_mask,
        prompt_input_ids=prompt_input_ids,
        prompt_attention_mask=prompt_attention_mask
    )
generation_end = time.time()
logging.info(f"Speech generation completed in {generation_end - generation_start:.2f} seconds.")

# Convert output to numpy
logging.info("Playing generated speech...")
audio_arr = generation.cpu().numpy().squeeze()

# Play the generated speech using sounddevice
audio_arr = audio_arr.astype(np.float32)  # Correct way for NumPy
sd.play(audio_arr, samplerate=model.config.sampling_rate)
sd.wait()  # Wait until audio finishes playing


# Total execution time
total_end_time = time.time()
total_elapsed_time = total_end_time - total_start_time
logging.info(f"Total execution time: {total_elapsed_time:.2f} seconds.")
