import { AppConfig } from '@core/config';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Return } from '../../../../interfaces/genericReturnTypes';

@Injectable()
export class FasterWhisperTranscriptor {
  private readonly DEBUG = false;
  private readonly logger = new Logger(FasterWhisperTranscriptor.name);
  private readonly TRANSCRIPTOR_ENDPOINT: string;

  constructor(
    private readonly configService: ConfigService<Required<AppConfig>>,
    private readonly httpService: HttpService,
  ) {
    this.DEBUG = this.configService.get('DEBUG') || false;
    this.TRANSCRIPTOR_ENDPOINT =
      this.configService.get('TRANSCRIPTION_SERVER_ENDPOINT') || '';
  }

  async transcribe(audioBuffer: Buffer): Promise<Return<string>> {
    try {
      this.logger.log('Waiting for transcription...');
      const response = await this.httpService.axiosRef.post<{
        transcript: string;
      }>(this.TRANSCRIPTOR_ENDPOINT, audioBuffer, {
        headers: { 'Content-Type': 'audio/wav' },
      });
      this.logger.log('Transcription recevied', response.data.transcript);

      return [response.data.transcript, null];
    } catch (error) {
      if (this.DEBUG) {
        this.logger.error(error.message);
      }
      return [
        null,
        new Error('Error while sending audio to transcription service'),
      ];
    }
  }
}
