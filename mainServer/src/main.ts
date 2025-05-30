import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { HttpExceptionFilter } from './expectionFilters/httpExceptionFilter';
import { VoiceChatServiceV2 } from './modules/voiceChat/services/voiceChat/voice-chat.service_v2';
dotenv.config();

function printEnvVariables() {
  console.log('****** Ollama Configuration ******');

  const config = configuration();
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      console.log(`${key}: ${config[key]}`);
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

  const voiceChatService = app.get(VoiceChatServiceV2);
  const micInstance = voiceChatService.startRecording();

  // const app = await NestFactory.createApplicnationContext(AppModule);

  // const transcriptor = app.get(PicovoiceTranscriptor);

  // const applicationRoot = path.dirname(__dirname);
  // const filePath = `${applicationRoot}/input.wav`;
  // console.log('filePath: ', filePath);
  // const fileContent = fs.readFileSync(filePath);
  // console.log('file read', fileContent);
  // const httpService = app.get(HttpService);
  // const response = await httpService.axiosRef.post(
  //   'http://0.0.0.0:8000/transcript',
  //   fileContent,
  //   {
  //     headers: { 'Content-Type': 'audio/wav' },
  //   },
  // );
  // console.log('response: ', response.data);
  printEnvVariables();
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
