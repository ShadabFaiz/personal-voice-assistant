import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OllamaController } from './controllers/ollama';
import { HelperService } from './helper';
import { OllamaService } from './services';
import { SystemPromptsService } from './services/ollama/systemPrompts.service';

@Module({
  imports: [HttpModule],
  controllers: [OllamaController],
  providers: [OllamaService, HelperService, SystemPromptsService],
})
export class OllamaModule {}
