import {
  ChatPromptTemplateType,
  ModelWithTools,
} from '@core/services/interface';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export interface LLMProviderInitResult {
  modelWithTools: ModelWithTools;
  model: BaseChatModel;
  toolNode: ToolNode;
  chatPromptTemplate: ChatPromptTemplateType;
}

export abstract class LLMProvider {
  abstract initialize(): Promise<LLMProviderInitResult>;
}
