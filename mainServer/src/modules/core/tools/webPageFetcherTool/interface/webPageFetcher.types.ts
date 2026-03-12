export interface WebPageFetcherOptions {
  url: string;
  headers?: Record<string, string>;
}

export interface WebPageFetcherResponse {
  url: string;
  status: number;
  data: string;
}
