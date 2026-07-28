import { AppConfig } from '@core/config';
import { SystemPromptsService, UserDefinedPromptsService } from '@core/services';
import { ChatPromptTemplateType } from '@core/services/interface';
import { ToolsService } from '@core/tools/tools.service';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LLMProvider,
  LLMProviderInitResult,
} from '../../types/llm-provider.types';

@Injectable()
export class OpenAICompatibleProvider extends LLMProvider {
  private readonly logger = new Logger(OpenAICompatibleProvider.name);

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly systemPromptsService: SystemPromptsService,
    private readonly userDefinedPromptsService: UserDefinedPromptsService,
    private readonly toolService: ToolsService,
  ) {
    super();
  }

  async initialize(): Promise<LLMProviderInitResult> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') as string;
    const baseUrl = this.configService.get<string>('OPENAI_BASE_URL') as string;
    const model = this.configService.get<string>('MODEL_NAME') as string;

    const chatModel = new ChatOpenAI({
      model: model,
      apiKey: apiKey,
      configuration: {
        baseURL: baseUrl,
        defaultHeaders: {
          'X-SITE': 'personal',
          'X-Title': 'X-TitlePEronsla',
          'X-OpenRouter-Title': 'X-OpenRouter-TitlePersonal',
        },
      },
      temperature: 0.7,
      streaming: true,
    });

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const allUserPrompts = await this.userDefinedPromptsService.loadAllUserDefinedPrompts();
    const combinedSystemPrompts = `${allSystemPrompts}\n\n${allUserPrompts}`;
    const chatPromptTemplate: ChatPromptTemplateType =
      ChatPromptTemplate.fromMessages(
        [
          SystemMessagePromptTemplate.fromTemplate(combinedSystemPrompts),
          HumanMessagePromptTemplate.fromTemplate('{messages}'),
        ],
        { validateTemplate: true },
      );

    const tools = this.toolService.getAllTools();
    const modelWithTools = chatModel.bindTools(tools);
    const toolNode = new ToolNode(tools);

    this.logger.log(
      `OpenAICompatibleProvider initialized with base URL: ${baseUrl}`,
    );
    return { modelWithTools, toolNode, chatPromptTemplate };
  }
}
