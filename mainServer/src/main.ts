import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './expectionFilters/httpExceptionFilter';
import { AppConfigFunction } from './modules/core/config/configuration';
dotenv.config();

function printEnvVariables() {
  console.log('****** Configurations ******');

  const config = AppConfigFunction();
  for (const key in config) {
    console.log(`  ${key}: ${config[key as keyof typeof config]}`);
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
