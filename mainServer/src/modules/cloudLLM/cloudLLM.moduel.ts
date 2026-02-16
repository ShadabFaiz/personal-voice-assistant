import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BaseController } from './controllers/baseController';
import { HelperService } from './helper';
import { LLMWorkflowService } from './services/llm/llmWorkflow.service';
import { CloudLLMServiceV2 } from './services/ollama/cloudLLM.service.v2';
import { SystemPromptsService } from './services/ollama/systemPrompts.service';

@Module({
  imports: [HttpModule],
  controllers: [BaseController],
  providers: [
    HelperService,
    SystemPromptsService,
    CloudLLMServiceV2,
    LLMWorkflowService,
  ],
})
export class CloudLLMModule {}
