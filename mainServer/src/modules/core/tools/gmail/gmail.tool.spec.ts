import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { google } from 'googleapis';
import { GmailTool } from './gmail.tool';

const mockGmail = {
  users: {
    messages: {
      list: jest.fn(),
      get: jest.fn(),
      send: jest.fn(),
      trash: jest.fn(),
      modify: jest.fn(),
    },
    drafts: {
      create: jest.fn(),
    },
  },
};

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    gmail: jest.fn(() => mockGmail),
  },
}));

describe('GmailTool', () => {
  let tool: GmailTool;
  let configService: ConfigService;

  const mockConfig = {
    GOOGLE_CLIENT_ID: 'client-id',
    GOOGLE_CLIENT_SECRET: 'client-secret',
    GOOGLE_REFRESH_TOKEN: 'refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailTool,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              (key: string) => mockConfig[key as keyof typeof mockConfig],
            ),
          },
        },
      ],
    }).compile();

    tool = module.get<GmailTool>(GmailTool);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('execute', () => {
    it('should initialize OAuth2 client and use Gmail client', async () => {
      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: [] },
      });
      await tool.execute({ operation: 'getLatestEmails', maxResults: 5 });
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        'client-id',
        'client-secret',
      );
      expect(google.gmail).toHaveBeenCalled();
    });

    it('should handle getUnreadEmails', async () => {
      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: [{ id: 'msg1' }] },
      });
      mockGmail.users.messages.get.mockResolvedValue({
        data: {
          id: 'msg1',
          snippet: 'Hello',
          payload: {
            headers: [
              { name: 'Subject', value: 'Test Subject' },
              { name: 'From', value: 'Sender <sender@example.com>' },
              { name: 'Date', value: 'Today' },
            ],
          },
        },
      });

      const [error, result] = await tool.execute({
        operation: 'getUnreadEmails',
      });

      expect(error).toBeNull();
      expect(result!.status).toBe('success');
      expect(result!.emails!).toHaveLength(1);
      expect(result!.emails![0].subject).toBe('Test Subject');
      expect(mockGmail.users.messages.list).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'is:unread' }),
      );
    });

    it('should handle sendEmail', async () => {
      mockGmail.users.messages.send.mockResolvedValue({
        data: { id: 'new-msg-id' },
      });

      const [error, result] = await tool.execute({
        operation: 'sendEmail',
        to: 'recipient@example.com',
        subject: 'Hello',
        body: 'World',
      });

      expect(error).toBeNull();
      expect(result!.status).toBe('success');
      expect(result!.emailId).toBe('new-msg-id');
      expect(mockGmail.users.messages.send).toHaveBeenCalled();
    });

    it('should handle createDraftEmail', async () => {
      mockGmail.users.drafts.create.mockResolvedValue({
        data: { id: 'new-draft-id' },
      });

      const [error, result] = await tool.execute({
        operation: 'createDraftEmail',
        to: 'recipient@example.com',
        subject: 'Hello',
        body: 'World',
      });

      expect(error).toBeNull();
      expect(result!.status).toBe('success');
      expect(result!.emailId).toBe('new-draft-id');
      expect(mockGmail.users.drafts.create).toHaveBeenCalled();
    });

    it('should handle deleteEmail', async () => {
      mockGmail.users.messages.trash.mockResolvedValue({ data: {} });

      const [error, result] = await tool.execute({
        operation: 'deleteEmail',
        emailId: 'msg123',
      });

      expect(error).toBeNull();
      expect(result!.status).toBe('success');
      expect(mockGmail.users.messages.trash).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'msg123' }),
      );
    });

    it('should handle markAsRead', async () => {
      mockGmail.users.messages.modify.mockResolvedValue({ data: {} });

      const [error, result] = await tool.execute({
        operation: 'markAsRead',
        emailId: 'msg123',
      });

      expect(error).toBeNull();
      expect(result!.status).toBe('success');
      expect(mockGmail.users.messages.modify).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'msg123',
          requestBody: { removeLabelIds: ['UNREAD'] },
        }),
      );
    });

    it('should handle readEmail with complex parts', async () => {
      mockGmail.users.messages.get.mockResolvedValue({
        data: {
          id: 'msg1',
          payload: {
            headers: [
              { name: 'Subject', value: 'Test Subject' },
              { name: 'From', value: 'Sender <sender@example.com>' },
              { name: 'Date', value: 'Today' },
            ],
            parts: [
              { mimeType: 'text/html', body: { data: 'PGgxPkhlbGxvPC9oMT4=' } }, // <h1>Hello</h1>
              { mimeType: 'text/plain', body: { data: 'SGVsbG8gV29ybGQ=' } }, // Hello World
            ],
          },
        },
      });

      const [error, result] = await tool.execute({
        operation: 'readEmail',
        emailId: 'msg1',
      });

      expect(error).toBeNull();
      expect(result!.email!.body).toBe('Hello World');
    });

    it('should return error for unknown operation', async () => {
      const [error, result] = await tool.execute({
        operation: 'unknown' as any,
      });
      expect(error!.status).toBe('error');
      expect(error!.error).toContain('Unknown operation');
      expect(result).toBeNull();
    });
  });
});
