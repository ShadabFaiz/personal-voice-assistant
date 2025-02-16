curl --no-buffer -X POST http://localhost:3000/ollama/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt": "tell me about yourself.. what is your name / who developed you. your technical details etc"}'
