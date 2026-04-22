import { gmail_v1 } from '@googleapis/gmail';
import {
  DEFAULT_MAX_RESULTS,
  GMAIL_USER_ME,
  MAX_EMAIL_LIST_LIMIT,
  METADATA_HEADERS_SUMMARY,
} from '../constants';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';
import { IGmailOperation } from './base.operation';

export class SearchEmailsOperation implements IGmailOperation {
  async execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  > {
    const maxResults = params.maxResults || DEFAULT_MAX_RESULTS;
    const query = params.query || '';
    const res = await gmail.users.messages.list({
      userId: GMAIL_USER_ME,
      q: query,
      maxResults: Math.min(maxResults, MAX_EMAIL_LIST_LIMIT),
    });

    const messages = res.data.messages || [];
    const emails = await Promise.all(
      messages.map(async (msg: gmail_v1.Schema$Message) => {
        const detail = await gmail.users.messages.get({
          userId: GMAIL_USER_ME,
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: METADATA_HEADERS_SUMMARY,
        });

        const headers = detail.data.payload?.headers || [];
        const subject =
          headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
        const fromValue = headers.find((h) => h.name === 'From')?.value || '';
        const date = headers.find((h) => h.name === 'Date')?.value || '';

        const fromMatch = fromValue.match(/^(.*?)\s*<(.*)>$/) || [
          null,
          fromValue,
          fromValue,
        ];

        return {
          id: msg.id || '',
          subject,
          from: {
            name: (fromMatch[1] || '').trim(),
            email: (fromMatch[2] || '').trim(),
          },
          date,
          snippet: detail.data.snippet || '',
        };
      }),
    );

    return [
      null,
      {
        status: 'success',
        operation: 'searchEmails',
        emails,
      },
    ];
  }
}
