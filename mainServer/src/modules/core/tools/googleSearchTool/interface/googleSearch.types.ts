export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

export interface SerpApiDDGResponse {
  organic_results?: GoogleSearchResult[];
  search_metadata?: {
    id: string;
    status: string;
  };
}

export interface GoogleSearchOptions {
  query: string;
  count?: number;
  offset?: number;
  region?: string;
  timePeriod?: 'd' | 'w' | 'm' | 'y'; // day, week, month, year for DDG
}
