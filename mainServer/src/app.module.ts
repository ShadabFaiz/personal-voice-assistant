import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { CloudLLMModule } from './modules/cloudLLM/cloudLLM.moduel';
import { OllamaModule } from './modules/ollama/ollama.moduel';
import { ToolsModule } from './modules/tools/tools.module';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [
    ToolsModule,
    OllamaModule,
    VoiceChatModule,
    GlobalModule,
    CloudLLMModule,
  ],
  controllers: [],
})
export class AppModule {}
