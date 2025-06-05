import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { OllamaModule } from './modules/ollama/ollama.moduel';
import { ToolsModule } from './modules/tools/tools.module';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [OllamaModule, VoiceChatModule, GlobalModule, ToolsModule],
  controllers: [],
})
export class AppModule {}
