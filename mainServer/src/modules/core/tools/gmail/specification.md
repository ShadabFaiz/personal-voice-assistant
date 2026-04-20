# EMAIL TOOLS SPECIFICATION

---

## 1. PURPOSE

This document defines the specification for a unified email tool.

The tool exposes a **single entry point** and supports multiple operations via an `operation` field.

---

## 2. TOOL INTERFACE

```ts
execute(params: EmailToolParams)
```

---

## 3. OPERATIONS

---

### 3.1 Get Unread Emails

**Operation**

```
getUnreadEmails
```

**Params**

```ts
{
  operation: "getUnreadEmails",
  maxResults?: number // default = 10, max = 50
}
```

**Behavior**

- Fetch unread emails using query: `is:unread`
- Return latest unread emails
- Default `maxResults = 10` if not provided

**Response**

```ts
[
  null,
  {
    status: 'success',
    operation: 'getUnreadEmails',
    emails: [
      {
        id: string,
        subject: string,
        from: { name: string, email: string },
        date: string,
        snippet: string,
      },
    ],
  },
];
```

**Example**

```ts
Input:
{
  operation: "getUnreadEmails",
  maxResults: 5
}

Output:
[null, {
  status: "success",
  operation: "getUnreadEmails",
  emails: [
    {
      id: "18c1...",
      subject: "Meeting Reminder",
      from: { name: "John Doe", email: "john@gmail.com" },
      date: "2026-04-14T10:30:00Z",
      snippet: "Reminder for tomorrow's meeting..."
    }
  ]
}]
```

---

### 3.2 Get Latest Emails

**Operation**

```
getLatestEmails
```

**Params**

```ts
{
  operation: "getLatestEmails",
  maxResults: number // required, max = 50
}
```

**Behavior**

- Fetch latest emails sorted by newest first

**Response**

```ts
[null, {
  status: "success",
  operation: "getLatestEmails",
  emails: EmailSummary[]
}]
```

**Example**

```ts
Input:
{
  operation: "getLatestEmails",
  maxResults: 3
}

Output:
[null, {
  status: "success",
  operation: "getLatestEmails",
  emails: [
    {
      id: "18c1...",
      subject: "Weekly Report",
      from: { name: "Jane Smith", email: "jane@company.com" },
      date: "2026-04-15T09:00:00Z",
      snippet: "Here is the weekly report..."
    }
  ]
}]
```

---

### 3.3 Search Emails

**Operation**

```
searchEmails
```

**Params**

```ts
{
  operation: "searchEmails",
  query: string,        // required
  maxResults?: number   // default = 10, max = 50
}
```

**Behavior**

- Uses Gmail search syntax
- Example queries:
  - `from:boss@gmail.com`
  - `subject:invoice`
  - `is:unread`

**Response**

```ts
[null, {
  status: "success",
  operation: "searchEmails",
  emails: EmailSummary[]
}]
```

**Example**

```ts
Input:
{
  operation: "searchEmails",
  query: "from:boss@gmail.com subject:meeting"
}

Output:
[null, {
  status: "success",
  operation: "searchEmails",
  emails: [
    {
      id: "18c2...",
      subject: "Meeting Update",
      from: { name: "Boss", email: "boss@gmail.com" },
      date: "2026-04-15T11:00:00Z",
      snippet: "Let's move the meeting to 2 PM..."
    }
  ]
}]
```

---

### 3.4 Read Email

**Operation**

```
readEmail
```

**Params**

```ts
{
  operation: "readEmail",
  emailId: string
}
```

**Behavior**

- Fetch full email via `messages.get`
- Extract:
  - subject
  - sender
  - date
  - clean body text

**Response**

```ts
[
  null,
  {
    status: 'success',
    operation: 'readEmail',
    email: {
      id: string,
      subject: string,
      from: { name: string, email: string },
      date: string,
      body: string,
    },
  },
];
```

**Example**

```ts
Input:
{
  operation: "readEmail",
  emailId: "18c1..."
}

Output:
[null, {
  status: "success",
  operation: "readEmail",
  email: {
    id: "18c1...",
    subject: "Meeting Reminder",
    from: { name: "John Doe", email: "john@gmail.com" },
    date: "2026-04-14T10:30:00Z",
    body: "Hi, just a reminder for tomorrow's meeting at 10 AM..."
  }
}]
```

