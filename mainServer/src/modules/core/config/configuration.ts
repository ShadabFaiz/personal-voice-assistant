export const AppConfigFunction = () =>
  ({
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    MODEL_NAME: process.env.MODEL_NAME || 'default-model',
    RECORDINGS_DIR: process.env.RECORDINGS_DIR || 'recordings',
    APPLICATION_PORT:
      Number.parseInt(process.env.APPLICATION_PORT || '') || 3000,
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
    ABOUT_ME_FILE_NAME: process.env.ABOUT_ME_FILE_NAME || 'aboutMe.txt',
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY || 'dummy',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'dummy',
    BRAVE_SEARCH_API_KEY: process.env.BRAVE_SEARCH_API_KEY || 'mock-api-key',
    BRAVE_SEARCH_API_URL:
      process.env.BRAVE_SEARCH_API_URL ||
      'https://api.search.brave.com/res/v1/web/search',
    LOCATION_CITY: process.env.LOCATION_CITY,
    LOCATION_REGION: process.env.LOCATION_REGION,
    LOCATION_REGION_CODE: process.env.LOCATION_REGION_CODE,
    LOCATION_COUNTRY: process.env.LOCATION_COUNTRY,
    LOCATION_COUNTRY_NAME: process.env.LOCATION_COUNTRY_NAME,
    LOCATION_COUNTRY_CODE: process.env.LOCATION_COUNTRY_CODE,
    LOCATION_COUNTRY_CODE_ISO3: process.env.LOCATION_COUNTRY_CODE_ISO3,
    LOCATION_COUNTRY_CAPITAL: process.env.LOCATION_COUNTRY_CAPITAL,
    LOCATION_COUNTRY_TLD: process.env.LOCATION_COUNTRY_TLD,
    LOCATION_CONTINENT_CODE: process.env.LOCATION_CONTINENT_CODE,
    LOCATION_IN_EU: process.env.LOCATION_IN_EU === 'true',
    LOCATION_POSTAL: process.env.LOCATION_POSTAL,
    LOCATION_LATITUDE: process.env.LOCATION_LATITUDE
      ? Number.parseFloat(process.env.LOCATION_LATITUDE)
      : 0,
    LOCATION_LONGITUDE: process.env.LOCATION_LONGITUDE
      ? Number.parseFloat(process.env.LOCATION_LONGITUDE)
      : 0,
    LOCATION_TIMEZONE: process.env.LOCATION_TIMEZONE,
    LOCATION_UTC_OFFSET: process.env.LOCATION_UTC_OFFSET,
    LOCATION_COUNTRY_CALLING_CODE: process.env.LOCATION_COUNTRY_CALLING_CODE,
    LOCATION_CURRENCY: process.env.LOCATION_CURRENCY,
    LOCATION_CURRENCY_NAME: process.env.LOCATION_CURRENCY_NAME,
    LOCATION_LANGUAGES: process.env.LOCATION_LANGUAGES,
    LOCATION_COUNTRY_AREA: process.env.LOCATION_COUNTRY_AREA
      ? Number.parseFloat(process.env.LOCATION_COUNTRY_AREA)
      : 0,
    LOCATION_COUNTRY_POPULATION: process.env.LOCATION_COUNTRY_POPULATION
      ? Number.parseInt(process.env.LOCATION_COUNTRY_POPULATION)
      : 0,
    LOCATION_ASN: process.env.LOCATION_ASN,
    LOCATION_ORG: process.env.LOCATION_ORG,
  }) as const;

export type AppConfig = ReturnType<typeof AppConfigFunction>;
