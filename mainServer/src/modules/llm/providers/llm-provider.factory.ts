import { AppConfig } from '@core/config';
import { ModelType } from '@core/config/constants';
import { SystemPromptsService, UserDefinedPromptsService } from '@core/services';
import { ToolsService } from '@core/tools/tools.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '../types/llm-provider.types';
import { GeminiProvider } from './gemini/gemini.provider';
import { OllamaProvider } from './ollama/ollama.provider';
import { OpenAICompatibleProvider } from './openai-compatible/openai-compatible.provider';

const logger = new Logger('LLMProviderFactory');

const providerRegistry: Record<
  ModelType,
  (
    configService: ConfigService<AppConfig>,
    systemPromptsService: SystemPromptsService,
    userDefinedPromptsService: UserDefinedPromptsService,
    toolService: ToolsService,
  ) => LLMProvider
> = {
  gemini: (configService, systemPromptsService, userDefinedPromptsService, toolService) =>
    new GeminiProvider(configService, systemPromptsService, userDefinedPromptsService, toolService),
  ollama: (configService, systemPromptsService, userDefinedPromptsService, toolService) =>
    new OllamaProvider(configService, systemPromptsService, userDefinedPromptsService, toolService),
  openai: (configService, systemPromptsService, userDefinedPromptsService, toolService) =>
    new OpenAICompatibleProvider(
      configService,
      systemPromptsService,
      userDefinedPromptsService,
      toolService,
    ),
};

export const createLLMProvider = (
  configService: ConfigService<AppConfig>,
  systemPromptsService: SystemPromptsService,
  userDefinedPromptsService: UserDefinedPromptsService,
  toolService: ToolsService,
): LLMProvider => {
  const modelType = configService.get<ModelType>('MODEL_TYPE');
  logger.log(`Creating LLM provider for model type: ${modelType}`);

  const validTypes = Object.keys(providerRegistry) as ModelType[];
  const providerFactory = providerRegistry[modelType as ModelType];

  if (!providerFactory) {
    throw new Error(
      `Unsupported MODEL_TYPE: "${modelType}". Valid values: ${validTypes.join(' | ')}`,
    );
  }

  return providerFactory(configService, systemPromptsService, userDefinedPromptsService, toolService);
};
