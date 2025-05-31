import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/ollama';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { HelperService } from '../../helper';
import { SystemPromptsService } from './systemPrompts.service';

@Injectable()
export class OllamaService implements OnModuleInit {
  private model: ChatOllama;
  private memory: BufferMemory;
  private chain: ConversationChain;
  private readonly logger = new Logger(OllamaService.name);
  private agentPersonality: string;

  constructor(
    private configService: ConfigService,
    private readonly helperService: HelperService,
    private readonly systemPromptsService: SystemPromptsService,
  ) {
    this.logger.log('OllamaService constructor called');
  }

  async onModuleInit(): Promise<void> {
    const baseUrl = this.configService.get<string>(
      'OLLAMA_BASE_URL',
      'http://localhost:11434',
    );
    const model = this.configService.get<string>('MODEL_NAME');
    this.agentPersonality = this.configService.get<string>(
      'AGENT_PERSONALITY',
      '',
    );

    const isOllamaRunning = await this.helperService.checkOllamaStatus(baseUrl);
    if (!isOllamaRunning) {
      throw Error(
        `Ollama is not running at ${baseUrl}. Please start Ollama server.`,
      );
    }

    this.model = new ChatOllama({ baseUrl, model });
    this.memory = new BufferMemory();
    const chatPrompt = this.initializeSystemPrompts();

    this.chain = new ConversationChain({
      llm: this.model,
      memory: this.memory,
      prompt: chatPrompt,
    });
  }

  private initializeSystemPrompts() {
    const allSystmePrompts = this.systemPromptsService.loadAllSystemPrompts();
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(allSystmePrompts),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
    return chatPrompt;
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
      this.logger.log('Interacting with Ollama.');
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
