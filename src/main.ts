import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './expectionFilters/httpExceptionFilter';

dotenv.config();

async function main() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Application', { timestamp: true });
  const PORT = process.env.APPLICATION_PORT || 3000;
  app.useGlobalFilters(new HttpExceptionFilter());
  logger.log(`Starting Application on port ${PORT}`);

  await app.listen(PORT);
  logger.log(`Application is running on http://localhost:${PORT}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
