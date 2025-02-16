# VoiceChat-AI (Self Hosted everything)
Self hosted Voice Chat interaction with a self hosted AI in real time. Everything needs to be self hosted.

### v0.0.1 (Self host Ollama)
1. Self host Ollama on windows/WSL with any model. This model will be used for interaction. It may be switched to different model later.
2. Test it.

___

### v0.0.2 (Accessing Ollama from WSL 2)
1. Start Ollama with env host to 0.0.0.0 so that request coming from WSL 2 will be accepted.
2. serve ollama with the updated env.
3. Test if we can communicate with ollama api from WSL 2.

___

### v0.0.3 (Starting a Nestjs project)
1. Start a nestjs project on WSL 2.
2. Create a module **Ollama**.
3. Connect with ollama running on windows 10.
4. Create an endpoint POST `/ollama/chat` with body `{ prompt: 'Howdy!! }`.
5. Pass the prompt to ollama.
6. Stream ollama response back to client instead of waiting for complete response.
7. Test it

___

### v.0.0.4 (Audio pass-through between windows and WSL 2)
1. Setup PulseAudio on windows to allow audio pass-through from windows to WSL 2.
2. Install Sox / arecode in WSL 2 to receive audio from pulseAudio.
3. Test it.

___

### v0.0.5 (Implementing audio recording)
1. Create a new module **VoiceChat**. All the voice chat related code (audio recording / streaming / processing / STT etc ) will be done here.
2. Create an endpoint GET `/voice/chat`.
3. Integrated npm package **Mic** here to capture audio, and stream it to a file.
4. Test it.

___

### v0.0.6 (Integrating any STT)
1. Integrate real-time Speech to text. (can be within same application or host a sperate server for it.)

___

