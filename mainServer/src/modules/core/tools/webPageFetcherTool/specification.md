# Web Page Fetcher Tool

**Tool Name:**
- `webpage_fetcher`

**Description:**
Fetches and retrieves the content of a webpage from a given URL. It extracts raw HTML and optionally cleans it (using Cheerio) to return readable text, making it highly useful for summarizing or extracting text from a website.

**Environment Variables:**
- None.

**Parameters:**
- `url` (string, required): The URL of the webpage to fetch.
- `headers` (object, optional): Custom HTTP headers to include with the request.
- `sanitize_response` (boolean, optional): Whether to clean the webpage response, removing scripts, styling, and navigation to return pure text content (default: `true`).

---

## Examples

### 1. Fetching a Webpage
**Example**
```ts
Input:
{
  url: "https://example.com/article",
  sanitize_response: true
}

Output:
{
  url: "https://example.com/article",
  status: 200,
  content: "This is a clean version of the article content, free from HTML formatting."
}
```
