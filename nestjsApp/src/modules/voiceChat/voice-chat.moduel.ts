import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VoiceChatController } from './controllers/voice-chat.controller';
import { FFMPEGAudioCleaner } from './services/audioCleaner';
import { FasterWhisperTranscriptor } from './services/transcriptors/fasterWhisperTranscriptor';
import { PicovoiceTranscriptor } from './services/transcriptors/picovoiceTranscriptor';
import { VoiceChatService } from './services/voiceChat/voice-chat.service';
import { VoiceSynthesis } from './services/voiceSynthesis/voiceSynthesis';

@Module({
  imports: [HttpModule],
  controllers: [VoiceChatController],
  providers: [
    VoiceChatService,
    PicovoiceTranscriptor,
    FFMPEGAudioCleaner,
    FasterWhisperTranscriptor,
    VoiceSynthesis,
  ],
})
export class VoiceChatModule {}
