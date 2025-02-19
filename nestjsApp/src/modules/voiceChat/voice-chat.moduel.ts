import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VoiceChatController } from './controllers/voice-chat.controller';
import { FFMPEGAudioCleaner } from './services/audioCleaner';
import { PicovoiceTranscriptor } from './services/transcriptors/picovoiceTranscriptor';
import { VoiceChatService } from './services/voiceChat/voice-chat.service';

@Module({
  imports: [HttpModule],
  controllers: [VoiceChatController],
  providers: [VoiceChatService, PicovoiceTranscriptor, FFMPEGAudioCleaner],
})
export class VoiceChatModule {}
