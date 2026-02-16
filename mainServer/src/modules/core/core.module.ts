import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigFunction } from './config/configuration';
import { LLMWorkflowService } from './services/llmWorkflow.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfigFunction],
    }),
  ],
  providers: [LLMWorkflowService],
  exports: [LLMWorkflowService],
})
export class CoreModule {}
