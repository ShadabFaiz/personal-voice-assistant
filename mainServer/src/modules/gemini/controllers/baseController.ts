import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatDto } from '../dtos';
import { CloudLLMServiceV2 } from '../services/ollama/cloudLLM.service.v2';

@Controller('gemini')
export class BaseController {
  constructor(private readonly cloudllmService: CloudLLMServiceV2) {}

  @Post('chat')
  async chat(@Body() body: ChatDto, @Res() res: Response) {
    try {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      const { prompt } = body;

      const response = await this.cloudllmService.chat(prompt);
      res.send(response);
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).send('An error occurred while processing your request.');
    }
  }
}
