# TEMP MAIL TOOL SPECIFICATION

---

## 1. PURPOSE

This document defines the specification for a temporary email tool.

The tool exposes a **single entry point** and supports multiple operations via an `operation` field.

It provides disposable email addresses for signing up on services without exposing a real email address.

---

## 2. TOOL INTERFACE

```ts
execute(params: TempMailToolParams)
```

---

## 3. OPERATIONS

---

### 3.1 Create Random Temp Email Account

**Operation**

```
createRandomTempEmailAccount
```

**Params**

```ts
{
  operation: 'createRandomTempEmailAccount';
}
```

**Behavior**

- Creates a new random temporary email account using the MailJS API
- Returns the generated username and password
- No input parameters required

**Response**

```ts
{
  status: boolean,
  operation: "createRandomTempEmailAccount",
  data?: {
    username: string,
    password: string
  },
  message?: string
}
```

**Example**

```ts
Input:
{
  operation: "createRandomTempEmailAccount"
}

Output:
{
  status: true,
  operation: "createRandomTempEmailAccount",
  data: {
    username: "abc123",
    password: "xyz789"
  },
  message: "ok"
}
```

---

### 3.2 Login With ID And Password

**Operation**

```
loginWithIdAndPassword
```

**Params**

```ts
{
  operation: "loginWithIdAndPassword",
  emailId: string,    // required
  password: string    // required
}
```

**Behavior**

- Logs into an existing temporary email account using credentials
- Returns an authentication token and account ID
- Both `emailId` and `password` are required

**Response**

```ts
{
  status: boolean,
  operation: "loginWithIdAndPassword",
  data: {
    token: string,
    id: string
  }
}
```

**Example**

```ts
Input:
{
  operation: "loginWithIdAndPassword",
  emailId: "abc123@example.com",
  password: "xyz789"
}

Output:
{
  status: true,
  operation: "loginWithIdAndPassword",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    id: "64a1b2c3d4e5f6g7h8i9j0"
  }
}
```

---

### 3.3 Read Email

**Operation**

```
readEmail
```

**Params**

```ts
{
  operation: "readEmail",
  emailId: string    // required
}
```

**Behavior**

- Fetches a specific email message by its ID
- Returns the full email content including sender, subject, body, attachments, and metadata

**Response**

```ts
{
  status: boolean,
  operation: "readEmail",
  data?: {
    id: string,
    accountId: string,
    msgid: string,
    from: {
      address: string,
      name: string
    },
    to: Array<{
      address: string,
      name: string
    }>,
    subject: string,
    intro: string,
    text: string,
    seen: boolean,
    hasAttachments: boolean,
    attachments: Array<{
      id: string,
      filename: string,
      contentType: string,
      downloadUrl: string
    }>,
    size: number,
    createdAt: string,
    updatedAt: string
  },
  message?: string
}
```

**Example**

```ts
Input:
{
  operation: "readEmail",
  emailId: "64a1b2c3d4e5f6g7h8i9j0"
}

Output:
{
  status: true,
  operation: "readEmail",
  data: {
    id: "64a1b2c3d4e5f6g7h8i9j0",
    accountId: "acc123",
    msgid: "<msg456@example.com>",
    from: {
      address: "noreply@reddit.com",
      name: "Reddit"
    },
    to: [
      {
        address: "abc123@example.com",
        name: ""
      }
    ],
    subject: "Verify your email",
    intro: "Click the link to verify...",
    text: "Click the link below to verify your email address...",
    seen: false,
    hasAttachments: false,
    attachments: [],
    size: 2048,
    createdAt: "2026-04-15T10:30:00Z",
    updatedAt: "2026-04-15T10:30:00Z"
  }
}
```

---

### 3.4 Create Temp Email

**Operation**

```
createTempEmail
```

**Params**

```ts
{
  operation: "createTempEmail",
  emailId?: string,
  password?: string
}
```

**Behavior**

- Creates a temporary email with an optional custom email ID and password
- Currently returns a placeholder response (not yet implemented)

**Response**

```ts
{
  status: boolean,
  operation: "createTempEmail",
  data?: string
}
```

**Example**

```ts
Input:
{
  operation: "createTempEmail",
  emailId: "custom@example.com",
  password: "mypassword"
}

Output:
{
  status: true,
  operation: "createTempEmail",
  data: "TempMail createTempEmail is not yet implemented. This is a dummy response."
}
```

> **Note**: This operation is a placeholder and not yet fully implemented.

---

### 3.5 Get Inbox

**Operation**

```
getInbox
```

**Params**

```ts
{
  operation: "getInbox",
  emailId?: string,
  password?: string
}
```

**Behavior**

- Fetches the inbox of the logged-in temporary email account
- Currently defined but not yet implemented in the tool's execute method

**Response**

```ts
{
  status: boolean,
  operation: "getInbox",
  data?: string
}
```

> **Note**: This operation is defined in the types but not yet wired up in the main execute switch.

---

## 4. COMMON TYPES

```ts
type TempMailToolParams = {
  operation: TempMailOperation;
  emailId?: string;
  password?: string;
};

enum TempMailOperation {
  CREATE_TEMP_EMAIL = 'createTempEmail',
  CREATE_RANDOM_TEMP_EMAIL_ACCOUNT = 'createRandomTempEmailAccount',
  GET_INBOX = 'getInbox',
  READ_EMAIL = 'readEmail',
  LOGIN_WITH_ID_AND_PASSWORD = 'loginWithIdAndPassword',
}
```

---

## 5. ERROR RESPONSE

```ts
{
  status: false,
  operation: TempMailOperation,
  error: string
}
```

---

## 6. VALIDATION RULES

- `operation` is required
- `emailId` is required for `readEmail` and `loginWithIdAndPassword` operations
- `password` is required for `loginWithIdAndPassword` operation
- `createRandomTempEmailAccount` requires no additional parameters
- `createTempEmail` accepts optional `emailId` and `password`

---

## 7. INTERNAL FLOW

```
mailJs.createOneAccount() → username + password → return
mailJs.login(emailId, password) → token + id → return
mailJs.getMessage(emailId) → parse email → return
```

---

## 8. NOTES

- Always return structured JSON
- Uses the `@cemalgnlts/mailjs` library as the underlying temporary email provider
- The `getInbox` operation is defined in types but not yet implemented
- The `createTempEmail` operation returns a placeholder response
- Never expose raw API errors to the end user
