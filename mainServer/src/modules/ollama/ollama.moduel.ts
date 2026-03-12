import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OllamaController } from './controllers/ollama';
import { HelperService } from './helper';
import { OllamaService } from './services';
import { OllamaServiceV2 } from './services/ollama/ollama.service.v2';
import { LLMWorkflowService } from './services/workflows/llmWorkflow.service';

@Module({
  imports: [HttpModule],
  controllers: [OllamaController],
  providers: [
    OllamaService,
    HelperService,
    OllamaServiceV2,
    LLMWorkflowService,
  ],
})
export class OllamaModule {}
