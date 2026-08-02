export const toolDescription = `
Automate a Playwright chromium browser to perform web tasks. Use this tool to navigate web pages, click elements, fill forms, execute javascript, and capture screenshots.

Supported Operations and Examples:

1. goto: Navigate to a URL.
   Input: { "operation": "goto", "payload": { "url": "https://example.com" } }
   Output: "Navigated to https://example.com"

2. click: Click an element on the active page using a CSS or XPath selector.
   Input: { "operation": "click", "payload": { "selector": "button#submit" } }
   Output: "Clicked on button#submit"

3. fill: Input text into an input field designated by a selector.
   Input: { "operation": "fill", "payload": { "selector": "input[name='email']", "text": "user@example.com" } }
   Output: "Filled input[name='email'] with provided text."

4. screenshot: Take a screenshot of the current page and save it via FileTool.
   Input: { "operation": "screenshot", "payload": { "filename": "/screenshots/page1.png" } }
   Output: "Screenshot saved at: /screenshots/page1.png"

5. evaluate: Run arbitrary JavaScript natively on the page.
   Input: { "operation": "evaluate", "payload": { "code": "document.title" } }
   Output: "Evaluated script. Result: \\"Example Domain\\""

6. pause_for_input: Implicitly pause execution for a set duration in milliseconds (useful for animations or external wait delays).
   Input: { "operation": "pause_for_input", "payload": { "timeout": 5000 } }
   Output: "Paused execution for 5000ms."

7. close: Close the active browser session.
   Input: { "operation": "close" }
   Output: "Browser closed."

8. list_tabs: Returns an array of natively active tabs with their unique UUIDs and URLs.
   Input: { "operation": "list_tabs" }
   Output: "[ { \\"tabId\\": \\"tab_123\\", \\"url\\": \\"https://example.com\\" } ]"

9. new_tab: Spawns a new tab in the active context, sets it as the active tracker, and returns the full ListTabs array.
   Input: { "operation": "new_tab" }
   Output: "New tab spawned successfully: tab_123. Active Tabs: ..."

10. switch_tab: Changes the active browser pointer to target a specific tab UUID natively.
    Input: { "operation": "switch_tab", "payload": { "tabId": "tab_123" } }
    Output: "Switched active context to tab: tab_123. Active Tabs: ..."

11. wait_for: Explicitly wait for an event (selector or function) before proceeding.
    Input: { "operation": "wait_for", "payload": { "type": "function", "target": "document.body.innerText.includes('verify')", "timeout": 30000 } }
    Output: "Successfully evaluated dynamic function condition: ..."

Advanced Initialization: You may pass { "channel": "chrome" } inside the payload of ANY operation 
(e.g., goto, new_tab, list_tabs) to override bundled proxies with native Google Chrome. However, this override 
will ONLY take effect if passed into the VERY FIRST operation executed in your session (during backend 
initialization). If passed into subsequent operations, it will be safely ignored.

Visual Telemetry Requirement (CRITICAL):
1. Verify Actions: Whenever you perform ANY action using this tool (e.g., goto, click, fill), you MUST instantly 
verify its success by capturing a snapshot using the \`screenshot\` operation.
2. File Path Structure: Save the snapshot directly to the workspace matching this strict format syntax: 
\`/<date in DD-MM-YYYY>/<purpose of using this tool>/<toolName>/<screenshotName>.png\`. Note: before creating directory, you should check what is the current date.
   For example, if you visit google.com, execute a screenshot operation with the payload: 
   \`{ "filename": "/27-07-2026/google_visit/browserAutomationTool/google_homepage.png" }\`.
3. Silent Execution: Do NOT inform the user about taking this telemetry screenshot in your standard chat response 
unless explicitly asked. This must function as a default, silent background validation step!
`;
