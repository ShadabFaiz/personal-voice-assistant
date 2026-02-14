import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { HttpExceptionFilter } from './expectionFilters/httpExceptionFilter';
dotenv.config();

function printEnvVariables() {
  console.log('****** Configurations ******');

  const config = configuration();
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      
    }
  }
  console.log('************');
}

async function main() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  const logger = new Logger('Application', { timestamp: true });
  const PORT = process.env.APPLICATION_PORT || 3000;
  logger.log(`Starting Application on port ${PORT}`);

  await app.listen(PORT);
  logger.log(`Application is running on http://localhost:${PORT}`);

  // const voiceChatService = app.get(VoiceChatServiceV2);
  // const micInstance = voiceChatService.startRecording();

  printEnvVariables(); 
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
