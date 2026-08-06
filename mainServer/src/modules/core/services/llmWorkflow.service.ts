import { DEFAULT_LLM_WORKFLOW_RECURSION_LIMIT } from '@core/config/constants';
import { AIMessage } from '@langchain/core/messages';
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Injectable, Logger } from '@nestjs/common';
import { ChatPromptTemplateType } from './interface';
import { ModelWithTools } from './interface/modelWithTools';

@Injectable()
export class LLMWorkflowService {
  private readonly logger = new Logger(LLMWorkflowService.name);

  private chatPromptTemplate!: ChatPromptTemplateType;
  private modelWithTools!: ModelWithTools;
  private toolNode!: ToolNode;
  private readonly memory = new MemorySaver();

  private readonly workflow = new StateGraph(MessagesAnnotation)
    .addNode('model', (state: typeof MessagesAnnotation.State) => this.callModel(state))
    .addNode('tools', (state: typeof MessagesAnnotation.State) => this.callTools(state))
    .addEdge(START, 'model')
    .addConditionalEdges('model', (state: typeof MessagesAnnotation.State) => this.llmResponseHandler(state), [
      'tools',
      END,
    ])
    .addEdge('tools', 'model')
    .addEdge('model', END);

  private readonly app = this.workflow.compile({ checkpointer: this.memory });

  setModelWithTools(modelWithTools: ModelWithTools) {
    this.modelWithTools = modelWithTools;
  }

  setToolNode(toolNode: ToolNode) {
    this.toolNode = toolNode;
  }

  setChatPromptTemplate(chatPromptTemplate: ChatPromptTemplateType) {
    this.chatPromptTemplate = chatPromptTemplate;
  }

  private async callTools(
    state: typeof MessagesAnnotation.State,
  ): Promise<{ messages: AIMessage[] }> {
    const { messages } = state;
    const lastMessage = messages.at(-1);

    if (!lastMessage) {
      throw new Error('No message found in state');
    }

    const toolParams = (lastMessage as AIMessage).tool_calls?.[0].args;
    const toolNames =
      (lastMessage as AIMessage).tool_calls?.map((tc) => tc.name).join(', ') ??
      'unknown';
    this.logger.log(
      `Tool invoked: ${toolNames}, with params: ${JSON.stringify(toolParams, null, 2)}`,
    );

    const toolResponse = (await this.toolNode.invoke({
      messages: [lastMessage as AIMessage],
    })) as { messages: AIMessage[] };
    this.logger.debug(
      'Tool Response: ' + JSON.stringify(toolResponse.messages, null, 2),
    );
    return { messages: toolResponse.messages };
  }

  private llmResponseHandler(state: typeof MessagesAnnotation.State): string {
    const lastMessage = state.messages.at(-1) as AIMessage;
    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }
    return END;
  }

  private async callModel(
    state: typeof MessagesAnnotation.State,
  ): Promise<{ messages: AIMessage }> {
    const prompt = await this.chatPromptTemplate.invoke(state);
    const response: AIMessage = await this.modelWithTools.invoke(prompt);
    return { messages: response };
  }

  async invokeChat(
    threadId: string,
    messages: { role: string; content: string }[],
    systemContext?: string,
  ) {
    const runConfig = {
      configurable: { thread_id: threadId },
      recursionLimit: DEFAULT_LLM_WORKFLOW_RECURSION_LIMIT,
    };

    if (systemContext) {
      const state = await this.app.getState(runConfig);
      if (!(state?.values as Record<string, string>)?.messages?.length) {
        messages.unshift({
          role: 'system',
          content: systemContext,
        });
      }
    }
    return this.app.invoke({ messages }, runConfig);
  }
}
