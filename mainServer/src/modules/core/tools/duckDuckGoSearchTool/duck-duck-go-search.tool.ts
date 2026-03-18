import { AppConfig } from '@core/config';
import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import {
  DEFAULT_API_URL,
  DEFAULT_ENGINE,
  DEFAULT_REGION,
  DEFAULT_SEARCH_COUNT,
  DEFAULT_SEARCH_OFFSET,
  MOCK_API_KEY,
} from './constants';
import { getMockDuckDuckGoSearchResults } from './duck-duck-go-search.mock';
import {
  DuckDuckGoSearchOptions,
  DuckDuckGoSearchResult,
  SerpApiDDGResponse,
} from './interface';

@Injectable()
export class DuckDuckGoWebSearchTool {
  private readonly logger = new Logger(DuckDuckGoWebSearchTool.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.apiKey = this.configService.get('SERPAPI_API_KEY') || MOCK_API_KEY;
    this.apiUrl = DEFAULT_API_URL;
    if (this.apiKey !== MOCK_API_KEY) {
      this.logger.debug(
        `DuckDuckGoWebSearchTool initialized with API key: ${this.apiKey.substring(0, 4)}...`,
      );
    } else {
      this.logger.warn('DuckDuckGoWebSearchTool initialized with MOCK API key');
    }
  }

  private async performSearch(
    options: DuckDuckGoSearchOptions,
  ): Promise<DuckDuckGoSearchResult[]> {
    const {
      query,
      count = DEFAULT_SEARCH_COUNT,
      offset = DEFAULT_SEARCH_OFFSET,
      region = DEFAULT_REGION,
      timePeriod,
    } = options;

    this.logger.log(
      `Performing DuckDuckGo (via SerpApi DDG) search with query: ${query}, region: ${region}, timePeriod: ${timePeriod}`,
    );
    try {
      if (this.apiKey === MOCK_API_KEY) {
        this.logger.warn('Using mock data for DuckDuckGo Search (SerpApi)');
        return getMockDuckDuckGoSearchResults(query, this.logger);
      }

      const params: Record<string, string> = {
        q: query,
        engine: DEFAULT_ENGINE,
        api_key: this.apiKey,
        kl: region,
      };

      if (timePeriod) {
        params.df = timePeriod;
      }

      const response = await axios.get<SerpApiDDGResponse>(this.apiUrl, {
        params,
      });

      let results = response.data.organic_results || [];

      if (offset > 0) {
        results = results.slice(offset);
      }

      if (count > 0) {
        results = results.slice(0, count);
      }

      this.logger.debug(`\n\nRESULTS: ${JSON.stringify(results, null, 2)}`);
      return results;
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
      return getMockDuckDuckGoSearchResults(query, this.logger);
    }
  }

  private formatSearchResults(
    results: DuckDuckGoSearchResult[],
    query: string,
  ): string {
    if (results.length === 0) {
      return `No results found for query: "${query}"`;
    }

    const formattedResults = results.map((result, index) => {
      return `
Result ${index + 1}:
Title: ${result.title}
URL: ${result.link}
Snippet: ${result.snippet}
${result.date ? `Date: ${result.date}` : ''}
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
        timePeriod?: 'd' | 'w' | 'm' | 'y';
        region?: string;
      }) => {
        const results = await this.performSearch({
          query: input.query,
          count: input.count,
          offset: input.offset,
          timePeriod: input.timePeriod,
          region: input.region,
        });
        return this.formatSearchResults(results, input.query);
      },
      {
        name: 'duck_duck_go_web_search',
        description:
          'Search the web using DuckDuckGo (via SerpApi DuckDuckGo engine). Useful for getting up-to-date information. Supported time periods: d (past day), w (past week), m (past month), y (past year).',
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
          timePeriod: z
            .enum(['d', 'w', 'm', 'y'])
            .optional()
            .describe(
              'Time period for results: d (past day), w (past week), m (past month), y (past year)',
            ),
          region: z
            .string()
            .optional()
            .describe(
              'Region code for localized results (e.g., wt-wt for global, us-en, uk-en)',
            ),
        }),
      },
    );
  }

  getAllTools() {
    return [this.getWebSearchTool()] as const;
  }
}
