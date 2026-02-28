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
1. TODO: Testing piperTTS (very fast. Highly viable for real-time)
---

### v0.0.12 (Testing other TTS)
1. TODO: Add Kokoro TTS. Need more testing.
2. Removed voice models in vits.
3. Added additional logs in main server.
4. Shifted system Prompts from src/systemPrompts to systemPrompts.
5. Added aboutMe.txt in systemPrompts to write about user. LLM will get information about user from this file.
6. Added SystemPromptsService. This service will load the system prompts, structure them in xml format, and the n feed it to LLM.

---

### v0.0.13 (Testing other TTS)
1. Implemented hand free audio recording. Now audio recording will start as soon as main server start. 
   No need to hit endpoint to start the conversation.
2. Shift transcription process from cpu to GPU with large-v3 faster-whisper model.
---

### v0.0.14 (LangGraph integrations)
1. Replace langchain with langGraph for better conversation handling and tools calling.
2. Integrated Date tools.
3. Disabled audio conversation for the time being.
---

### v0.0.15 (Cloud LLM integration)
1. Implemented Gemini service to interact with cloud LLMs instead of local LLMs.
2. Added GOOGLE_GEMINI_API_KEY to .env.example.
3. Renamed cloudLLM module to Gemini.
4. Updated system prompts for better interaction.

---

### v0.0.16 (Module restructuring)
1. Re-wrote modules to have better isolation as per their use-cases.
2. Renamed from voice chat to voice assistant.
3. Renamed gemini related files.
4. Commented out Ollama module as it is not being used.
5. Updated tool implementation.

---

### v0.0.17 (Core tools implementation)
1. Moved tools to core module.
2. Added location tool.
3. Added web search tools.
4. Added README.md for tools.
5. Made methods private in dateTimeTool.
6. Added more comments in .env.example to give better clarity.
7. Updated LEENA personality.

---

### v0.0.18 (Advanced tools and search integration)
1. Implemented BraveWebSearchTool.
2. Implemented GoogleWebSearchTool (renamed to DuckDuckGoWebSearchTool later).
3. Implemented WebPageFetcherTool.
4. Renamed GoogleWebSearchTool to DuckDuckGoWebSearchTool because we are using google search API through duckduckgo.
5. Replaced some logger.log with logger.debug for better logging practices.
6. Added custom CA certificate use case.
---