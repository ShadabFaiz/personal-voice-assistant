import { AppConfig } from './configuration.interface';

export default (): AppConfig => ({
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  MODEL_NAME: process.env.MODEL_NAME || 'default-model',
  RECORDINGS_DIR: process.env.RECORDINGS_DIR || 'recordings',
  APPLICATION_PORT: parseInt(process.env.APPLICATION_PORT || '') || 3000,
});
