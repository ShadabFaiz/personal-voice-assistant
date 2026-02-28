export type SearchEngine = 'brave' | 'google';

export const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';
export const DEFAULT_MODEL_NAME = 'default-model';
export const DEFAULT_RECORDINGS_DIR = 'recordings';
export const DEFAULT_APPLICATION_PORT = 3000;
export const DEFAULT_AGENT_PERSONALITY = 'LEENA';
export const DEFAULT_SYSTEM_PROMPTS_DIRECTORY = 'systemPrompts';
export const DEFAULT_AGENT_PERSONALITIES_DIRECTORY = 'personalities';
export const DEFAULT_ABOUT_ME_FILE_NAME = 'aboutMe.txt';
export const DEFAULT_GOOGLE_GEMINI_API_KEY = 'dummy';
export const DEFAULT_GEMINI_MODEL = 'dummy';
export const DEFAULT_BRAVE_SEARCH_API_KEY = 'mock-api-key';
export const DEFAULT_BRAVE_SEARCH_API_URL = 'https://api.search.brave.com/res/v1/web/search';
export const DEFAULT_SEARCH_ENGINE: SearchEngine = 'google';
