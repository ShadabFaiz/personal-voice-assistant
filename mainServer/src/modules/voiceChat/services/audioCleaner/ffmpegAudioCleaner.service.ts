import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { PassThrough } from 'stream';
import { MINIMMUM_AUDIO_BUFFER_SIZE } from './constants';

@Injectable()
export class FFMPEGAudioCleaner {
  cleanAudio(
    inputBuffer: Buffer,
    temporaryFileDirectoryPath: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (inputBuffer.byteLength < MINIMMUM_AUDIO_BUFFER_SIZE) {
        console.log('inputBuffer is empty. Skipping cleaning.');
        return resolve(inputBuffer);
      }
      const bufferStream = new PassThrough();
      bufferStream.end(inputBuffer);

      const outputFilePath = temporaryFileDirectoryPath;

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
