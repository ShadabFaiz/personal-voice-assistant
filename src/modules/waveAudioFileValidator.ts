import * as fs from 'fs';
import * as wav from 'wav';


export class WaveAudioFileValidator {

    isValid(filePath: string) {
        this.checkWavHeader(filePath);
        this.inspectWavFile(filePath);
    }



    checkWavHeader(filePath: string) {
        const buffer = Buffer.alloc(12);
        const fd = fs.openSync(filePath, 'r');

        fs.readSync(fd, buffer, 0, 12, 0);
        fs.closeSync(fd);

        const riff = buffer.toString('ascii', 0, 4);
        const wave = buffer.toString('ascii', 8, 12);

        if (riff === 'RIFF' && wave === 'WAVE') {
            console.log('✅ The file has a valid WAV header.');
        } else {
            console.log('❌ The file is NOT a valid WAV file or is corrupted.');
        }
    }


    inspectWavFile(filePath: string) {
        const file = fs.createReadStream(filePath);
        const reader = new wav.Reader();

        reader.on('format', (format) => {
            console.log('✅ WAV File Info:');
            console.log(`Audio Format: ${format.audioFormat === 1 ? 'PCM' : 'Unknown'}`);
            console.log(`Channels: ${format.channels}`);
            console.log(`Sample Rate: ${format.sampleRate} Hz`);
            console.log(`Bit Depth: ${format.bitDepth}`);
        });

        reader.on('error', (err) => {
            console.error('❌ Error reading WAV file:', err);
        });

        file.pipe(reader);
    }

}
