import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { BaseController } from './controllers/baseController';
import { HelperService } from './helper';
import { GeminiService } from './services/gemini/geminiService';

@Module({
  imports: [HttpModule, CoreModule],
  controllers: [BaseController],
  providers: [HelperService, GeminiService],
})
export class GeminiModule {}
