import torch
import logging
import time
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
import numpy as np

torch.backends.cudnn.benchmark = True
torch.backends.cuda.matmul.allow_tf32 = True  # Enables TF32 on NVIDIA GPUs for speed-up

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Overall execution timer
total_start_time = time.time()

# Detect device and set data type
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float32  # Keeping float32 to avoid float16 issues
logging.info(f"Using device: {device} with dtype: {torch_dtype}")

# Load model
model_load_start = time.time()
model_name = "parler-tts/parler-tts-mini-v1"

logging.info("Loading model...")
model = ParlerTTSForConditionalGeneration.from_pretrained(model_name).to(device, dtype=torch_dtype)

model_load_end = time.time()
logging.info(f"Model loaded in {model_load_end - model_load_start:.2f} seconds.")

# Load tokenizer
tokenizer_load_start = time.time()
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer_load_end = time.time()
logging.info(f"Tokenizer loaded in {tokenizer_load_end - tokenizer_load_start:.2f} seconds.")

# Define input text
prompt = "Hey, how are you doing today?"
actor = "Alisa"
description = f"{actor}'s voice is full with excitement."

# Concatenate description and prompt before tokenization
full_input = f"{description} {prompt}"

# Tokenization with correct attention mask
tokenization_start = time.time()
tokens = tokenizer(full_input, return_tensors="pt", padding=True)
input_ids = tokens.input_ids.to(device)
attention_mask = tokens.attention_mask.to(device)

tokenization_end = time.time()
logging.info(f"Tokenization completed in {tokenization_end - tokenization_start:.2f} seconds.")

# **Extract prompt_hidden_states using correct method**
logging.info("Encoding input to obtain prompt_hidden_states...")
encoding_start = time.time()

with torch.inference_mode():
    encoder = model.get_encoder()  # ✅ Get encoder
    prompt_hidden_states = encoder(input_ids, attention_mask=attention_mask)[0]  # ✅ Run encoder forward pass

encoding_end = time.time()
logging.info(f"Encoding completed in {encoding_end - encoding_start:.2f} seconds.")

# Speech generation
generation_start = time.time()
logging.info("Generating speech with mixed precision...")

with torch.inference_mode(), torch.amp.autocast(device_type="cuda", dtype=torch_dtype):
    generation = model.generate(
        prompt_hidden_states=prompt_hidden_states,  # ✅ Correctly passing encoded states
        attention_mask=attention_mask
    )

generation_end = time.time()
logging.info(f"Speech generation completed in {generation_end - generation_start:.2f} seconds.")

# Convert output to numpy (ensure correct dtype)
saving_start = time.time()
logging.info("Saving generated speech...")
audio_arr = generation.cpu().numpy().squeeze().astype(np.float32)  # ✅ Convert to float32
output_file = f"{actor}_parler_tts_out.wav"
sf.write(output_file, audio_arr, model.config.sampling_rate)
saving_end = time.time()
logging.info(f"Audio file saved in {saving_end - saving_start:.2f} seconds.")

# Total execution time
total_end_time = time.time()
total_elapsed_time = total_end_time - total_start_time
logging.info(f"Total execution time: {total_elapsed_time:.2f} seconds.")
