export interface AppConfig {
  OLLAMA_BASE_URL: string;
  MODEL_NAME: string;
  RECORDINGS_DIR: string;
  APPLICATION_PORT: number;
  DEBUG: boolean;
  TRANSCRIPTION_SERVER_ENDPOINT: string;
  VOICE_SYNTHESIS_SERVER_ENDPOINT: string;
}
