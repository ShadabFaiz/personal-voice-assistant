import { AppConfig } from '@core/config/configuration';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import mic from 'mic';
import moment from 'moment-timezone';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { FFMPEGAudioCleaner } from '../audioCleaner';
import { FasterWhisperTranscriptor } from '../transcriptors/fasterWhisperTranscriptor';
import { VoiceSynthesis } from '../voiceSynthesis/voiceSynthesis';
import { MicInstanceConfigs } from './configs';

@Injectable()
export class VoiceChatServiceV2 {
  private micInstance: ReturnType<typeof mic>;
  private micInputStream: Readable;
  private audioBuffer: Buffer = Buffer.alloc(0);
  private readonly logger = new Logger(VoiceChatServiceV2.name);
  private readonly DEBUG = false;

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly transcriptor: FasterWhisperTranscriptor,
    private readonly voiceSynthesis: VoiceSynthesis,
    private readonly ffmpegAudioCleaner: FFMPEGAudioCleaner,
    private readonly httpService: HttpService,
  ) {
    this.DEBUG = this.configService.get('DEBUG', false);
    const { dir } = this.getFilePath();

    this.createDirectory(dir);
  }

  private wait(waitInMilliSeconds: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, waitInMilliSeconds);
    });
  }

  startRecording() {
    try {
      this.resetAudioCaptureBuffer();
      this.initializeMicInstance();
      this.logger.log('Started recording...');
      this.micInstance.start();
      this.micInputStream.on('audioProcessExitComplete', async () => {
        await this.onAudioCaptureComplete();
        this.logger.verbose('Recording completed. Starting next recording...');
        await this.wait(2000);
        return this.startRecording();
      });
    } catch (error) {
      this.logger.error('Error in startRecording:', error);
    }
  }

  private async onAudioCaptureComplete() {
    const { filePath } = this.getFilePath();
    const cleanedAudio = this.audioBuffer;
    const transcript = await this.transcribeBufferedAudio(cleanedAudio);

    if (!transcript) {
      this.logger.verbose('No transcription available.');
      return;
    }
    fs.writeFileSync(filePath, cleanedAudio);
    this.resetAudioCaptureBuffer();

    console.log(`user: ${transcript}`);
    const responseFromLLM = await this.sendTranscriptToLLM(transcript);
    console.log(`LLM: ${responseFromLLM}`);

    // await this.voiceSynthesis.synthesize(responseFromLLM);
  }

  stopRecording() {
    try {
      if (this.micInstance) {
        this.micInstance.stop();
      }
    } catch (error) {
      this.logger.error('Error in stopRecording:', error);
    }
  }

  private initializeMicInstance() {
    this.micInstance = mic({ ...MicInstanceConfigs, debug: this.DEBUG });
    this.micInputStream = this.micInstance.getAudioStream();
    this.micInputStream.on('data', (data: Buffer) => {
      this.audioBuffer = Buffer.concat([this.audioBuffer, data]);
    });
    this.micInputStream.on('error', (err: Error) => {
      this.logger.error('Error in micInputStream:', err);
    });

    this.micInputStream.on('silence', () => {
      this.logger.log('Silence detected...');
      this.stopRecording();
    });

    this.micInputStream.on('stopComplete', () => {
      this.logger.log('Recording stopped.');
    });
  }

  private async transcribeBufferedAudio(audioBuffer: Buffer) {
    const [transcription, error] =
      await this.transcriptor.transcribe(audioBuffer);
    if (transcription) {
      return transcription;
    }
    this.logger.error(error);
  }

  private getFilePath() {
    const now = moment();
    const date = now.format('DD-MM-YYYY');
    const time = moment().format('HH:mm:ss');
    const recordingsDir = this.configService.get<string>(
      'RECORDINGS_DIR',
      'recordings',
    );
    const dir = path.join(process.cwd(), recordingsDir, date);
    const filePath = path.join(dir, `${time}.wav`);
    return { filePath, dir };
  }

  private createDirectory(dir: string) {
    if (fs.existsSync(dir)) {
      this.logger.debug(`Directory already exists: ${dir}`);
      return;
    }
    this.logger.log(`Creating directory: ${dir}`);
    return fs.mkdirSync(dir, { recursive: true });
  }

  private resetAudioCaptureBuffer() {
    this.audioBuffer = Buffer.alloc(0);
  }

  private async sendTranscriptToLLM(transcript: string) {
    const applicationUrl = `http://localhost:${this.configService.get('APPLICATION_PORT')}/ollama/chat`;
    const response = await lastValueFrom(
      this.httpService.post(applicationUrl, {
        prompt: transcript,
      }),
    );
    if (this.DEBUG) {
      this.logger.debug('responseFromLLM ', response.data);
    }
    return response.data as string;
  }
}
