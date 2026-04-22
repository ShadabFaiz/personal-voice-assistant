import { gmail_v1 } from '@googleapis/gmail';
import { GMAIL_USER_ME } from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class CreateDraftEmailOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    const { to, subject, body } = params;

    const messageParts: string[] = [];
    if (to) {
      messageParts.push(`To: ${to}`);
    }

    messageParts.push('Content-Type: text/plain; charset=utf-8');
    messageParts.push('MIME-Version: 1.0');

    if (subject) {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      messageParts.push(`Subject: ${utf8Subject}`);
    }

    messageParts.push('');
    if (body) {
      messageParts.push(body);
    }

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.drafts.create({
      userId: GMAIL_USER_ME,
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    return [
      null,
      {
        status: 'success',
        operation: 'createDraftEmail',
        emailId: res.data.id || '',
      },
    ];
  }
}
