/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as fs from 'fs';
import mic from 'mic';
import moment from 'moment-timezone';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from '../../../../config/configuration.interface';
import { FFMPEGAudioCleaner } from '../audioCleaner';
import { FasterWhisperTranscriptor } from '../transcriptors/fasterWhisperTranscriptor';
import { MicInstanceConfigs } from './configs';

@Injectable()
export class VoiceChatService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private micInstance: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private micInputStream: any;
  private isRecording: boolean = false;
  private audioBuffer: Buffer = Buffer.alloc(0);
  private readonly logger = new Logger(VoiceChatService.name);
  private readonly DEBUG = false;

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly transcriptor: FasterWhisperTranscriptor,
    private readonly ffmpegAudioCleaner: FFMPEGAudioCleaner,
    private readonly httpService: HttpService,
  ) {
    this.DEBUG = this.configService.get('DEBUG', false);
  }

  startRecording(res: Response) {
    try {
      if (this.isRecording) {
        res.status(400).send('Recording is already in progress.');
        return;
      }
      this.resetAudioCaptureBuffer();

      this.initializeMicInstance();
      this.micInstance.start();
      this.isRecording = true;
      this.logger.log('Started recording...');
      this.micInputStream.on(
        'audioProcessExitComplete',
        async () => await this.onAudioCaptureComplete(res),
      );
    } catch (error) {
      this.logger.error('Error in startRecording:', error);
      res.status(500).send('An error occurred while starting the recording.');
    }
  }

  private async onAudioCaptureComplete(response: Response) {
    const { filePath, dir } = this.getFilePath();
    this.createDirectory(dir);
    const cleanedAudio = await this.ffmpegAudioCleaner.cleanAudio(
      this.audioBuffer,
      filePath,
    );
    const transcript = await this.transcribeBufferedAudio(cleanedAudio);

    if (!transcript) {
      return response.status(200).send(`Failed to transcript audio`);
    }

    fs.writeFileSync(filePath, cleanedAudio);
    this.resetAudioCaptureBuffer();
    const responseFromLLM = await this.sendTranscriptToLLM(transcript);

    response.status(200).send(`Response: ${responseFromLLM}`);
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

      this.isRecording = false;
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
    const [trenscription, error] =
      await this.transcriptor.transcribe(audioBuffer);
    if (trenscription) {
      return trenscription;
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
