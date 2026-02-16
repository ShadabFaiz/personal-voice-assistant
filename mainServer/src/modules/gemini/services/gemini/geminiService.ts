import { LLMWorkflowService } from '@core/services';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ToolsService } from '../../../tools/tools.service';
import { HelperService } from '../../helper';

import { AppConfig } from '@core/config';
import { SystemPromptsService } from './systemPrompts.service';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);

  private model!: ChatGoogleGenerativeAI;
  private readonly threadId = uuidv4();

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly helperService: HelperService,
    private readonly systemPromptsService: SystemPromptsService,
    private readonly toolService: ToolsService,
    private readonly llmWorkflowService: LLMWorkflowService,
  ) {}

  async onModuleInit(): Promise<void> {
    const geminiApiKey = this.configService.get<string>(
      'GOOGLE_GEMINI_API_KEY',
    ) as string;
    const model = this.configService.get<string>('GEMINI_MODEL') as string;

    this.model = new ChatGoogleGenerativeAI({
      model,
      apiKey: geminiApiKey,
      temperature: 0.6,
      streaming: true,
      disableStreaming: false,
    });

    try {
      const response = await this.model.invoke(
        'Heello Say something 10 time lines long.',
      );

      console.log('response ', response);
    } catch (error) {
      this.logger.error(error);
    }

    const tools = this.toolService.getAllTools();
    const modelWithTools = this.model.bindTools(tools);

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const chatPromptTemplate = ChatPromptTemplate.fromMessages(
      [
        SystemMessagePromptTemplate.fromTemplate(allSystemPrompts),
        HumanMessagePromptTemplate.fromTemplate('{messages}'),
      ],
      { validateTemplate: true },
    );

    const toolNode = new ToolNode(tools);

    this.llmWorkflowService.setModelWithTools(modelWithTools);
    this.llmWorkflowService.setToolNode(toolNode);
    this.llmWorkflowService.setChatPromptTemplate(chatPromptTemplate);
    this.llmWorkflowService.setThreadId(this.threadId);

    this.logger.log('OllamaServiceV2 initialized');
  }

  async chat(userPrompt: string): Promise<string> {
    try {
      const input = [{ role: 'user', content: userPrompt }];
      const response = await this.model.invoke(input);
      console.log('response ', response);
      // const output = await this.llmWorkflowService.invokeChat(input);
      // const llmResponse: string = output.messages.pop()!.content as string;
      return 'llmResponse';
    } catch (error) {
      this.logger.error('Failed to get response', error);
      throw new InternalServerErrorException(
        'Failed to get response from CloudLLM',
      );
    }
  }
}
