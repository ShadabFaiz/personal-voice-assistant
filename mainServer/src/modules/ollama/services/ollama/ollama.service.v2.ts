// ollama.service.v2.ts
import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelperService } from '../../helper';
import { SystemPromptsService } from './systemPrompts.service';
import { ToolsService } from '../../../tools/tools.service';
import { ChatOllama } from '@langchain/ollama';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { v4 as uuidv4 } from 'uuid';
import { LLMWorkflowService } from '../llm/llmWorkflow.service';

@Injectable()
export class OllamaServiceV2 implements OnModuleInit {
  private readonly logger = new Logger(OllamaServiceV2.name);

  private model!: ChatOllama;
  private threadId = uuidv4();

  constructor(
    private configService: ConfigService,
    private readonly helperService: HelperService,
    private readonly systemPromptsService: SystemPromptsService,
    private readonly toolService: ToolsService,
    private readonly llmWorkflowService: LLMWorkflowService,
  ) {}

  async onModuleInit(): Promise<void> {
    const baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    const isOllamaRunning = await this.helperService.checkOllamaStatus(baseUrl);
    if (!isOllamaRunning) {
      throw new Error(`Ollama is not running at ${baseUrl}. Please start Ollama server.`);
    }

    const modelName = this.configService.get<string>('MODEL_NAME');
    this.model = new ChatOllama({ baseUrl, model: modelName, verbose: true });

    const tools = this.toolService.getAllTools();
    this.logger.log('Binding tools to model');
    const modelWithTools = this.model.bindTools(tools);

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const chatPromptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(allSystemPrompts),
      HumanMessagePromptTemplate.fromTemplate('{messages}'),
    ], { validateTemplate: true });

    const toolNode = new ToolNode(tools);

    // Inject dependencies into workflow service
    this.llmWorkflowService.setModelWithTools(modelWithTools);
    this.llmWorkflowService.setToolNode(toolNode);
    this.llmWorkflowService.setChatPromptTemplate(chatPromptTemplate);
    this.llmWorkflowService.setThreadId(this.threadId);

    this.logger.log('OllamaServiceV2 initialized');
  }

  /**
   * @description Chat method to interact with the LLM
   * @param userPrompt 
   * @returns response string
   */
  async chat(userPrompt: string): Promise<string> {
    try {
      const input = [{ role: 'user', content: userPrompt }];
      const output = await this.llmWorkflowService.invokeChat(input);
      const llmResponse: string = (output.messages.pop()!).content! as string;
      return llmResponse;
    } catch (error) {
      this.logger.error('Failed to get response', error);
      throw new InternalServerErrorException('Failed to get response from Ollama');
    }
  }
}
