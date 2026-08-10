# AI-Voice Assistant (Self Hosted everything)

**GOAL:** Develop a self-hosted Voice Assistant application with a self-hosted AI or any cloud LLM in real-time. Everything needs to be self-hosted, and in real-time. You will interact with the LLM using your voice or typing through 
integration platofrms such as WhatsApp.

### [Roadmap](Roadmap.md)  
### [Changelogs](CHANGELOGS.md)  

# Project Structure
This project is divided into 3 sub-projects:
### 1. mainServer
This is the central backend server. All core logic, tool execution, and LLM interaction resides here.

### 2. transcriptionServer (deprecated - need to revisit)
This is where STT (Speech-to-Text) operation is performed.

### 3. voiceSynthesis (deprecated - need to revisit)
This is where TTS (Text-to-Speech) operation is performed.  

----

### Prerequisites
- **mainServer**: Node 20+, Yarn, Docker (recommended)
- **voiceSynthesis / transcriptionServer**: Python v3.11, NVCC 12.6, libcudnn9-cuda-12 (for CUDA capabilities), `espeak-ng`. Ignore this section for now.


## Supported Tools
Following tools are supported till now:
1. [FileTool](mainServer/src/modules/core/tools/fileTool/specification.md)
2. [LocationTool](mainServer/src/modules/core/tools/locationTool/specification.md)
3. [DateTimeTool](mainServer/src/modules/core/tools/dateTimeTools/specification.md)
4. [GmailTool](mainServer/src/modules/core/tools/gmail/specification.md)
5. [BraveSearchTool](mainServer/src/modules/core/tools/braveSearchTool/specification.md)
6. [DuckDuckGoSearchTool](mainServer/src/modules/core/tools/duckDuckGoSearchTool/specification.md)
7. [WebPageFetcherTool](mainServer/src/modules/core/tools/webPageFetcherTool/specification.md)
8. [BrowserAutomationTool](mainServer/src/modules/core/tools/browserAutomationTool/specification.md)
9. [MediaAnalysisTool](mainServer/src/modules/core/tools/mediaAnalysisTool/specification.md)
10. [TempMailTool](mainServer/src/modules/core/tools/tempMailTool/specification.md)
11. [Apis](mainServer/APIs.md)




## Project Setup
### 1. mainServer (Local Setup)
1. Go to mainServer directory
2. Rename `.env.example` to `.env`
3. Fill in the required values in `.env`
4. Run the following commands:

``` bash
yarn install 
npm run start:prod 
```
when running the application for the first time, WhatsApp integration will kick in and will ask you to scan a QR code to link your WhatsApp account. QR code will be print in the terminal as well as in the directory `whatsApp_setup`. This directory will be inside `mainServer` After scanning the QR code for the first time, you will be required to scan again. After that, you can restart the application. It should automatically connect to your WhatsApp account and you can start interacting with the LLM using your voice or typing through WhatsApp.

### 2. transcriptionService (deprecated - need to revisit)
``` bash
cd transcriptionServer
python3.11 -m venv venv3.11 
source venv3.11/bin/activate 
sh install.sh 
bash serve.sh
```

### 3. voiceSynthesis (deprecated - need to revisit)
``` bash
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

# APIs (Apis will no longer be support. use WhatsApp for communication with LLM)
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





## NVCC required for voice interaction
1. `wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb`
2. `sudo dpkg -i cuda-keyring_1.0-1_all.deb`
3. `sudo apt update`