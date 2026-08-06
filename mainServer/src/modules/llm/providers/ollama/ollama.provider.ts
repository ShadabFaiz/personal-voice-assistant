import { AppConfig } from '@core/config';
import {
  SystemPromptsService,
  UserDefinedPromptsService,
} from '@core/services';
import { ChatPromptTemplateType } from '@core/services/interface';
import { ToolsService } from '@core/tools/tools.service';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOllama } from '@langchain/ollama';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LLMProvider,
  LLMProviderInitResult,
} from '../../types/llm-provider.types';

@Injectable()
export class OllamaProvider extends LLMProvider {
  private readonly logger = new Logger(OllamaProvider.name);

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
    const baseUrlKey = (this.configPrefix + 'OLLAMA_BASE_URL') as keyof AppConfig;
    const modelKey = (this.configPrefix + 'MODEL_NAME') as keyof AppConfig;
    const baseUrl = this.configService.get<string>(
      baseUrlKey,
      'http://localhost:11434',
    );
    const modelName = this.configService.get<string>(modelKey) as string;

    const chatModel = new ChatOllama({
      baseUrl,
      model: modelName,
      verbose: false,
      think: false,
    });

    const allSystemPrompts = this.systemPromptsService.loadAllSystemPrompts();
    const allUserPrompts =
      await this.userDefinedPromptsService.loadAllUserDefinedPrompts();
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

    this.logger.log('OllamaProvider initialized');
    return { modelWithTools, model: chatModel, toolNode, chatPromptTemplate };
  }
}
