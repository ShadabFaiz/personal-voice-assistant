import { gmail_v1 } from '@googleapis/gmail';
import { GMAIL_USER_ME } from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class ReadEmailOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    if (!params.emailId) {
      throw new Error('emailId is required for readEmail operation');
    }

    const res = await gmail.users.messages.get({
      userId: GMAIL_USER_ME,
      id: params.emailId,
    });

    const detail = res.data;
    const headers = detail.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
    const fromValue = headers.find((h) => h.name === 'From')?.value || '';
    const date = headers.find((h) => h.name === 'Date')?.value || '';
    const fromMatch = fromValue.match(/^(.*?)\s*<(.*)>$/) || [
      null,
      fromValue,
      fromValue,
    ];

    const findTextPart = (payload: gmail_v1.Schema$MessagePart): string => {
      if (payload.mimeType === 'text/plain' && payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }
      if (payload.parts) {
        for (const part of payload.parts) {
          const result = findTextPart(part);
          if (result) return result;
        }
      }
      return '';
    };

    const body = detail.payload ? findTextPart(detail.payload) : '';

    return [
      null,
      {
        status: 'success',
        operation: 'readEmail',
        email: {
          id: params.emailId,
          subject,
          from: {
            name: (fromMatch[1] || '').trim(),
            email: (fromMatch[2] || '').trim(),
          },
          date,
          body,
        },
      },
    ];
  }
}
