import { Logger } from '@nestjs/common';
import { BraveSearchResult } from './interface';

export function getMockBraveSearchResults(
  query: string,
  logger?: Logger,
): BraveSearchResult[] {
  if (logger) {
    logger.log(`Returning mock results for query: ${query}`);
  }
  return [
    {
      title: `Mock Result 1 for "${query}"`,
      url: 'https://example.com/mock1',
      snippet: `This is a mock search result for the query: ${query}. Replace with actual API integration.`,
      publishedDate: new Date().toISOString(),
    },
    {
      title: `Mock Result 2 for "${query}"`,
      url: 'https://example.com/mock2',
      snippet: `Another mock result demonstrating the tool structure for: ${query}`,
    },
    {
      title: `Mock Result 3 for "${query}"`,
      url: 'https://example.com/mock3',
      snippet: `Third mock result showing how the tool can be extended with real API calls`,
    },
  ];
}
