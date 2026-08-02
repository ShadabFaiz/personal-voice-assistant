import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { LLMModule } from './modules/llm/llm.module';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';
import { WhatsAppModule } from './modules/integrations/whatsapp/whatsapp.module';

@Module({
  imports: [VoiceChatModule, LLMModule, CoreModule, WhatsAppModule],
  controllers: [],
})
export class AppModule {}
