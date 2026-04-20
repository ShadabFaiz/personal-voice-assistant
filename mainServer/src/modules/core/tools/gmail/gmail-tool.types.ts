export type GmailOperation =
  | 'getUnreadEmails'
  | 'getLatestEmails'
  | 'searchEmails'
  | 'readEmail'
  | 'sendEmail'
  | 'replyToEmail'
  | 'deleteEmail'
  | 'createDraftEmail'
  | 'markAsRead';

export interface EmailSummary {
  id: string;
  subject: string;
  from: { name: string; email: string };
  date: string;
  snippet: string;
}

export interface EmailDetail extends Omit<EmailSummary, 'snippet'> {
  body: string;
}

export interface GmailToolParams {
  operation: GmailOperation;
  maxResults?: number;
  query?: string;
  emailId?: string;
  to?: string;
  subject?: string;
  body?: string;
}

export interface GmailToolResponse<T = any> {
  status: 'success' | 'error';
  operation: GmailOperation;
  emails?: EmailSummary[];
  email?: EmailDetail;
  emailId?: string;
  error?: string;
}
