import { AppConfig } from '@core/config';
import {
  SystemPromptsService,
  UserDefinedPromptsService,
} from '@core/services';
import { ChatPromptTemplateType } from '@core/services/interface';
import { ToolsService } from '@core/tools/tools.service';
import { SystemMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
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
    private readonly userDefinedPromptsService: UserDefinedPromptsService,
    private readonly toolService: ToolsService,
    private readonly configPrefix: 'VISION_' | '' = '',
  ) {
    super();
  }

  async initialize(): Promise<LLMProviderInitResult> {
    const apiKeyKey = (this.configPrefix + 'GOOGLE_GEMINI_API_KEY') as keyof AppConfig;
    const modelKey = (this.configPrefix + 'GEMINI_MODEL') as keyof AppConfig;
    const apiKey = this.configService.get<string>(apiKeyKey) as string;
    const model = this.configService.get<string>(modelKey) as string;

    const chatModel = new ChatGoogleGenerativeAI({
      model,
      apiKey,
      temperature: 0.6,
      streaming: true,
      disableStreaming: false,
    });

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const allUserPrompts =
      await this.userDefinedPromptsService.loadAllUserDefinedPrompts();
    const combinedSystemPrompts = `${allSystemPrompts}\n\n${allUserPrompts}`;
    const chatPromptTemplate: ChatPromptTemplateType =
      ChatPromptTemplate.fromMessages(
        [
          new SystemMessage(combinedSystemPrompts),
          HumanMessagePromptTemplate.fromTemplate('{messages}'),
        ],
        { validateTemplate: true },
      );

    const tools = this.toolService.getAllTools();
    const modelWithTools = chatModel.bindTools(tools);
    const toolNode = new ToolNode(tools);

    this.logger.log('GeminiProvider initialized');
    return { modelWithTools, model: chatModel, toolNode, chatPromptTemplate };
  }
}
