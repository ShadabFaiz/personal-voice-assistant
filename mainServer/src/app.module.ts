import { CoreModule } from '@core/core.module';
import { GeminiModule } from '@gemini/gemini.module';

import { Module } from '@nestjs/common';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [
    // OllamaModule,
    VoiceChatModule,
    GeminiModule,
    CoreModule,
  ],
  controllers: [],
})
export class AppModule {}
