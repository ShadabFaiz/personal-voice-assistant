import { Module } from '@nestjs/common';
import { VoiceChatController } from './controllers/voice-chat.controller';
import { VoiceChatService } from './services/voiceChat/voice-chat.service';

@Module({
  controllers: [VoiceChatController],
  providers: [VoiceChatService],
})
export class VoiceChatModule { }
