import Mailjs from '@cemalgnlts/mailjs';
import { Logger } from '@nestjs/common';
import { TempMailOperation } from '../temp-mail-tool.types';
import { ITempMailOperation } from './base.operation';
import {
  GetInboxParams,
  GetInboxResponse,
  InboxMessageData,
} from './interface/get-inbox.types';

export class GetInboxOperation implements ITempMailOperation<
  GetInboxParams,
  GetInboxResponse
> {
  private readonly logger = new Logger(GetInboxOperation.name);

  constructor(private readonly mailJs: Mailjs) {}

  async execute(params: GetInboxParams): Promise<GetInboxResponse> {
    const page = params.page ?? 1;
    this.logger.log(`Retrieving inbox messages, page: ${page}`);
    try {
      const response = await this.mailJs.getMessages(page);
      this.logger.log(
        `Inbox messages retrieved successfully, ${JSON.stringify(response, null, 2)}`,
      );
      return {
        status: response.status,
        operation: TempMailOperation.GET_INBOX,
        data: response.data.map(
          (msg): InboxMessageData => ({
            id: msg.id,
            accountId: msg.accountId,
            msgid: msg.msgid,
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            intro: msg.intro,
            seen: msg.seen,
            isDeleted: msg.isDeleted,
            hasAttachments: msg.hasAttachments,
            size: msg.size,
            downloadUrl: msg.downloadUrl,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
          }),
        ),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve inbox: ${errorMessage}`);
      return {
        status: false,
        operation: TempMailOperation.GET_INBOX,
        message: errorMessage,
      };
    }
  }
}
