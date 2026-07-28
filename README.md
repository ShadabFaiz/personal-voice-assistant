# AI-Voice Assistant (Self Hosted everything)

**GOAL:** Develop a self-hosted Voice Assistant application with a self-hosted AI or any cloud LLM in real-time. Everything needs to be self-hosted, and in real-time. You will interact with the LLM using your voice instead of typing.

### [Roadmap](Roadmap.md)  
### [Changelogs](CHANGELOGS.md)  

## Supported Tools
1. [FileTool](mainServer/src/modules/core/tools/fileTool/specification.md)
2. [LocationTool](mainServer/src/modules/core/tools/locationTool/specification.md)
3. [DateTimeTool](mainServer/src/modules/core/tools/dateTimeTools/specification.md)
4. [GmailTool](mainServer/src/modules/core/tools/gmail/specification.md)
5. BraveSearchTool
6. DuckDuckGoSearchTool
7. WebPageFetcherTool
8. [BrowserAutomationTool](mainServer/src/modules/core/tools/browserAutomationTool/description.ts)
9. [Apis](mainServer/APIs.md)

## NVCC required for voice interaction
1. `wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb`
2. `sudo dpkg -i cuda-keyring_1.0-1_all.deb`
3. `sudo apt update`

# Project Setup
This project is divided into 3 sub-projects:

### 1. mainServer
This is the main backend server. All core logic, tool execution, and LLM interaction resides here.

### 2. transcriptionServer
This is where STT (Speech-to-Text) operation is performed.

### 3. voiceSynthesis
This is where TTS (Text-to-Speech) operation is performed.  

----

### Prerequisites
- **mainServer**: Node 20+, Yarn, Docker (recommended)
- **voiceSynthesis / transcriptionServer**: Python v3.11, NVCC 12.6, libcudnn9-cuda-12 (for CUDA capabilities), `espeak-ng`

---

## Installation & How to Run

### Docker Setup (Recommended for mainServer)
To quickly spin up the `mainServer` without worrying about local Node versions, you can use Docker Compose:
```bash
docker-compose up -d --build
```
> **Note**: Custom User-Defined Prompts are natively stored in your local computer's primary App Data directory (e.g., MacOS `Application Support` or Linux `~/.local/share`).

### 1. mainServer (Local Setup)
```bash
cd mainServer
yarn install 
npm run start:dev 
```

### 2. transcriptionService
```bash
cd transcriptionServer
python3.11 -m venv venv3.11 
source venv3.11/bin/activate 
sh install.sh 
bash serve.sh
```

### 3. voiceSynthesis
```bash
sudo apt install espeak-ng 
cd voiceSynthesis/coquiTTS 
python3.11 -m venv venv3.11 
source venv3.11/bin/activate 
sh install.sh
cd vits
bash serve.sh
```
> *NOTE: use `vits` as it is the only one that can be used for true real-time generation.*

----

# APIs
1. For voice chat: `http://localhost:3000/voiceChat/start` *(See FAQ for usage)*
2. For text chat: `http://localhost:3000/llm/chat`

### FAQ
**1. How do I talk to the LLM?**
* **Ans:** 
  1. Start all 3 apps: `mainServer`, `transcriptionServer`, and `voiceSynthesis` app.
  2. From your terminal, make a curl request:
     ```bash
     curl -X GET http://localhost:3000/voiceChat/start
     ```
  This will start voice recording. It will automatically stop if silence is detected for 5 seconds. The audio will then be transcribed and sent to the LLM. The LLM's response will instantly be converted back to audio and played out loud.

**2. How do I install CUDA dependencies?**
* **Ans:** Run the command: `sudo apt-get install libcudnn9-cuda-12`
