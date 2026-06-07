import Mailjs from '@cemalgnlts/mailjs';
import { Logger } from '@nestjs/common';
import { TempMailOperation } from '../temp-mail-tool.types';
import { ITempMailOperation } from './base.operation';
import {
  ReadEmailParams,
  ReadEmailResponse,
} from './interface/read-email.types';

export class ReadEmailOperation implements ITempMailOperation<
  ReadEmailParams,
  ReadEmailResponse
> {
  private readonly logger = new Logger(ReadEmailOperation.name);

  constructor(private readonly mailJs: Mailjs) {}

  async execute(params: ReadEmailParams): Promise<ReadEmailResponse> {
    this.logger.log(`Reading email with id: ${params.emailId}`);
    try {
      const response = await this.mailJs.getMessage(params.emailId);
      this.logger.log('Email retrieved successfully');
      return {
        status: response.status,
        operation: TempMailOperation.READ_EMAIL,
        data: {
          id: response.data.id,
          accountId: response.data.accountId,
          msgid: response.data.msgid,
          from: response.data.from,
          to: response.data.to,
          subject: response.data.subject,
          intro: response.data.intro,
          text: response.data.text,
          seen: response.data.seen,
          hasAttachments: response.data.hasAttachments,
          attachments: response.data.attachments?.map((attachment) => ({
            id: attachment.id,
            filename: attachment.filename,
            contentType: attachment.contentType,
            downloadUrl: attachment.downloadUrl,
          })),
          size: response.data.size,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to read email: ${errorMessage}`);
      return {
        status: false,
        operation: TempMailOperation.READ_EMAIL,
        message: errorMessage,
      };
    }
  }
}
