# AI-Voice Assistant (Self Hosted everything)

**GOAL:** Develop a Self hosted Voice Assistant application with a self hosted AI or any cloud LLM in real time. Everything needs to be self hosted, and in real time.You will be interacting the LLM using voice instead of typings.

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
8. [Apis](mainServer/APIs.md)


## NVCC required for voice interaction
nvcc install
1. wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
2. sudo dpkg -i cuda-keyring_1.0-1_all.deb
3. sudo apt update


# Project Setup
This project is divded into 3 sub project.
### 1. mainServer
   This is the main server. All the core logic / tools calling / lllm interaction resides here.

### 2. transcriptServer
This is where STT operation is performed.

### 3. voiceSynthesis
This is where TTS operation is performed.  


----

   ### Prerequisite
   1. node 20+
   2. yarn
   3. nvcc 12.6
   4. python v3.11
   5. libcudnn9-cuda-12 (if you are going to use cuda)



   ### mainApp
   1. ```cd mainApp```
   2. ```yarn install ```
   3. ```npm run start:dev ```
   
   ### transcriptionService
   1. ``` cd transcriptionServer```
   2. ``` python3.11 -m venv venv3.11 ```
   3. ``` source venv3.11/bin/activate ```
   4. ``` sh install.sh ```

   ### voiceSyntesis
   1. ``` sudo apt install espeak-ng ```
   1. ``` cd voiceSyntesis/coquiTTS ```
   2. ``` python3.11 -m venv venv3.11 ```
   3. ``` source venv3.11/bin/activate ```
   4. ``` sh install.sh ```

----

## How to run it
After all installation are done:
   ### mainServer
      1. `npm run start:dev`
   ### transcriptionService
      1. cd transcriptionService
      2. python3.11 -m venv venv3.11 
      3. source venv3.11/bin/activate
      4. bash serve.sh
      
   ### VoiceSynthesis
      1. cd voiceSynthesis/coquiTTS
      2. python3.11 -m venv venv3.11
      3. `cd vits`
      4. `bash serve.sh`

      *NOTE: use vits as it is the onlyone that can be used for real time.

# APIs
1. For voice chat: http://localhost:3000/voiceChat/start (not working)
2. For text chat: http://localhost:3000/llm/chat


### FAQ
   1. How do i talk to LLM?
      Ans: 
      1. Start all 3 apps: mainServer, transcriptionServer and voiceSynthesis app.
      2. From cli, make a curl request
         `curl -X GET http://localhost:3000/voiceChat/start`
         This will start voice recording. It will stop if there is silence for 5 sec.
         Then audio will be transcripted and send to llm, then send to voice synthesis and response from llm
         will be converted to audio and played.
   2. `sudo apt-get install libcudnn9-cuda-12`
