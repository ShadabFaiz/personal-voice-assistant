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
import { ToolsService } from '../../../tools/tools.service';
import { HelperService } from '../../helper';
import { SystemPromptsService } from './systemPrompts.service';

@Injectable()
export class OllamaService implements OnModuleInit {
  private readonly model!: ChatOllama;
  private llm!: ChatOllama;
  private llmWithTools!: ReturnType<ChatOllama['bindTools']>;

  private readonly logger = new Logger(OllamaService.name);

  constructor(
    private configService: ConfigService,
    private readonly helperService: HelperService,
    private readonly systemPromptsService: SystemPromptsService,
    private readonly toolService: ToolsService,
  ) {
    this.logger.log('OllamaService constructor called');
  }

  async onModuleInit(): Promise<void> {
    const baseUrl = this.configService.get<string>(
      'OLLAMA_BASE_URL',
      'http://localhost:11434',
    );
    const isOllamaRunning = await this.helperService.checkOllamaStatus(baseUrl);
    if (!isOllamaRunning) {
      return console.log(
        `Ollama is not running at ${baseUrl}. Please start Ollama server.`,
      );
    }
    const modelName = this.configService.get<string>('MODEL_NAME');
    this.llm = new ChatOllama({ baseUrl, model: modelName, verbose: true });

    const tools = [this.toolService.dateToolRunnable];
    this.llmWithTools = this.llm.bindTools(tools);

    // const chatPrompt = this.initializeSystemPrompts();
    // const chatPromptValue = await chatPrompt.invoke({
    //   input: 'hi. How are you ?',
    // });

    // const response = await this.llm.invoke(chatPromptValue);
    // console.log(`Response:`, response.content);
  }

  private initializeSystemPrompts() {
    const allSystmePrompts = this.systemPromptsService.loadAllSystemPrompts();
    const chatPrompt = ChatPromptTemplate.fromMessages(
      [
        SystemMessagePromptTemplate.fromTemplate(allSystmePrompts),
        HumanMessagePromptTemplate.fromTemplate('{input}'),
      ],
      { validateTemplate: true },
    );
    return chatPrompt;
  }

  async chat(userPrompt: string): Promise<string> {
    try {
      const response = await this.llm.invoke(userPrompt);
      console.log(`Response:`, response);
      return response.content as unknown as string;
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
      this.logger.log('Chat stream with Ollama.');
      // await this.chain.stream({
      //   input,
      //   callbacks: [
      //     {
      //       handleLLMNewToken: (token: string) => {
      //         onToken(token);
      //       },
      //     },
      //   ],
      // });
    } catch (error) {
      this.logger.error('Failed to stream response', error);
      onToken(`Got error while trying to connect to Ollama.\n Error: ${error}`);
    }
  }
}
