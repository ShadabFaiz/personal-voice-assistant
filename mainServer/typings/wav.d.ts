// src/types/wav-decoder.d.ts

declare module 'wav-decoder' {
  export interface WavData {
    sampleRate: number;
    numberOfChannels: number;
    channelData: number[][]; // Or Int16Array[] if that's the actual type
    bitsPerSample?: number; //Add other properties as needed
    length?: number;
    duration?: number;
  }

  export function decode(buffer: Buffer): Promise<WavData>;
}
