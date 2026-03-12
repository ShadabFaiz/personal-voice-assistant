import torch
from TTS.api import TTS
import os

# List of English female voice models
# female_models = [
#     "tts_models/en/ljspeech/tacotron2-DDC",
#     "tts_models/en/ljspeech/tacotron2-DDC_ph",
#     "tts_models/en/ljspeech/glow-tts",
#     "tts_models/en/ljspeech/speedy-speech",
#     "tts_models/en/ljspeech/tacotron2-DCA",
#     "tts_models/en/ljspeech/vits",
#     "tts_models/en/ljspeech/vits--neon",
#     "tts_models/en/ljspeech/fast_pitch",
#     "tts_models/en/ljspeech/overflow",
#     "tts_models/en/ljspeech/neural_hmm",
#     "tts_models/en/jenny/jenny",
#     "tts_models/en/sam/tacotron-DDC",
#     "tts_models/en/blizzard2013/capacitron-t2-c50",
#     "tts_models/en/blizzard2013/capacitron-t2-c150_v2"
# ]

female_models = [
   "tts_models/multilingual/multi-dataset/xtts_v2"
]

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"

# Output directory
output_dir = "generated_voices"
os.makedirs(output_dir, exist_ok=True)

print(TTS().list_models())

# Generate speech for each model
for model in female_models:
    print(f"Processing model: {model}")
    try:
        tts = TTS(model).to(device)
        print(tts.speakers)
        model_name = model.split('/')[-1]
        output_filename = os.path.join(output_dir, f"{model_name}.wav")
        tts.tts_to_file(
            text="Please use our dedicated channels for questions and discussion. Help is much more valuable if it's shared publicly so that more people can benefit from it..",
            file_path=output_filename,
            speaker="Claribel Dervla",
            language="en"
        )
        print(f"Generated: {output_filename}")
    except Exception as e:
        print(f"Error with model {model}: {e}")