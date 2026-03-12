import { ChatPromptTemplate } from '@langchain/core/prompts';

export type ChatPromptTemplateType = ReturnType<
  typeof ChatPromptTemplate.fromMessages
>;
