import { CoreModule } from '@core/core.module';
import { GeminiModule } from '@gemini/gemini.module';

import { Module } from '@nestjs/common';
import { ToolsModule } from './modules/tools/tools.module';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [
    ToolsModule,
    // OllamaModule,
    VoiceChatModule,
    GeminiModule,
    CoreModule,
  ],
  controllers: [],
})
export class AppModule {}
