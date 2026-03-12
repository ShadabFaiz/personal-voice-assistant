import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { WebPageFetcherOptions, WebPageFetcherResponse } from './interface';
import { buildRequestHeaders } from './utils';
import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_REQUEST_TIMEOUT,
} from './constants/defaultHeaders';

import { isAxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WebPageFetcherTool {
  private readonly logger = new Logger(WebPageFetcherTool.name);

  constructor(private readonly httpService: HttpService) {}

  private async fetchWebPage(
    options: WebPageFetcherOptions,
  ): Promise<WebPageFetcherResponse> {
    const { url, headers = {} } = options;
    this.logger.debug(`Fetching webpage from URL: ${url}`);

    try {
      const response = await this.makeRequest(url, headers);
      return this.buildWebResponse(response, url);
    } catch (error) {
      this.handleError(error, url);
    }
  }

  private async makeRequest(
    url: string,
    customHeaders: Record<string, string>,
  ) {
    const headers = buildRequestHeaders(customHeaders);

    return lastValueFrom(
      this.httpService.get(url, {
        headers,
        maxRedirects: DEFAULT_MAX_REDIRECTS,
        timeout: DEFAULT_REQUEST_TIMEOUT,
      }),
    );
  }

  private buildWebResponse(
    response: { status: number; data: string; config: { url?: string } },
    url: string,
  ): WebPageFetcherResponse {
    return {
      url: response.config.url || url,
      status: response.status,
      data: response.data,
    };
  }

  private handleError(error: unknown, url: string): never {
    if (isAxiosError(error)) {
      this.logger.error(
        `Error fetching webpage: ${error.message}`,
        error.stack,
      );
      const errorMessage = `Failed to fetch webpage from ${url}. Status: ${error.response?.status || 'Unknown'}. Error: ${error.message}`;
      throw new Error(errorMessage);
    }

    this.logger.error(
      `Error fetching webpage: ${String(error)}`,
      error instanceof Error ? error.stack : undefined,
    );
    const errorMessage = `Failed to fetch webpage from ${url}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    throw new Error(errorMessage);
  }

  private formatWebResponse(response: WebPageFetcherResponse): string {
    const maxContentLength = 10000;
    const truncatedContent =
      response.data.length > maxContentLength
        ? response.data.substring(0, maxContentLength) +
          '... (content truncated due to length)'
        : response.data;

    return JSON.stringify({
      url: response.url,
      status: response.status,
      contentLength: response.data.length,
      content: truncatedContent,
    });
  }

  private getWebPageFetcherTool() {
    return tool(
      async (input: { url: string; headers?: Record<string, string> }) => {
        const response = await this.fetchWebPage({
          url: input.url,
          headers: input.headers,
        });
        return this.formatWebResponse(response);
      },
      {
        name: 'webpage_fetcher',
        description:
          'Fetch and retrieve the content of a webpage from a given URL. Optionally accepts custom headers for the request.',
        responseFormat: 'content',
        schema: z.object({
          url: z
            .string()
            .refine(
              (val) => {
                try {
                  new URL(val);
                  return true;
                } catch {
                  return false;
                }
              },
              { message: 'Invalid URL format' },
            )
            .describe('The URL of the webpage to fetch'),
          headers: z
            .any()
            .optional()
            .describe(
              'Optional custom headers to send with the request as a JSON object (e.g., {"Authorization": "Bearer token"}). Default headers include User-Agent and Accept.',
            ),
        }),
      },
    );
  }

  getAllTools() {
    return [this.getWebPageFetcherTool()] as const;
  }
}
