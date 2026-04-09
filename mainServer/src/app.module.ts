import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { LLMModule } from './modules/llm/llm.module';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [VoiceChatModule, LLMModule, CoreModule],
  controllers: [],
})
export class AppModule {}
