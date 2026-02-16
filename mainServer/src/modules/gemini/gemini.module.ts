import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { BaseController } from './controllers/baseController';
import { HelperService } from './helper';
import { GeminiService } from './services/gemini/geminiService';
import { SystemPromptsService } from './services/gemini/systemPrompts.service';

@Module({
  imports: [HttpModule, CoreModule],
  controllers: [BaseController],
  providers: [HelperService, SystemPromptsService, GeminiService],
})
export class GeminiModule {}
