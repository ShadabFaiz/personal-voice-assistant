export interface WebPageFetcherOptions {
  url: string;
  headers?: Record<string, string>;
  sanitize_response?: boolean;
}

export interface WebPageFetcherResponse {
  url: string;
  status: number;
  data: string;
}
