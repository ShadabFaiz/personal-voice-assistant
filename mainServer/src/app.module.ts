import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { GeminiModule } from './modules/gemini/gemini.moduel';
import { ToolsModule } from './modules/tools/tools.module';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [
    ToolsModule,
    // OllamaModule,
    VoiceChatModule,
    GlobalModule,
    GeminiModule,
  ],
  controllers: [],
})
export class AppModule {}
