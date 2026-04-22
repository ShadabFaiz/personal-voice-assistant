import { gmail_v1 } from '@googleapis/gmail';
import { GMAIL_USER_ME } from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class SendEmailOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    const { to, subject, body } = params;
    if (!to || !subject || !body) {
      throw new Error(
        'to, subject, and body are required for sendEmail operation',
      );
    }

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: GMAIL_USER_ME,
      requestBody: {
        raw: encodedMessage,
      },
    });

    return [
      null,
      {
        status: 'success',
        operation: 'sendEmail',
        emailId: res.data.id || '',
      },
    ];
  }
}
