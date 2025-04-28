import { AppConfig } from './configuration.interface';

export default (): AppConfig => ({
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  MODEL_NAME: process.env.MODEL_NAME || 'default-model',
  RECORDINGS_DIR: process.env.RECORDINGS_DIR || 'recordings',
  APPLICATION_PORT: parseInt(process.env.APPLICATION_PORT || '') || 3000,
  DEBUG: Boolean(process.env.DEBUG === 'true') || false,
  TRANSCRIPTION_SERVER_ENDPOINT:
    process.env.TRANSCRIPTION_SERVER_ENDPOINT || '',
  VOICE_SYNTHESIS_SERVER_ENDPOINT:
    process.env.VOICE_SYNTHESIS_SERVER_ENDPOINT || '',
  AGENT_PERSONALITY: process.env.AGENT_PERSONALITY || 'LEENA',
  SYSTEM_PROMPTS_DIRECTORY:
    process.env.SYSTEM_PROMPTS_DIRECTORY || 'systemPrompts',
  AGENT_PERSONALITIES_DIRECTORY:
    process.env.AGENT_PERSONALITY_DIRECTORY || 'personalities',
});
