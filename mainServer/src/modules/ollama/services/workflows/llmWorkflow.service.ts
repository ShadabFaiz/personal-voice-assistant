import { ChatPromptTemplateType } from '@core/services/interface';
import { AIMessage, AIMessageChunk } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LLMWorkflowService {
  private readonly logger = new Logger(LLMWorkflowService.name);

  private chatPromptTemplate!: ChatPromptTemplateType;
  private modelWithTools!: Runnable<any, AIMessageChunk, any>;
  private toolNode!: ToolNode;
  private memory = new MemorySaver();

  private config = { configurable: { thread_id: 'thread-id' } };

  private workflow = new StateGraph(MessagesAnnotation)
    .addNode('model', this.callModel.bind(this))
    .addNode('tools', this.callTools.bind(this))
    .addEdge(START, 'model')
    .addConditionalEdges('model', this.llmResponseHandler.bind(this), [
      'tools',
      END,
    ])
    .addEdge('tools', 'model')
    .addEdge('model', END);

  private app = this.workflow.compile({ checkpointer: this.memory });

  setModelWithTools(modelWithTools: Runnable<any, AIMessageChunk, any>) {
    this.modelWithTools = modelWithTools;
  }

  setToolNode(toolNode: ToolNode) {
    this.toolNode = toolNode;
  }

  setChatPromptTemplate(chatPromptTemplate: ChatPromptTemplateType) {
    this.chatPromptTemplate = chatPromptTemplate;
  }

  setThreadId(threadId: string) {
    this.config.configurable.thread_id = threadId;
  }

  private async callTools(state: typeof MessagesAnnotation.State) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    const toolResponse = await this.toolNode.invoke({
      messages: [lastMessage],
    });
    this.logger.log('Tool Response: ' + JSON.stringify(toolResponse));
    return { messages: toolResponse.messages };
  }

  private async llmResponseHandler(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }
    return END;
  }

  private async callModel(state: typeof MessagesAnnotation.State) {
    const prompt = await this.chatPromptTemplate.invoke(state);
    const response: AIMessage = await this.modelWithTools.invoke(prompt);
    return { messages: response };
  }

  async invokeChat(messages: { role: string; content: string }[]) {
    return this.app.invoke({ messages }, this.config);
  }
}
