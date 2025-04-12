import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import mic from 'mic';
import moment from 'moment-timezone';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { AppConfig } from '../../../../config/configuration.interface';
import { FFMPEGAudioCleaner } from '../audioCleaner';
import { FasterWhisperTranscriptor } from '../transcriptors/fasterWhisperTranscriptor';
import { VoiceSynthesis } from '../voiceSynthesis/voiceSynthesis';
import { MicInstanceConfigs } from './configs';

@Injectable()
export class VoiceChatServiceV2 {
  private micInstance: ReturnType<typeof mic>;
  private micInputStream: Readable;
  private isRecording: boolean = false;
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
  }

  startRecording() {
    try {
      if (this.isRecording) {
        this.logger.log('Recording is already in progress.');
        return;
      }
      this.resetAudioCaptureBuffer();

      this.initializeMicInstance();
      this.micInstance.start();
      this.isRecording = true;
      this.logger.log('Started recording...');
      this.micInputStream.on(
        'audioProcessExitComplete',
        async () => await this.onAudioCaptureComplete(),
      );
    } catch (error) {
      this.logger.error('Error in startRecording:', error);
      this.logger.error('Error stack:', error.stack);
    }
  }

  private async onAudioCaptureComplete() {
    const { filePath, dir } = this.getFilePath();
    this.createDirectory(dir);
    const cleanedAudio = await this.ffmpegAudioCleaner.cleanAudio(
      this.audioBuffer,
      filePath,
    );
    const transcript = await this.transcribeBufferedAudio(cleanedAudio);

    if (!transcript) {
      this.logger.error('Failed to transcribe audio');
      return;
    }

    fs.writeFileSync(filePath, cleanedAudio);
    this.resetAudioCaptureBuffer();

    const responseFromLLM = await this.sendTranscriptToLLM(transcript);
    // await this.voiceSynthesis.synthesize(responseFromLLM);

    this.logger.log('Transcription:', transcript);
    this.logger.log('Audio saved to:', filePath);
    this.logger.log('Response from LLM:', responseFromLLM);
  }

  stopRecording() {
    try {
      if (!this.isRecording) {
        this.logger.log('No recording in progress.');
        return;
      }

      if (this.micInstance) {
        this.micInstance.stop();
      }

      this.logger.log('Old  this.isRecording = false;');
      // this.isRecording = false;
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

  private convertBufferToInt16Array(buffer: Buffer): Int16Array {
    const pcmData = new Int16Array(buffer.length / 2);
    for (let i = 0; i < buffer.length; i += 2) {
      pcmData[i / 2] = buffer.readInt16LE(i);
    }
    return pcmData;
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
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
