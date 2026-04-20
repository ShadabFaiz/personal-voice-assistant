import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, gmail_v1, google } from 'googleapis';
import { z } from 'zod';

import { AppConfig } from '@core/config';
import { toolDescription } from './description';
import {
  GmailOperation,
  GmailToolParams,
  GmailToolResponse,
} from './gmail-tool.types';
import { DeleteEmailOperation } from './operations/delete.operation';
import { GetLatestEmailsOperation } from './operations/get-latest.operation';
import { GetUnreadEmailsOperation } from './operations/get-unread.operation';
import { ReadEmailOperation } from './operations/read.operation';
import { ReplyToEmailOperation } from './operations/reply.operation';
import { SearchEmailsOperation } from './operations/search.operation';
import { SendEmailOperation } from './operations/send.operation';

@Injectable()
export class GmailTool {
  private readonly logger = new Logger(GmailTool.name);
  private readonly oauth2Client: Auth.OAuth2Client | null = null;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

    if (clientId && clientSecret && refreshToken) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    }
  }

  private getGmailClient(): gmail_v1.Gmail {
    if (!this.oauth2Client) {
      throw new Error('Gmail API credentials are not fully configured in .env');
    }
    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async execute(
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    try {
      const gmail = this.getGmailClient();

      switch (params.operation) {
        case 'getUnreadEmails':
          return await new GetUnreadEmailsOperation().execute(gmail, params);
        case 'getLatestEmails':
          return await new GetLatestEmailsOperation().execute(gmail, params);
        case 'searchEmails':
          return await new SearchEmailsOperation().execute(gmail, params);
        case 'readEmail':
          return await new ReadEmailOperation().execute(gmail, params);
        case 'sendEmail':
          return await new SendEmailOperation().execute(gmail, params);
        case 'replyToEmail':
          return await new ReplyToEmailOperation().execute(gmail, params);
        case 'deleteEmail':
          return await new DeleteEmailOperation().execute(gmail, params);
        default:
          return [
            {
              status: 'error',
              operation: String(params.operation) as GmailOperation,
              error: `Unknown operation: ${String(params.operation)}`,
            },
            null,
          ];
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const operation = String(params.operation) as GmailOperation;
      this.logger.error(`Gmail operation ${operation} failed: ${errorMessage}`);
      return [
        {
          status: 'error',
          operation,
          error: errorMessage,
        },
        null,
      ];
    }
  }

  getGmailTool() {
    return tool(
      (params: z.infer<typeof this.gmailSchema>) => this.execute(params),
      {
        name: 'gmail_tool',
        description: toolDescription,
        schema: this.gmailSchema,
        responseFormat: 'content_and_artifact',
      },
    );
  }

  private get gmailSchema() {
    return z.object({
      operation: z.enum([
        'getUnreadEmails',
        'getLatestEmails',
        'searchEmails',
        'readEmail',
        'sendEmail',
        'replyToEmail',
        'deleteEmail',
      ]),
      maxResults: z.number().optional(),
      query: z.string().optional(),
      emailId: z.string().optional(),
      to: z.string().optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
    });
  }

  getAllTools() {
    return [this.getGmailTool()];
  }
}
