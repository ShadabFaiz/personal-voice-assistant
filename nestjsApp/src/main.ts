import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './expectionFilters/httpExceptionFilter';
dotenv.config();

async function main() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  const logger = new Logger('Application', { timestamp: true });
  const PORT = process.env.APPLICATION_PORT || 3000;
  logger.log(`Starting Application on port ${PORT}`);

  await app.listen(PORT);
  logger.log(`Application is running on http://localhost:${PORT}`);

  // const app = await NestFactory.createApplicnationContext(AppModule);

  // const transcriptor = app.get(PicovoiceTranscriptor);

  // const applicationRoot = path.dirname(__dirname);
  // const filePath = `${applicationRoot}/recordings/16-02-2025/16:07:40.wav`;
  // console.log('filePath: ', filePath)
  // const transcription = await transcriptor.transcribeAudioFile(filePath);
  // console.log('Transcription:', transcription);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
