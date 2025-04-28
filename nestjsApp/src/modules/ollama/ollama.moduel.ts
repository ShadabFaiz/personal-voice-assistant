import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OllamaController } from './controllers/ollama';
import { HelperService } from './helper';
import { OllamaService } from './services';

@Module({
  imports: [HttpModule],
  controllers: [OllamaController],
  providers: [OllamaService, HelperService],
})
export class OllamaModule {}
