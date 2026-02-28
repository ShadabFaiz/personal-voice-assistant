export interface DuckDuckGoSearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

export interface SerpApiDDGResponse {
  organic_results?: DuckDuckGoSearchResult[];
  search_metadata?: {
    id: string;
    status: string;
  };
}

export interface DuckDuckGoSearchOptions {
  query: string;
  count?: number;
  offset?: number;
  region?: string;
  timePeriod?: 'd' | 'w' | 'm' | 'y'; // day, week, month, year for DDG
}
