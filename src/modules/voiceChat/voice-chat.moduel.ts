import { Module } from '@nestjs/common';
import { VoiceChatController } from './controllers/voice-chat.controller';
import { PicovoiceTranscriptor } from './services/transcriptors/picovoiceTranscriptor';
import { VoiceChatService } from './services/voiceChat/voice-chat.service';

@Module({
  controllers: [VoiceChatController],
  providers: [VoiceChatService, PicovoiceTranscriptor],
})
export class VoiceChatModule { }
