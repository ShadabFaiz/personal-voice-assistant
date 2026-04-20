export const toolDescription = `
GMAIL TOOL

This tool provides access to Gmail for reading, searching, and sending emails.
It supports multiple operations via an "operation" field.

----------------------------------------
SUPPORTED OPERATIONS
----------------------------------------

getUnreadEmails:
- Fetches latest unread emails
- Params: { maxResults?: number }
- maxResults default: 10, max: 50

getLatestEmails:
- Fetches latest emails (read or unread)
- Params: { maxResults: number }
- maxResults max: 50

searchEmails:
- Searches emails using Gmail search syntax
- Params: { query: string, maxResults?: number }
- query: e.g., "from:boss@gmail.com", "subject:invoice", "is:unread"

readEmail:
- Fetches the full content of a specific email
- Params: { emailId: string }

sendEmail:
- Sends a new email
- Params: { to: string, subject: string, body: string }

replyToEmail:
- Replies to an existing email thread
- Params: { emailId: string, body: string }

deleteEmail:
- Moves an email to trash
- Params: { emailId: string }

----------------------------------------
GENERAL RULES
----------------------------------------

- Always provide the correct "operation" field.
- For reading/replying/deleting, use the "emailId" returned by search or list operations.
- Responses are always in the format [error, success].
`;
