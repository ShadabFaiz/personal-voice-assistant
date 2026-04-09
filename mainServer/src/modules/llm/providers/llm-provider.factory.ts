import { AppConfig } from '@core/config';
import { ModelType } from '@core/config/constants';
import { SystemPromptsService } from '@core/services';
import { ToolsService } from '@core/tools/tools.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider } from '../types/llm-provider.types';
import { GeminiProvider } from './gemini/gemini.provider';
import { OllamaProvider } from './ollama/ollama.provider';

const logger = new Logger('LLMProviderFactory');

const providerRegistry: Record<
  ModelType,
  (
    configService: ConfigService<AppConfig>,
    systemPromptsService: SystemPromptsService,
    toolService: ToolsService,
  ) => LLMProvider
> = {
  gemini: (configService, systemPromptsService, toolService) =>
    new GeminiProvider(configService, systemPromptsService, toolService),
  ollama: (configService, systemPromptsService, toolService) =>
    new OllamaProvider(configService, systemPromptsService, toolService),
};

export const createLLMProvider = (
  configService: ConfigService<AppConfig>,
  systemPromptsService: SystemPromptsService,
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

  return providerFactory(configService, systemPromptsService, toolService);
};
