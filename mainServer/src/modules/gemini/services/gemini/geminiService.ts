import { LLMWorkflowService, SystemPromptsService } from '@core/services';
import { ToolsService } from '@core/tools/tools.service';
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
import { HelperService } from '../../helper';

import { AppConfig } from '@core/config';

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

  onModuleInit() {
    const apiKey = this.configService.get<string>(
      'GOOGLE_GEMINI_API_KEY',
    ) as string;
    const model = this.configService.get<string>('GEMINI_MODEL') as string;

    this.model = new ChatGoogleGenerativeAI({
      model,
      apiKey,
      temperature: 0.6,
      streaming: true,
      disableStreaming: false,
    });

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const chatPromptTemplate = ChatPromptTemplate.fromMessages(
      [
        SystemMessagePromptTemplate.fromTemplate(allSystemPrompts),
        HumanMessagePromptTemplate.fromTemplate('{messages}'),
      ],
      { validateTemplate: true },
    );

    const tools = this.toolService.getAllTools();
    const modelWithTools = this.model.bindTools(tools);
    const toolNode = new ToolNode(tools);

    this.llmWorkflowService.setModelWithTools(modelWithTools);
    this.llmWorkflowService.setToolNode(toolNode);
    this.llmWorkflowService.setChatPromptTemplate(chatPromptTemplate);
    this.llmWorkflowService.setThreadId(this.threadId);
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
      throw new InternalServerErrorException(
        'Failed to get response from CloudLLM',
      );
    }
  }
}
