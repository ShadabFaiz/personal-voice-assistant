import Mailjs from '@cemalgnlts/mailjs';
import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { toolDescription } from './description';
import { CreateRandomTempEmailAccountOperation } from './operations/create-random-temp-email.operation';
import { CreateTempEmailOperation } from './operations/create-temp-email.operation';
import { LoginWithIdAndPasswordParams } from './operations/interface';
import { LoginWithIdAndPasswordOperation } from './operations/login-with-id-and-password.operation';
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

  constructor(private readonly mailJs: Mailjs) {
    this.createTempEmailOperation = new CreateTempEmailOperation();
    this.createRandomTempEmailAccountOperation =
      new CreateRandomTempEmailAccountOperation(mailJs);
    this.loginWithIdAndPasswordOperation = new LoginWithIdAndPasswordOperation(
      mailJs,
    );
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
    });
  }

  private getTempMailTool() {
    return tool(
      async (params: z.infer<typeof this.tempMailSchema>) => {
        const result = await this.execute({
          operation: params.operation as TempMailOperation,
          emailId: params.emailId,
        });
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
