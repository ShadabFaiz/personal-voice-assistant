# AI-chat (Self Hosted everything)
Self hosted Voice Chat interaction with a self hosted AI in real time. Everything needs to be self hosted.

# v 0.0.1
1. Self host Ollama on windows/WSL with any model. This model will be used for interaction. It may be switched to different model later.
2. Setup PulseAudio on windows to allow audio pass-through from windows to WSL 2.
3. Install Sox / arecode in WSL 2 to receive audio from pulseAudio.
4. Test it.


# v 0.0.2

1. Start a nestjs project on WSL 2.
2. Create a module **Ollama**.
3. Connect with ollama running on windows 10.
4. Create an endpoint POST `/ollama/chat` with body `{ prompt: 'Howdy!! }`.
5. Pass the prompt to ollama.
6. Stream ollama response back to client instead of waiting for complete response.
7. Test it

# v 0.0.3
1. Create a new module **VoiceChat**. All the voice chat related code (audio recording / streaming / processing / STT etc ) will be done here.
2. Create an endpoint GET `/voice/chat`.
3. Integrated npm package **Mic** here to capture audio, and stream it to a file.
4. Test it.
   
