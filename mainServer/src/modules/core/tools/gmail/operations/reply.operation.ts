import { gmail_v1 } from 'googleapis';
import { GMAIL_USER_ME, METADATA_HEADERS_REPLY } from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class ReplyToEmailOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    const { emailId, body } = params;
    if (!emailId || !body) {
      throw new Error(
        'emailId and body are required for replyToEmail operation',
      );
    }

    const original = await gmail.users.messages.get({
      userId: GMAIL_USER_ME,
      id: emailId,
      format: 'metadata',
      metadataHeaders: METADATA_HEADERS_REPLY,
    });

    const headers = original.data.payload?.headers || [];
    const subject = headers.find((h) => h.name === 'Subject')?.value || '';
    const messageId = headers.find((h) => h.name === 'Message-ID')?.value || '';
    const from = headers.find((h) => h.name === 'From')?.value || '';
    const threadId = original.data.threadId;

    const replySubject = subject.toLowerCase().startsWith('re:')
      ? subject
      : `Re: ${subject}`;

    const messageParts = [
      `To: ${from}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
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
        threadId: threadId || undefined,
      },
    });

    return [
      null,
      {
        status: 'success',
        operation: 'replyToEmail',
        emailId: res.data.id || '',
      },
    ];
  }
}
