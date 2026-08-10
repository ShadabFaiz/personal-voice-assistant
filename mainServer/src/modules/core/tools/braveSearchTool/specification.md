# Brave Search Tool

**Tool Names:**
- `brave_web_search`
- `brave_news_search`

**Description:**
Provides web and news search capabilities using the Brave Search API. Helps finding up-to-date information across the internet and recent news articles.

**Environment Variables:**
- `BRAVE_SEARCH_API_KEY`: The API key for Brave Search API.
- `BRAVE_SEARCH_API_URL`: (Optional) The API URL for Brave Search.

**Parameters:**
- `query` (string, required): The search query.
- `count` (number, optional): Number of results to return.
- `offset` (number, optional): Starting offset for pagination.
- `freshness` (enum, optional): Results freshness (`on`, `pd`, `pw`, `pm`, `py`, `pn`).
- `country` (string, optional): Country code for localized results.
- `units` (string, optional): Unit of distance for location-based queries.

---

## Examples

### 1. Web Search
**Example**
```ts
Input:
{
  query: "latest breakthrough in AI",
  count: 5,
  freshness: "pd"
}

Output:
Search results for "latest breakthrough in AI":

Result 1:
Title: OpenAI releases new model
URL: https://example.com/news/1
Snippet: A new breakthrough in AI...
Published: 2026-08-10
```

### 2. News Search
**Example**
```ts
Input:
{
  query: "global market trends",
  country: "us"
}

Output:
Search results for "global market trends":

Result 1:
Title: Market hits all-time high
URL: https://example.news/market
Snippet: Today the market trended...
Published: 2026-08-10
```
