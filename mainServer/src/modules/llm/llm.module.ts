import { CoreModule } from '@core/core.module';
import { SystemPromptsService, UserDefinedPromptsService } from '@core/services';
import { ToolsService } from '@core/tools/tools.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMController } from './controllers/llm.controller';
import { createLLMProvider } from './providers/llm-provider.factory';
import { LLMService } from './services/llm.service';
import { LLMProvider } from './types/llm-provider.types';

const LLMProviderFactory = {
  provide: LLMProvider,
  useFactory: createLLMProvider,
  inject: [ConfigService, SystemPromptsService, UserDefinedPromptsService, ToolsService],
};

@Module({
  imports: [CoreModule],
  controllers: [LLMController],
  providers: [LLMProviderFactory, LLMService],
  exports: [LLMService],
})
export class LLMModule {}
