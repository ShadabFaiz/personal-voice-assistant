import { Logger } from '@nestjs/common';
import { DuckDuckGoSearchResult } from './interface';

export function getMockDuckDuckGoSearchResults(
  query: string,
  logger?: Logger,
): DuckDuckGoSearchResult[] {
  if (logger) {
    logger.log(`Returning mock results for query: ${query}`);
  }
  return [
    {
      title: `DuckDuckGo Mock Result 1 for "${query}"`,
      link: 'https://duckduckgo.com/mock1',
      snippet: `This is a mock search result from DuckDuckGoWebSearchTool for: ${query}.`,
      date: new Date().toISOString(),
    },
    {
      title: `DuckDuckGo Mock Result 2 for "${query}"`,
      link: 'https://duckduckgo.com/mock2',
      snippet: `Another mock result for: ${query}, showing SerpApi integration structure.`,
    },
  ];
}
