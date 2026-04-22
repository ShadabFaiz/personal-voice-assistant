import { gmail_v1 } from '@googleapis/gmail';
import { GmailToolParams, GmailToolResponse } from '../gmail-tool.types';

export interface IGmailOperation {
  execute(
    gmail: gmail_v1.Gmail,
    params: GmailToolParams,
  ): Promise<
    [Partial<GmailToolResponse> | null, Partial<GmailToolResponse> | null]
  >;
}
