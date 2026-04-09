import { AppConfig } from '@core/config';
import { SystemPromptsService } from '@core/services';
import { ChatPromptTemplateType } from '@core/services/interface';
import { ToolsService } from '@core/tools/tools.service';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LLMProvider,
  LLMProviderInitResult,
} from '../../types/llm-provider.types';

@Injectable()
export class GeminiProvider extends LLMProvider {
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly systemPromptsService: SystemPromptsService,
    private readonly toolService: ToolsService,
  ) {
    super();
  }

  initialize(): Promise<LLMProviderInitResult> {
    const apiKey = this.configService.get<string>(
      'GOOGLE_GEMINI_API_KEY',
    ) as string;
    const model = this.configService.get<string>('GEMINI_MODEL') as string;

    const chatModel = new ChatGoogleGenerativeAI({
      model,
      apiKey,
      temperature: 0.6,
      streaming: true,
      disableStreaming: false,
    });

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const chatPromptTemplate: ChatPromptTemplateType =
      ChatPromptTemplate.fromMessages(
        [
          SystemMessagePromptTemplate.fromTemplate(allSystemPrompts),
          HumanMessagePromptTemplate.fromTemplate('{messages}'),
        ],
        { validateTemplate: true },
      );

    const tools = this.toolService.getAllTools();
    const modelWithTools = chatModel.bindTools(tools);
    const toolNode = new ToolNode(tools);

    this.logger.log('GeminiProvider initialized');
    return Promise.resolve({ modelWithTools, toolNode, chatPromptTemplate });
  }
}
