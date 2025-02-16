import { Module } from '@nestjs/common';
import { OllamaController } from './controllers/ollama';
import { OllamaService } from './services';

@Module({
  controllers: [OllamaController],
  providers: [OllamaService],
})
export class OllamaModule { }
