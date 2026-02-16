import { AppConfig } from '@core/config';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VoiceSynthesis {
  private readonly DEBUG = false;
  private readonly logger = new Logger(VoiceSynthesis.name);
  private readonly endpoint: string;

  constructor(
    private readonly configService: ConfigService<Required<AppConfig>>,
    private readonly httpService: HttpService,
  ) {
    this.DEBUG = this.configService.get('DEBUG') || false;
    this.endpoint =
      this.configService.get('VOICE_SYNTHESIS_SERVER_ENDPOINT') || '';
  }

  async synthesize(text: string) {
    try {
      this.logger.log('Waiting for voice synthesis...');
      await this.httpService.axiosRef.post(this.endpoint, {
        text,
      });
      this.logger.log('voice synthesis completed');
    } catch (error) {
      if (this.DEBUG) {
        this.logger.error(error);
      }
      return [
        null,
        new Error('Error while sending audio to transcription service'),
      ];
    }
  }
}
