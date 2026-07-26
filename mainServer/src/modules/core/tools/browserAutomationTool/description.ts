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
`;
