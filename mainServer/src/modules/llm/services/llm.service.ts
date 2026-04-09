import { AppConfig } from '@core/config';
import { ModelType } from '@core/config/constants';
import { LLMWorkflowService } from '@core/services/llmWorkflow.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LLMProvider } from '../types/llm-provider.types';

@Injectable()
export class LLMService implements OnModuleInit {
  private readonly logger = new Logger(LLMService.name);
  private readonly threadId = uuidv4();

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly llmWorkflowService: LLMWorkflowService,
    private readonly llmProvider: LLMProvider,
  ) {}

  async onModuleInit(): Promise<void> {
    const modelType = this.configService.get<ModelType>('MODEL_TYPE');
    this.logger.log(`Initializing LLM with model type: ${modelType}`);

    const { modelWithTools, toolNode, chatPromptTemplate } =
      await this.llmProvider.initialize();

    this.llmWorkflowService.setModelWithTools(modelWithTools);
    this.llmWorkflowService.setToolNode(toolNode);
    this.llmWorkflowService.setChatPromptTemplate(chatPromptTemplate);
    this.llmWorkflowService.setThreadId(this.threadId);

    this.logger.log(`LLM service initialized with ${modelType} provider`);
  }

  async chat(userPrompt: string): Promise<string> {
    try {
      this.logger.log(`User: ${userPrompt}`);
      const input = [{ role: 'user', content: userPrompt }];
      const output = await this.llmWorkflowService.invokeChat(input);
      const modelResponse = output.messages.at(-1)!.content as string;
      this.logger.log(`Model: ${modelResponse}`);
      return modelResponse;
    } catch (error) {
      this.logger.error('Failed to get response', error);
      throw new InternalServerErrorException('Failed to get response from LLM');
    }
  }
}
