import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatDto } from '../dtos/chat';
import { LLMService } from '../services/llm.service';

@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto, @Res() res: Response) {
    try {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
      const { prompt } = body;
      const response = await this.llmService.chat(prompt);
      res.send(response);
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).send('An error occurred while processing your request.');
    }
  }
}
