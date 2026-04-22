import { gmail_v1 } from '@googleapis/gmail';
import { GMAIL_USER_ME } from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class MarkAsReadOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    const { emailId } = params;
    if (!emailId) {
      throw new Error('emailId is required for markAsRead operation');
    }

    await gmail.users.messages.modify({
      userId: GMAIL_USER_ME,
      id: emailId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });

    return [
      null,
      {
        status: 'success',
        operation: 'markAsRead',
      },
    ];
  }
}
