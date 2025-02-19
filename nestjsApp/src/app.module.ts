import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { OllamaModule } from './modules/ollama/ollama.moduel';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [OllamaModule, VoiceChatModule, GlobalModule],
  controllers: [],
})
export class AppModule {}
