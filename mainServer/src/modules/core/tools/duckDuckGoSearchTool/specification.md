# DuckDuckGo Search Tool

**Tool Name:**
- `duck_duck_go_web_search`

**Description:**
Searches the web using DuckDuckGo via the SerpApi DuckDuckGo engine. Useful for retrieving global or localized search results and up-to-date information.

**Environment Variables:**
- `SERPAPI_API_KEY`: The API key for SerpApi.

**Parameters:**
- `query` (string, required): The search query.
- `count` (number, optional): Number of results to return.
- `offset` (number, optional): Starting offset for pagination.
- `timePeriod` (enum, optional): Time period for results (`d`, `w`, `m`, `y`).
- `region` (string, optional): Region code for localized results (e.g., `wt-wt`, `us-en`).

---

## Examples

### 1. Web Search
**Example**
```ts
Input:
{
  query: "best hiking trails",
  count: 3,
  timePeriod: "m"
}

Output:
Search results for "best hiking trails":

Result 1:
Title: Top 10 Trails
URL: https://example.com/trails
Snippet: Here are the best trails...
Date: 12 July 2026
```
