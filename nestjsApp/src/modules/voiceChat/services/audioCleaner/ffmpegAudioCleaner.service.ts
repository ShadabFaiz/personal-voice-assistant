import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import path from 'path';
import { AppConfig } from 'src/config/configuration.interface';
import { PassThrough } from 'stream';

@Injectable()
export class FFMPEGAudioCleaner {
  constructor(private configService: ConfigService<AppConfig>) {}

  cleanAudio(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const bufferStream = new PassThrough();
      bufferStream.end(inputBuffer);

      const recordingsDir = this.configService.get<string>(
        'RECORDINGS_DIR',
        'recordings',
      );
      const outputFilePath = path.join(recordingsDir, 'output.wav');

      ffmpeg(bufferStream)
        .inputFormat('wav')
        .audioFilter('anlmdn')
        .audioFilter('lowpass=f=3000')
        .audioFilter('volume=1.5')
        .output(outputFilePath)
        .on('end', () => {
          const cleanedAudioBuffer = fs.readFileSync(outputFilePath);

          fs.unlinkSync(outputFilePath);

          resolve(cleanedAudioBuffer);
        })
        .on('error', (err) => {
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .run();
    });
  }
}
