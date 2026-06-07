import Mailjs from '@cemalgnlts/mailjs';
import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { CreateRandomTempEmailAccountOperation } from './operations/create-random-temp-email.operation';
import { CreateTempEmailOperation } from './operations/create-temp-email.operation';
import { GetInboxOperation } from './operations/get-inbox.operation';
import {
  GetInboxParams,
  LoginWithIdAndPasswordParams,
  ReadEmailParams,
} from './operations/interface';
import { LoginWithIdAndPasswordOperation } from './operations/login-with-id-and-password.operation';
import { ReadEmailOperation } from './operations/read-email.operation';
import toolDescription from './specification.md';
import {
  GenericResponse,
  TempMailOperation,
  TempMailToolParams,
  TempMailToolResponse,
} from './temp-mail-tool.types';

const TEMP_MAIL_TOOL_DESCRIPTION = toolDescription;

@Injectable()
export class TempMailTool {
  private readonly logger = new Logger(TempMailTool.name);

  private readonly createTempEmailOperation: CreateTempEmailOperation;
  private readonly createRandomTempEmailAccountOperation: CreateRandomTempEmailAccountOperation;
  private readonly loginWithIdAndPasswordOperation: LoginWithIdAndPasswordOperation;
  private readonly readEmailOperation: ReadEmailOperation;
  private readonly getInboxOperation: GetInboxOperation;

  constructor(private readonly mailJs: Mailjs) {
    this.createTempEmailOperation = new CreateTempEmailOperation();
    this.createRandomTempEmailAccountOperation =
      new CreateRandomTempEmailAccountOperation(mailJs);
    this.loginWithIdAndPasswordOperation = new LoginWithIdAndPasswordOperation(
      mailJs,
    );
    this.readEmailOperation = new ReadEmailOperation(mailJs);
    this.getInboxOperation = new GetInboxOperation(mailJs);
  }

  async execute(params: TempMailToolParams): Promise<TempMailToolResponse> {
    try {
      switch (params.operation) {
        case TempMailOperation.CREATE_TEMP_EMAIL:
          return await this.createTempEmailOperation.execute(params);
        case TempMailOperation.CREATE_RANDOM_TEMP_EMAIL_ACCOUNT:
          return await this.createRandomTempEmailAccountOperation.execute();

        case TempMailOperation.LOGIN_WITH_ID_AND_PASSWORD:
          return await this.loginWithIdAndPasswordOperation.execute(
            this.resolveLoginParams(params),
          );

        case TempMailOperation.READ_EMAIL:
          return await this.readEmailOperation.execute(
            this.resolveReadEmailParams(params),
          );

        case TempMailOperation.GET_INBOX:
          return await this.getInboxOperation.execute(
            this.resolveGetInboxParams(params),
          );

        default:
          return this.buildErrorResponse(
            params.operation,
            `Unknown operation: ${String(params.operation)}`,
          );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `TempMail operation ${params.operation} failed: ${errorMessage}`,
      );
      return this.buildErrorResponse(params.operation, errorMessage);
    }
  }

  private resolveLoginParams(
    params: TempMailToolParams,
  ): LoginWithIdAndPasswordParams {
    return {
      emailId: params.emailId ?? '',
      password: params.password ?? '',
    };
  }

  private resolveReadEmailParams(params: TempMailToolParams): ReadEmailParams {
    return {
      emailId: params.emailId ?? '',
    };
  }

  private resolveGetInboxParams(params: TempMailToolParams): GetInboxParams {
    return {
      page: params.page,
    };
  }

  private buildErrorResponse(
    operation: TempMailOperation,
    error: string,
  ): GenericResponse {
    return {
      status: false,
      operation,
      error,
    };
  }

  private get tempMailSchema() {
    return z.object({
      operation: z
        .enum([
          TempMailOperation.CREATE_TEMP_EMAIL,
          TempMailOperation.CREATE_RANDOM_TEMP_EMAIL_ACCOUNT,
          TempMailOperation.GET_INBOX,
          TempMailOperation.LOGIN_WITH_ID_AND_PASSWORD,
          TempMailOperation.READ_EMAIL,
        ])
        .describe('The temp mail operation to perform'),
      emailId: z
        .string()
        .optional()
        .describe('The email ID to read (required for readEmail operation)'),
      password: z
        .string()
        .optional()
        .describe(
          'The password required for login (required for readEmail operation)',
        ),
      page: z
        .number()
        .optional()
        .describe(
          'The page number for paginated inbox retrieval (defaults to 1)',
        ),
    });
  }

  private getTempMailTool() {
    return tool(
      async (params: z.infer<typeof this.tempMailSchema>) => {
        const result = await this.execute(params);
        return JSON.stringify(result);
      },
      {
        name: 'temp_mail_tool',
        description: TEMP_MAIL_TOOL_DESCRIPTION,
        responseFormat: 'content',
        schema: this.tempMailSchema,
      },
    );
  }

  getAllTools() {
    return [this.getTempMailTool()];
  }
}
