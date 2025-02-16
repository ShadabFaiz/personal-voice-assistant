import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { OllamaModule } from './modules/ollama/ollama.moduel';
import { PicovoiceTranscriptor } from './modules/voiceChat/services/transcriptors/picovoiceTranscriptor';
import { VoiceChatModule } from './modules/voiceChat/voice-chat.moduel';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    OllamaModule,
    VoiceChatModule
  ],
  controllers: [],
  providers: [Logger, PicovoiceTranscriptor],

})
export class AppModule { }
