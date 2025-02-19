import { ChatOllama } from '@langchain/ollama';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';

@Injectable()
export class OllamaService {
  private readonly model: ChatOllama;
  private readonly memory: BufferMemory;
  private readonly chain: ConversationChain;
  private readonly logger = new Logger(OllamaService.name);

  constructor(private configService: ConfigService) {
    const baseUrl = this.configService.get<string>(
      'OLLAMA_BASE_URL',
      'http://localhost:11434',
    );
    const model = this.configService.get<string>('MODEL_NAME');
    this.logger.log(`OLLAMA_BASE_URL: ${baseUrl}`);
    this.logger.log(`MODEL_NAME: ${model}`);

    this.model = new ChatOllama({ baseUrl, model });
    this.memory = new BufferMemory();
    this.chain = new ConversationChain({
      llm: this.model,
      memory: this.memory,
    });
  }

  async chat(input: string): Promise<string> {
    try {
      const response: Record<string, string> = await this.chain.call({ input });
      this.logger.log(`Response: ${response.response}`);
      return response.response;
    } catch (error) {
      this.logger.error('Failed to get response', error);
      throw new InternalServerErrorException(
        'Failed to get response from Ollama',
      );
    }
  }

  async chatStream(
    input: string,
    onToken: (token: string) => void,
  ): Promise<void> {
    try {
      this.logger.log('Starting chatStream');
      await this.chain.stream({
        input,
        callbacks: [
          {
            handleLLMNewToken: (token: string) => {
              onToken(token);
            },
          },
        ],
      });
    } catch (error) {
      this.logger.error('Failed to stream response', error);
      onToken(`Got error while trying to connect to Ollama.\n Error: ${error}`);
    }
  }
}
