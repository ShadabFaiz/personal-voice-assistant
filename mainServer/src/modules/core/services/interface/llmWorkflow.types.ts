import { AIMessage } from '@langchain/core/messages';

export interface CallToolsResult {
  messages: AIMessage[];
}

export interface CallModelResult {
  messages: AIMessage;
}
