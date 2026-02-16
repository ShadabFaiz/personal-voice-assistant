import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BaseController } from './controllers/baseController';
import { HelperService } from './helper';
import { GeminiService } from './services/gemini/geminiService';
import { SystemPromptsService } from './services/gemini/systemPrompts.service';
import { LLMWorkflowService } from './services/llm/llmWorkflow.service';

@Module({
  imports: [HttpModule],
  controllers: [BaseController],
  providers: [
    HelperService,
    SystemPromptsService,
    GeminiService,
    LLMWorkflowService,
  ],
})
export class GeminiModule {}
