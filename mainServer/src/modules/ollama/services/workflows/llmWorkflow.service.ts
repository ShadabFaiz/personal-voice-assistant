import { AIMessage, AIMessageChunk } from '@langchain/core/messages';
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { Injectable, Logger } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { ToolNode } from '@langchain/langgraph/prebuilt';

@Injectable()
export class LLMWorkflowService {
  private readonly logger = new Logger(LLMWorkflowService.name);

  private chatPromptTemplate: ChatPromptTemplate<any, any>;
  private modelWithTools!: Runnable<any, AIMessageChunk, any>;
  private toolNode!: ToolNode;
  private memory = new MemorySaver();

  /**
   * @description This is used identify which message / conversation belongs to which state in case of multi-user.
   */
  private config = { configurable: { thread_id: 'thread-id' } };

  /**
   * @description Initialize the Application Graph State. Here we are setting with node is connected to which other node.
   * It is also a persistent layer between client and LLM. It will keep all the conversation history between user and LLM.
   */
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

  /**
   * @description Initialize the LLM app with complete state
   */
  private app = this.workflow.compile({ checkpointer: this.memory });

  // Set dependencies after creation
  setModelWithTools(modelWithTools: Runnable<any, AIMessageChunk, any>) {
    this.modelWithTools = modelWithTools;
  }

  setToolNode(toolNode: ToolNode) {
    this.toolNode = toolNode;
  }

  setChatPromptTemplate(chatPromptTemplate: ChatPromptTemplate<any, any>) {
    this.chatPromptTemplate = chatPromptTemplate;
  }

  setThreadId(threadId: string) {
    this.config.configurable.thread_id = threadId;
  }

  /**
   * @description This function will be called whenever a tool is invoked.
   */
  private async callTools(state: typeof MessagesAnnotation.State) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    const toolResponse = await this.toolNode.invoke({
      messages: [lastMessage],
    });
    this.logger.log('Tool Response: ' + JSON.stringify(toolResponse));
    return { messages: toolResponse.messages };
  }

  /**
   * @description This function will run after every llm response. This function
   * will decide if next node will be tool node or END state of the current prompt.
   *
   * @param state
   * @returns
   */
  private async llmResponseHandler(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }
    return END;
  }

  /**
   * @description This function will be called whenever a new message is added
   * to the state and it will be given to LLM.
   *
   * @param state
   * @returns
   */
  private async callModel(state: typeof MessagesAnnotation.State) {
    const prompt = await this.chatPromptTemplate.invoke(state);
    const response: AIMessage = await this.modelWithTools.invoke(prompt);
    return { messages: response };
  }

  /**
   * @description This function will be called to start the chat with LLM.
   * It will invoke the workflow with the initial messages.
   *
   */
  async invokeChat(messages: { role: string; content: string }[]) {
    return this.app.invoke({ messages }, this.config);
  }
}
