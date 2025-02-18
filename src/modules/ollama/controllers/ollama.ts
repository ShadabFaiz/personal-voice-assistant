import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatDto } from '../dtos';
import { OllamaService } from '../services';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto, @Res() res: Response) {
    try {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      const { prompt } = body;

      await this.ollamaService.chatStream(prompt, (token) => {
        res.write(token);
      });

      res.end();
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).send('An error occurred while processing your request.');
    }
  }
}
