import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export type ModelWithTools = ReturnType<ChatGoogleGenerativeAI['bindTools']>;
