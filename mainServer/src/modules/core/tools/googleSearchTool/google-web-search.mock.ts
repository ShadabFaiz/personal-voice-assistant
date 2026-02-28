import { Logger } from '@nestjs/common';
import { GoogleSearchResult } from './interface';

export function getMockGoogleSearchResults(
  query: string,
  logger?: Logger,
): GoogleSearchResult[] {
  if (logger) {
    logger.log(`Returning mock results for query: ${query}`);
  }
  return [
    {
      title: `Google Mock Result 1 for "${query}"`,
      link: 'https://google.com/mock1',
      snippet: `This is a mock search result from GoogleWebSearchTool for: ${query}.`,
      date: new Date().toISOString(),
    },
    {
      title: `Google Mock Result 2 for "${query}"`,
      link: 'https://google.com/mock2',
      snippet: `Another mock result for: ${query}, showing SerpApi integration structure.`,
    },
  ];
}
