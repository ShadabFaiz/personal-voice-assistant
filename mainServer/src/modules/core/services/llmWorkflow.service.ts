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

  private readonly config = { configurable: { thread_id: 'thread-id' } };

  private readonly workflow = new StateGraph(MessagesAnnotation)
    .addNode('model', this.callModel.bind(this))
    .addNode('tools', this.callTools.bind(this))
    .addEdge(START, 'model')
    .addConditionalEdges('model', this.llmResponseHandler.bind(this), [
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

  setThreadId(threadId: string) {
    this.config.configurable.thread_id = threadId;
  }

  private async callTools(
    state: typeof MessagesAnnotation.State,
  ): Promise<{ messages: AIMessage[] }> {
    const { messages } = state;
    const lastMessage = messages.at(-1);

    if (!lastMessage) {
      throw new Error('No message found in state');
    }

    const toolResponse = (await this.toolNode.invoke({
      messages: [lastMessage as AIMessage],
    })) as { messages: AIMessage[] };
    this.logger.log(
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

  async invokeChat(messages: { role: string; content: string }[]) {
    return this.app.invoke({ messages }, this.config);
  }
}
