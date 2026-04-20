import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import {
  DEFAULT_API_URL,
  DEFAULT_COUNTRY,
  DEFAULT_FRESHNESS,
  DEFAULT_SEARCH_COUNT,
  DEFAULT_SEARCH_OFFSET,
  DEFAULT_UNITS,
  MOCK_API_KEY,
} from './constants';
import {
  BraveSearchOptions,
  BraveSearchResult,
  BraveWebResponse,
} from './interface';
import { AppConfig } from '@core/config';
import { getMockBraveSearchResults } from './brave-search.mock';

@Injectable()
export class BraveSearchTool {
  private readonly logger = new Logger(BraveSearchTool.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.apiKey =
      this.configService.get<string>('BRAVE_SEARCH_API_KEY') || MOCK_API_KEY;
    this.apiUrl =
      this.configService.get<string>('BRAVE_SEARCH_API_URL') || DEFAULT_API_URL;
  }

  private async performSearch(
    options: BraveSearchOptions,
  ): Promise<BraveSearchResult[]> {
    const {
      query,
      count = DEFAULT_SEARCH_COUNT,
      offset = DEFAULT_SEARCH_OFFSET,
      searchType = 'web',
      freshness = DEFAULT_FRESHNESS,
      country = DEFAULT_COUNTRY,
      units = DEFAULT_UNITS,
    } = options;

    this.logger.log(
      `Performing search with query: ${query}, type: ${searchType}, freshness: ${freshness}, country: ${country}`,
    );

    try {
      if (this.apiKey === MOCK_API_KEY) {
        this.logger.warn('Using mock data for Brave Search');
        return getMockBraveSearchResults(query, this.logger);
      }

      const params: Record<string, string> = {
        q: query,
        count: count.toString(),
        offset: offset.toString(),
      };

      if (freshness) {
        params.freshness = freshness;
      }

      if (country) {
        params.country = country;
      }

      if (units) {
        params.units = units;
      }

      const headers = {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': this.apiKey,
      };

      const response = await axios.get<BraveWebResponse>(this.apiUrl, {
        params,
        headers,
      });

      return response.data.web?.results || [];
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Error performing search: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Error performing search: ${error}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      return getMockBraveSearchResults(query, this.logger);
    }
  }

  private formatSearchResults(
    results: BraveSearchResult[],
    query: string,
  ): string {
    if (results.length === 0) {
      return `No results found for query: "${query}"`;
    }

    const formattedResults = results.map((result, index) => {
      return `
Result ${index + 1}:
Title: ${result.title}
URL: ${result.url}
Snippet: ${result.snippet}
${result.publishedDate ? `Published: ${result.publishedDate}` : ''}
`;
    });

    return `Search results for "${query}":\n${formattedResults.join('\n')}`;
  }

  private getWebSearchTool() {
    return tool(
      async (input: {
        query: string;
        count?: number;
        offset?: number;
        freshness?: 'on' | 'pd' | 'pw' | 'pm' | 'py' | 'pn';
        country?: string;
        units?: string;
      }) => {
        const results = await this.performSearch({
          query: input.query,
          count: input.count,
          offset: input.offset,
          searchType: 'web',
          freshness: input.freshness,
          country: input.country,
          units: input.units,
        });
        return this.formatSearchResults(results, input.query);
      },
      {
        name: 'brave_web_search',
        description:
          'Search the web for textual information using Brave Search API. The api has rate limit of 50 req/sec and 2000 req/month. Supported freshness values: on (now), pd (past day), pw (past week), pm (past month), py (past year), pn (no limit)',
        responseFormat: 'content',
        schema: z.object({
          query: z
            .string()
            .describe('The search query to find information on the web'),
          count: z
            .number()
            .optional()
            .default(DEFAULT_SEARCH_COUNT)
            .describe(
              `Number of results to return (default: ${DEFAULT_SEARCH_COUNT})`,
            ),
          offset: z
            .number()
            .optional()
            .default(DEFAULT_SEARCH_OFFSET)
            .describe(
              `Starting offset for pagination (default: ${DEFAULT_SEARCH_OFFSET})`,
            ),
          freshness: z
            .enum(['on', 'pd', 'pw', 'pm', 'py', 'pn'])
            .optional()
            .describe(
              'Freshness of results: on (now), pd (past day), pw (past week), pm (past month), py (past year), pn (no limit)',
            ),
          country: z
            .string()
            .optional()
            .describe(
              'Country code for localized results (e.g., us, uk, fr, de)',
            ),
          units: z
            .string()
            .optional()
            .describe(
              'Unit of distance for location-based queries (e.g., mi for miles, km for kilometers)',
            ),
        }),
      },
    );
  }

  private getNewsSearchTool() {
    return tool(
      async (input: {
        query: string;
        count?: number;
        offset?: number;
        freshness?: 'on' | 'pd' | 'pw' | 'pm' | 'py' | 'pn';
        country?: string;
        units?: string;
      }) => {
        const results = await this.performSearch({
          query: input.query,
          count: input.count,
          offset: input.offset,
          searchType: 'news',
          freshness: input.freshness,
          country: input.country,
          units: input.units,
        });
        return this.formatSearchResults(results, input.query);
      },
      {
        name: 'brave_news_search',
        description:
          'Search news articles using Brave Search API. Supported freshness values: on (now), pd (past day), pw (past week), pm (past month), py (past year), pn (no limit)',
        responseFormat: 'content',
        schema: z.object({
          query: z.string().describe('The search query to find news articles'),
          count: z
            .number()
            .optional()
            .default(DEFAULT_SEARCH_COUNT)
            .describe(
              `Number of results to return (default: ${DEFAULT_SEARCH_COUNT})`,
            ),
          offset: z
            .number()
            .optional()
            .default(DEFAULT_SEARCH_OFFSET)
            .describe(
              `Starting offset for pagination (default: ${DEFAULT_SEARCH_OFFSET})`,
            ),
          freshness: z
            .enum(['on', 'pd', 'pw', 'pm', 'py', 'pn'])
            .optional()
            .describe(
              'Freshness of results: on (now), pd (past day), pw (past week), pm (past month), py (past year), pn (no limit)',
            ),
          country: z
            .string()
            .optional()
            .describe(
              'Country code for localized results (e.g., us, uk, fr, de)',
            ),
          units: z
            .string()
            .optional()
            .describe(
              'Unit of distance for location-based queries (e.g., mi for miles, km for kilometers)',
            ),
        }),
      },
    );
  }

  getAllTools() {
    const webSearchTool = this.getWebSearchTool();
    const newsSearchTool = this.getNewsSearchTool();
    return [webSearchTool, newsSearchTool] as const;
  }
}
