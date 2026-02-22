# BraveWebSearch Tool

A NestJS tool that integrates with the Brave Search API to perform web and news searches.

## Features

- **Web Search**: Search for textual information on the web
- **News Search**: Search for news articles
- **Mock Mode**: Returns mock data when API key is not configured
- **Error Handling**: Gracefully falls back to mock data on API errors
- **Extensible Design**: Can be extended to support images and videos in the future

## Configuration

Add the following environment variables to your `.env` file:

```env
BRAVE_SEARCH_API_KEY=your-api-key-here
BRAVE_SEARCH_API_URL=https://api.search.brave.com/res/v1/web/search
```

If `BRAVE_SEARCH_API_KEY` is set to `mock-api-key` or left empty, the tool will return mock data.

## Usage

### Web Search

```typescript
const result = await braveWebSearchTool.invoke({
  query: 'search query',
  count: 10, // optional, default: 10
  offset: 0, // optional, default: 0
  freshness: 'pw', // optional: on, pd, pw, pm, py, pn
  country: 'us', // optional: country code (e.g., us, uk, fr, de)
  units: 'mi', // optional: distance unit (e.g., mi, km)
});
```

### News Search

```typescript
const result = await braveWebSearchTool.invoke({
  query: 'news query',
  count: 10, // optional, default: 10
  offset: 0, // optional, default: 0
  freshness: 'pd', // optional: on, pd, pw, pm, py, pn
  country: 'us', // optional: country code (e.g., us, uk, fr, de)
  units: 'mi', // optional: distance unit (e.g., mi, km)
});
```

### Parameter Details

- **freshness**: Filter results by time period
  - `on`: Now
  - `pd`: Past day
  - `pw`: Past week
  - `pm`: Past month
  - `py`: Past year
  - `pn`: No limit

- **country**: Country code for localized results
  - Examples: `us`, `uk`, `fr`, `de`, `in`, `jp`

- **units**: Unit of distance for location-based queries
  - `mi`: Miles
  - `km`: Kilometers

## Response Format

The tool returns formatted search results including:

- Title
- URL
- Snippet/Description
- Published Date (when available)

## Available Tools

1. **brave_web_search**: Search the web for textual information
2. **brave_news_search**: Search for news articles

## Extensibility

The tool is designed to be easily extended for future functionality:

- Add new search types (images, videos) by extending the `searchType` in `BraveSearchOptions`
- Implement new tool methods following the existing pattern
- Update the `getAllTools()` method to include new tools

## Error Handling

- If the API key is not configured, the tool returns mock data
- On API errors, the tool gracefully falls back to mock data
- All errors are logged for debugging purposes
