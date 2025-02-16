import { Injectable, Logger } from '@nestjs/common';
import { Cheetah } from '@picovoice/cheetah-node';
import * as fs from 'fs';
import * as wav from 'wav-decoder';

@Injectable()
export class PicovoiceTranscriptor {
    private readonly logger = new Logger(PicovoiceTranscriptor.name);
    private cheetah: Cheetah;
    private frameLength = 512;

    constructor() {
        const accessKey = process.env.PICOVOICE_ACCESS_KEY;
        if (!accessKey) {
            throw new Error('PICOVOICE_ACCESS_KEY environment variable is not set.');
        }

        this.cheetah = new Cheetah(accessKey, { enableAutomaticPunctuation: true });
    }


    async transcribeAudioFile(filePath: string) {
        try {
            const audioBuffer = await this.getAudioBufferFromFile(filePath);
            const transcription = this.transcribe(audioBuffer);
            this.release();
            return transcription;
        } catch (error) {
            this.logger.error('Failed to transcribe audio', error);
            throw new Error('Failed to transcribe audio');
        }
    }

    private async getAudioBufferFromFile(filePath: string): Promise<Int16Array> {
        try {
            const audioData = await wav.decode(fs.readFileSync(filePath));
            const pcmData = audioData.channelData[0];
            const int16Array = new Int16Array(pcmData.length);

            for (let i = 0; i < pcmData.length; i++) {
                int16Array[i] = Math.floor(pcmData[i] * 32767);
            }

            return int16Array;
        } catch (error) {
            this.logger.error('Error reading or decoding WAV file:', error);
            throw new Error('Failed to process the audio file');
        }
    }


    transcribe(audioBuffer: Int16Array) {
        const transcriptionResults: any[] = [];

        // Chhetah process audio per 512 frames. When we are not using its own recorder, we have to manually set the frame size.
        const totalFrames = Math.ceil(audioBuffer.length / this.frameLength);

        for (let i = 0; i < totalFrames; i++) {
            const frameStart = i * this.frameLength;
            const frameEnd = Math.min((i + 1) * this.frameLength, audioBuffer.length);
            let frame = audioBuffer.slice(frameStart, frameEnd);

            if (frame.length < this.frameLength) {
                const paddedFrame = new Int16Array(this.frameLength);
                paddedFrame.set(frame);
                frame = paddedFrame;
            }

            const transcript = this.cheetah.process(frame);
            // console.log('audioBuffer ', audioBuffer);
            // console.log('transcript ', transcript);
            const audioText = transcript[0].trim();
            if (audioText) {
                console.log('audioText ', audioText)
                transcriptionResults.push(audioText)
            }
        }

        const flushed = this.cheetah.flush();
        const trimmedFlushedText = flushed.trim();

        const combinedTranscription = transcriptionResults.join(' ');

        console.log('combinedTranscription ', combinedTranscription)


        if (trimmedFlushedText) {
            return combinedTranscription + trimmedFlushedText;
        }
        return combinedTranscription
    }

    flush() {
        this.cheetah.flush();
    }

    release() {
        this.cheetah.release();
    }
}
