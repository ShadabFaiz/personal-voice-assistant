import { gmail_v1 } from 'googleapis';
import { GMAIL_USER_ME } from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class DeleteEmailOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    if (!params.emailId) {
      throw new Error('emailId is required for deleteEmail operation');
    }

    await gmail.users.messages.trash({
      userId: GMAIL_USER_ME,
      id: params.emailId,
    });

    return [
      null,
      {
        status: 'success',
        operation: 'deleteEmail',
      },
    ];
  }
}
