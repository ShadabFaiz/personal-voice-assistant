import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as fs from 'fs';
import mic from 'mic';
import moment from 'moment-timezone';
import * as path from 'path';
import { AppConfig } from '../../../../config/configuration.interface';
import { MicInstanceConfigs } from './configs';

@Injectable()
export class VoiceChatService {
  private micInstance: any;
  private micInputStream: any;
  private file: fs.WriteStream | null = null;
  private isRecording: boolean = false;
  private readonly logger = new Logger(VoiceChatService.name);

  constructor(private configService: ConfigService<AppConfig>) { }

  startRecording(res: Response) {
    try {
      if (this.isRecording) {
        res.status(400).send('Recording is already in progress.');
        return;
      }

      const { filePath, dir } = this.getFilePath();
      this.createDirectory(dir);

      this.file = this.createWriteStream(filePath);
      this.initializeMicInstance();
      this.micInputStream.pipe(this.file);

      this.micInstance.start();
      this.isRecording = true;
      this.logger.log('Started recording...');
      this.file.on('finish', () => {
        this.logger.log('Recording completed and file written.');
        res.status(200).send('Recording completed and file written.');
      });
    } catch (error) {
      this.logger.error('Error in startRecording:', error);
      res.status(500).send('An error occurred while starting the recording.');
    }
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
    this.micInstance = mic(MicInstanceConfigs);
    this.micInputStream = this.micInstance.getAudioStream();
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

    this.micInputStream.on('audioProcessExitComplete', () => {
      this.file?.end();
      this.file = null;
      this.logger.log('File closed...');
    });
  }

  private getFilePath() {
    const now = moment();
    const date = now.format('DD-MM-YYYY');
    const time = moment().format('HH:mm:ss');
    const recordingsDir = this.configService.get<string>('RECORDINGS_DIR', 'recordings');
    const dir = path.join(process.cwd(), recordingsDir, date);
    const filePath = path.join(dir, `${time}.wav`);
    return { filePath, dir };
  }

  private createDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.logger.log(`Directory created: ${dir}`);
  }

  private createWriteStream(filePath: string) {
    const file = fs.createWriteStream(filePath, { encoding: 'binary' });
    this.logger.log(`Stream created: ${filePath}`);
    file.on('error', (err) => {
      this.logger.log(' FILE ERROR ', err);
    });
    return file;
  }
}
