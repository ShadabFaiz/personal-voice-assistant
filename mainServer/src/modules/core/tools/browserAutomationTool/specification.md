# Browser Automation Tool

**Tool Name:**
- `browser_automation`

**Description:**
Automates a Playwright chromium browser to perform web tasks natively. Use this tool to navigate web pages, click elements, fill forms, execute scripts, and capture screenshots.

**Supported Operations:**
1. `goto`: Navigate to a URL.
2. `click`: Click an element via CSS/XPath.
3. `fill`: Input text into fields.
4. `screenshot`: Telemetry requirement to capture and save page screenshots locally.
5. `evaluate`: Run JS scripts on the active page.
6. `pause_for_input`: Pause execution for set duration.
7. `close`: Close session.
8. `list_tabs`: Retrieve active tabs UUIDs and URLs.
9. `new_tab`: Spawns and shifts focus to a new tab.
10. `switch_tab`: Changes active focus.
11. `wait_for`: Extends internal waits for dynamic conditions.

**Parameters:**
- `operation` (string, required): The operation to perform (e.g. goto, click).
- `payload` (object, optional): Data specific to the operation (e.g., URL for goto).

---

## Examples

### 1. Navigating to a URL (goto)
**Example**
```ts
Input:
{
  operation: "goto",
  payload: { url: "https://example.com" }
}

Output:
"Navigated to https://example.com"
```

### 2. Clicking an Element (click)
**Example**
```ts
Input:
{
  operation: "click",
  payload: { selector: "button#submit" }
}

Output:
"Clicked on button#submit"
```

### 3. Filling an Input Field (fill)
**Example**
```ts
Input:
{
  operation: "fill",
  payload: { selector: "input[name='email']", text: "user@example.com" }
}

Output:
"Filled input[name='email'] with provided text."
```
