# AI-VoiceChat (Self Hosted everything)

**GOAL:** Develop a Self hosted Voice Chat application with a self hosted AI in real time. Everything needs to be self hosted, and in real time.You will be interacting the LLM using voice instead of typings.


nvcc install
1. wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
2. sudo dpkg -i cuda-keyring_1.0-1_all.deb
3. sudo apt update


## Project Setup

   ### Prerequisite
   1. node 20+
   2. yarn
   3. nvcc 12.6

   ### mainApp
   1. ```cd mainApp```
   2. ```yarn install ```
   3. ```npm run start:dev ```
   
   ### transcriptionService
   1. ``` cd transcriptionServer```
   2. ``` python3.11 -m venv venv3.11 ```
   3. ``` source venv3.11/bin/activate ```
   4. ```./install```

   ### voiceSyntesis
   1. ``` sudo apt install espeak-ng ```
   1. ``` cd voiceSyntesis```
   2. ``` python3.11 -m venv venv3.11 ```
   3. ``` source venv3.11/bin/activate ```
   4. ```./install```

----

## How to run it
After all installation are done:
   ### nestjsApp
      1. `npm run start:dev`
   ### transcriptionService
      1. cd transcriptionService
      2. python3.11 -m venv venv3.11 
      3. source venv3.11/bin/activate
      4. bash serve.sh
      
   ### VoiceSynthesis
      1. cd voiceSynthesis/styleTTS2
      2. python3.11 -m venv venv3.11
      3. source venv3.11/bin/activate
      4. python vits/server.py
      5. sh ./install.sh
      6. inside vits or xttsv2, bash serve.sh
      *NOTE: use vits as it is the onlyone that can be used for real time.

### v0.0.1 (Self host Ollama)

1. Self host Ollama on windows/WSL with any model. This model will be used for interaction. It may be switched to different model later.
2. Test it.

---

### v0.0.2 (Accessing Ollama from WSL 2)

1. Start Ollama with env host to 0.0.0.0 so that request coming from WSL 2 will be accepted.
2. serve ollama with the updated env.
3. Find windows IP from WSL 2. We will need to use this ip to interact with ollama.
4. Test if we can communicate with ollama api from WSL 2 cli. (try to hit any ollam api from cli).

---

### v0.0.3 (Starting a Nestjs ~project)

1. Start a nestjs project on WSL 2.
2. Create a module **Ollama**.
3. Create controller / services for it.
4. Connect with ollama running on windows 10. (NOTE: the endpoint needs to be of the windows machine, not `localhost:11434`.)
5. Create an endpoint POST `/ollama/chat` with body `{ prompt: 'Howdy!! }`.
6. Pass the prompt to ollama.
7. Stream ollama response back to client instead of waiting for complete response.
8. Test it

---

### v.0.0.4 (Audio pass-through between windows and WSL 2)

1. Setup PulseAudio on windows to allow audio pass-through from windows to WSL 2.
2. Install Sox / arecode in WSL 2 to receive audio from pulseAudio.
3. Test it.

---

### v0.0.5 (Implementing audio recording)

1. Create a new module **VoiceChat**. All the voice chat related code (audio recording / streaming / processing / STT etc ) will be done here.
2. Create an endpoint GET `/voice/chat`.
3. Integrated npm package **Mic** here to capture audio, and stream it to a file.
4. Test it.

---

### v0.0.6 (Integrating any STT)

1. Integrate real-time Speech to Text. (can be within same application or host a sperate server for it.)
   1. Using cloud service (Not a option since it has to be self hosted)
   2. Using Pre-existing solution that convert audio to text in real time. Host them locally on a server.
2. Integrated STT using PicoVoice Cheetah. ( TODO: replace it with Faster Whisper)
3. Integrated the complete flow (Audio Recording => Trancription => Prompt LLM with transcript => Respond back to user)

---

### v0.0.7 (Replacing PicoVoice with local STT) (TODO)

PicoVoice requires an api key from picoVoice service. This is against the idea of the self hosting. It shouldn't depend on any other 3rd party.
1. Restructing project structure to manage all different service (app / transcription server / etc) within same repository.
2. Replace picoVoice Cheetah with Faster-Whisper for transcription.
NOTE**: Currently transcription is processed on cpu, not on gpu. TODO: Make it work on cuda

---

### v0.0.8 (Added new voice synthesis options)
1. Added coquiTTS
1. Added parlerTTS
---

### v0.0.9 (Replaced picoVoice with coquieTTS VITS model)
1. Replaced picoVoice with coquiTTS VIT models
---

### v0.0.10 (Added Female personality)
1. Added systemPrompt/personalities/Leena.txt
---

### v0.0.11 (Testing other TTS)
1. Testing piperTTS (very fast. Highly viable for real-time)
---
