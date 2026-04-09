# APIs

This document lists all available API endpoints.

---

## 1. POST: `/llm/chat`

Send a text prompt to the LLM and receive a response. The response is streamed back as plain text.

### Request Body

| Field    | Type   | Required | Description          |
| -------- | ------ | -------- | -------------------- |
| `prompt` | string | Yes      | The message to send. |

### Example

```bash
curl -X POST http://localhost:3000/llm/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the weather in Patna today?"}'
```

### Response

Plain text response from the LLM.

---

## 2. GET `/voiceChat/start`

Start a voice chat session. The server begins recording audio from the microphone, transcribes it, sends the transcription to the LLM, synthesizes the response, and streams back the audio.

### Example

```bash
curl http://localhost:3000/voiceChat/start
```

### Response

Audio stream of the synthesized LLM response.
