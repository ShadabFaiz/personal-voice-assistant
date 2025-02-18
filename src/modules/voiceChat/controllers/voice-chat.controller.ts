import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { VoiceChatService } from '../services/voiceChat/voice-chat.service';

@Controller('voiceChat')
export class VoiceChatController {
  constructor(private readonly voiceChatService: VoiceChatService) { }

  @Get('start')
  voiceStart(@Res() res: Response) {
    return this.voiceChatService.startRecording(res);
  }
}
