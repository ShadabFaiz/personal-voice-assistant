import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VoiceChatController } from './controllers/voice-chat.controller';
import { FFMPEGAudioCleaner } from './services/audioCleaner';
import { FasterWhisperTranscriptor } from './services/transcriptors/fasterWhisperTranscriptor';
import { VoiceChatService } from './services/voiceChat/voice-chat.service';
import { VoiceChatServiceV2 } from './services/voiceChat/voice-chat.service_v2';
import { VoiceSynthesis } from './services/voiceSynthesis/voiceSynthesis';

@Module({
  imports: [HttpModule],
  controllers: [VoiceChatController],
  providers: [
    VoiceChatService,
    FFMPEGAudioCleaner,
    FasterWhisperTranscriptor,
    VoiceSynthesis,
    VoiceChatServiceV2,
  ],
})
export class VoiceChatModule {}
