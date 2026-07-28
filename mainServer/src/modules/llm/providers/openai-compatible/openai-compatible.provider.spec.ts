import { SystemPromptsService, UserDefinedPromptsService } from '@core/services';
import { ToolsService } from '@core/tools/tools.service';
import { ConfigService } from '@nestjs/config';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    bindTools: jest.fn().mockReturnValue({}),
  })),
}));

jest.mock('@langchain/langgraph/prebuilt', () => ({
  ToolNode: jest.fn(),
}));

describe('OpenAICompatibleProvider', () => {
  let provider: OpenAICompatibleProvider;
  let configService: ConfigService;
  let systemPromptsService: SystemPromptsService;
  let userDefinedPromptsService: UserDefinedPromptsService;
  let toolService: ToolsService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-key';
        if (key === 'OPENAI_BASE_URL') return 'https://test.api/v1';
        if (key === 'MODEL_NAME') return 'test-model';
        return null;
      }),
    } as any;

    systemPromptsService = {
      loadAllSystemPrompts: jest.fn().mockReturnValue('system prompt'),
    } as any;

    userDefinedPromptsService = {
      loadAllUserDefinedPrompts: jest.fn().mockResolvedValue('user prompt'),
    } as any;

    toolService = {
      getAllTools: jest.fn().mockReturnValue([]),
    } as any;

    provider = new OpenAICompatibleProvider(
      configService as any,
      systemPromptsService as any,
      userDefinedPromptsService as any,
      toolService as any,
    );
  });

  it('should initialize correctly', async () => {
    const result = await provider.initialize();
    expect(result).toBeDefined();
    expect(result.modelWithTools).toBeDefined();
    expect(result.toolNode).toBeDefined();
    expect(result.chatPromptTemplate).toBeDefined();
    expect(configService.get).toHaveBeenCalledWith('OPENAI_API_KEY');
    expect(configService.get).toHaveBeenCalledWith('OPENAI_BASE_URL');
  });
});
