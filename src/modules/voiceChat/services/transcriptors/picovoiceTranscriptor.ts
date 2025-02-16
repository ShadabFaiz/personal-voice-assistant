// import { Injectable, Logger } from '@nestjs/common';
// import { Cheetah, CheetahTranscript } from '@picovoice/cheetah-node';

// @Injectable()
// export class PicovoiceTranscriptor {
//     private readonly logger = new Logger(PicovoiceTranscriptor.name);
//     private cheetah: Cheetah;

//     constructor() {
//         const accessKey = process.env.PICOVOICE_ACCESS_KEY;
//         if (!accessKey) {
//             throw new Error('PICOVOICE_ACCESS_KEY environment variable is not set.');
//         }

//         this.cheetah = new Cheetah(accessKey);
//     }

//     transcribe(audioBuffer: Buffer): CheetahTranscript {
//         try {
//             const transcript = this.cheetah.process(audioBuffer);
//             this.logger.log(`Transcription: ${transcript.transcript}`);
//             return transcript;
//         } catch (error) {
//             this.logger.error('Failed to transcribe audio', error);
//             throw new Error('Failed to transcribe audio');
//         }
//     }

//     release() {
//         this.cheetah.release();
//     }
// }