---

### 3.5 Send Email

**Operation**

```
sendEmail
```

**Params**

```ts
{
  operation: "sendEmail",
  to: string,           // required
  subject: string,      // required
  body: string          // required
}
```

**Behavior**

- Sends a new email using `messages.send`
- Parameters must be validated

**Response**

```ts
[null, {
  status: "success",
  operation: "sendEmail",
  emailId: string
}]
 
 **Example**
 
 ```ts
 Input:
 {
   operation: "sendEmail",
   to: "recipient@example.com",
   subject: "Hello",
   body: "World"
 }
 
 Output:
 [null, {
   status: "success",
   operation: "sendEmail",
   emailId: "new-msg-id"
 }]
 ```
```

---

### 3.6 Reply To Email

**Operation**

```
replyToEmail
```

**Params**

```ts
{
  operation: "replyToEmail",
  emailId: string,      // required (the email being replied to)
  body: string          // required
}
```

**Behavior**

- Sends a reply to an existing email thread
- Sets appropriate headers (`In-Reply-To`, `References`)

**Response**

```ts
[null, {
  status: "success",
  operation: "replyToEmail",
  emailId: string
}]
 
 **Example**
 
 ```ts
 Input:
 {
   operation: "replyToEmail",
   emailId: "18c1...",
   body: "Thanks for the reminder!"
 }
 
 Output:
 [null, {
   status: "success",
   operation: "replyToEmail",
   emailId: "reply-msg-id"
 }]
 ```
```

---

### 3.7 Create Draft Email

**Operation**

```
createDraftEmail
```

**Params**

```ts
{
  operation: "createDraftEmail",
  to?: string,
  subject?: string,
  body?: string
}
```

**Behavior**

- Creates a new draft using `drafts.create`
- All fields are optional per Gmail API flexibility

**Response**

```ts
[null, {
  status: "success",
  operation: "createDraftEmail",
  emailId: string
}]
 
 **Example**
 
 ```ts
 Input:
 {
   operation: "createDraftEmail",
   to: "recipient@example.com",
   subject: "Draft Subject",
   body: "Draft Body"
 }
 
 Output:
 [null, {
   status: "success",
   operation: "createDraftEmail",
   emailId: "draft-id"
 }]
 ```
```

---

### 3.8 Delete Email

**Operation**

```
deleteEmail
```

**Params**

```ts
{
  operation: "deleteEmail",
  emailId: string       // required
}
```

**Behavior**

- Moves email to trash or permanently deletes it (configured)

**Response**

```ts
[null, {
  status: "success",
  operation: "deleteEmail"
}]
```

**Example**

```ts
Input:
{
  operation: "deleteEmail",
  emailId: "18c1..."
}

Output:
[null, {
  status: "success",
  operation: "deleteEmail"
}]
```

---

### 3.9 Mark As Read

**Operation**

```
markAsRead
```

**Params**

```ts
{
  operation: "markAsRead",
  emailId: string       // required
}
```

**Behavior**

- Removes the `UNREAD` label from the specified message
- Uses `messages.modify` with `removeLabelIds: ['UNREAD']`

**Response**

```ts
[null, {
  status: "success",
  operation: "markAsRead"
}]
```

**Example**

```ts
Input:
{
  operation: "markAsRead",
  emailId: "18c1..."
}

Output:
[null, {
  status: "success",
  operation: "markAsRead"
}]
```

---

## 4. COMMON TYPES

```ts
type EmailSummary = {
  id: string;
  subject: string;
  from: { name: string; email: string };
  date: string;
  snippet: string;
};
```

---

## 5. ERROR RESPONSE

```ts
[
  {
    status: 'error',
    operation: string,
    error: string,
  },
  null,
];
```

---

## 6. VALIDATION RULES

- `operation` is required
- `maxResults` must be ≤ 50
- `query` required for `searchEmails`
- `emailId` required for `readEmail`, `replyToEmail`, or `markAsRead`
- `to`, `subject`, `body` optional for `createDraftEmail`

---

## 7. INTERNAL FLOW

```
messages.list → ids → messages.get → parse → clean → return
```

---

## 8. NOTES

- Always return structured JSON
- Never return raw HTML
- Truncate large email bodies if needed

---
