import {
  ChatPromptTemplateType,
  ModelWithTools,
} from '@core/services/interface';
import { ToolNode } from '@langchain/langgraph/prebuilt';

export interface LLMProviderInitResult {
  modelWithTools: ModelWithTools;
  toolNode: ToolNode;
  chatPromptTemplate: ChatPromptTemplateType;
}

export abstract class LLMProvider {
  abstract initialize(): Promise<LLMProviderInitResult>;
}
