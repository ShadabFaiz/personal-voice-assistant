# Reddit Account Creation via LLM

This document outlines the steps required for an AI assistant to automate the creation of a Reddit account using the `BrowserAutomationTool`.

## Prerequisites

- For creating reddit account, we need to have an email address. An OPT will be received on this email.
- Before proceeding forward, check if we have a temporary email without reddit account or not. IF we dont have any, then create temporray account. Store its details in a file: temp_email_details.json in array format.
- For password, you can select on your own. no need for human intervention here.
- For username, you can decide on your own.
- Reddit enforces CAPTCHA solving. If a CAPTCHA is encountered, fall back to manual user intervention.

## Supported Operations

The `BrowserAutomationTool` exposes the following operations via the mandatory `operation` field:

- **`goto`**: Navigate to a URL (requires `payload.url`).
- **`click`**: Click an element (requires `payload.selector`).
- **`fill`**: Fill an input field (requires `payload.selector` and `payload.text`).
- **`screenshot`**: Take a screenshot and save it (optional `payload.filename`).
- **`evaluate`**: Execute custom JavaScript on the page (requires `payload.code`).
- **`close`**: Close the active browser session.
- **`pause_for_input`**: Wait for a specified number of milliseconds (optional `payload.timeout`).

## Step-by-Step Procedure

1. **Verify Config Details:** Make sure you possess a target `email`, `username`, and `password`. Use the user's preferred email if provided.

2. **Navigate to Reddit Registration:**
   - Tool: `browser_automation`
   - Parameters: `{"operation": "goto", "payload": {"url": "https://www.reddit.com/register/"}}`
   - Reason: Initiates the Reddit signup flow.

3. **Provide Email:**
   - Reddit uses dynamic selectors which can be problematic. Focus on semantic descriptors or fallback to name attributes.
   - Tool: `browser_automation`
   - Parameters: `{"operation": "fill", "payload": {"selector": "input[name='email'], input[type='email'], #regEmail", "text": "<YOUR_EMAIL>"}}`
   - Reason: Inputs the email address in the first stage of the multi-step form.

4. **Submit Email Step:**
   - Tool: `browser_automation`
   - Parameters: `{"operation": "evaluate", "payload": {"code": "document.querySelector('button[type=\"submit\"]').click()"}}` or use the `click` operation if you have a reliable selector.

5. **OTP Verification:**
   - Wait a few seconds for the page transition animation.
   - Reddit will ask to "Verify your email". Obtain the 6-digit OTP from the inbox.
   - Tool: `browser_automation`
   - Parameters: `{"operation": "fill", "payload": {"selector": "input[name*='code'], input[name*='otp'], input[inputmode='numeric']", "text": "<OTP_CODE>"}}`
   - Tool: `browser_automation`
   - Parameters: `{"operation": "click", "payload": {"selector": "button[type='submit']"}}` (to submit the OTP).

6. **Input Username and Password:**
   - Make sure to wait indicating the form shifted pages again.
   - Provide the chosen credentials. Reddit keeps the username field hidden until this point; ensure you interact only when it's visible.
   - Tool: `browser_automation` (for username fill)
   - Tool: `browser_automation` (for password fill)
   - Tool: `browser_automation` (for CAPTCHA injection if automated natively or manually).

7. **Finalize Submission & Validate Success:**
   - Click the final submit/Signup button.
   - Tool: `browser_automation`
   - Parameters: `{"operation": "screenshot", "payload": {"filename": "final_reddit_screen.png"}}`
   - Examine the returned screenshot path or URL state. If the result shows an onboarding screen ("About you" / "Tell us about yourself"), the account was created successfully. A URL containing `/register` may persist temporarily even after success!
   - **Important**: If the screenshot shows a red error stating "Username unavailable. Try something else.", do not fail instantly. Fallback to Step 6, generate a brand new unique random username, re-fill the username and password fields, and submit again!

If you encounter an unrecoverable issue during the process, save the screenshot and inform the user about it.

After successfully create the account, store it details in same json file alongside the email address with which it is created:

```
[
  {
    "email_address": "0f37cf69-7d8e-4dd9-b448-00d9b94ee955@wshu.net",
    "password": "c6474d93828b0db6",
    "created_date": "07-06-2026",
    "redditAccount": {
      "username": "",
      "password": "",
      "isActive": "",
      "isBanned": "",
      "isPermanentBan": "yes | no ",
      "bannedOn": "",
      "bannedUntill": " in case of temporary ban "
    }
  },
  {
    "email_address": "ae1ca30e-010d-4c71-934d-7a92fafbb415@wshu.net",
    "password": "0fd628efd44bf972",
    "created_date": "07-06-2026"
  }
]

```
