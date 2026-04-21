declare module 'mic' {
  import { Readable } from 'stream';

  export interface MicInstance {
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    getAudioStream(): Readable;
  }

  export interface MicOptions {
    rate: string; // e.g., '16000'
    channels: string; // e.g., '1'
    debug?: boolean; // Optional: Enable debug logs
    exitOnSilence?: number; // Optional: Exit after silence (in milliseconds)
    fileType?: string; // Optional: File type (e.g., 'wav')
    device?: string; // Optional: Audio device to use
    endian?: string; // Optional: Endianness (e.g., 'little')
    bitwidth?: string; // Optional: Bit width (e.g., '16')
    encoding?: string; // Optional: Encoding type (e.g., 'signed-integer')
  }

  export default function mic(options: MicOptions): MicInstance;
}
