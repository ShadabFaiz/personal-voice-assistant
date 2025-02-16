declare module 'mic' {
    interface MicOptions {
        rate?: string;
        channels?: string;
        debug?: boolean;
        exitOnSilence?: number;
        device?: string;
    }

    interface MicInstance {
        getAudioStream(): NodeJS.ReadableStream;
        start(): void;
        stop(): void;
    }

    function mic(options?: MicOptions): MicInstance;

    export = mic;
}