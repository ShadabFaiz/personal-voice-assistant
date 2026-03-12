export interface BraveSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface BraveWebResponse {
  web?: {
    results?: BraveSearchResult[];
  };
  query?: {
    original: string;
  };
}

export interface BraveSearchOptions {
  query: string;
  count?: number;
  offset?: number;
  searchType?: 'web' | 'news' | 'images' | 'videos';
  freshness?: 'on' | 'pd' | 'pw' | 'pm' | 'py' | 'pn';
  country?: string;
  units?: string;
}

export interface BraveSearchConfig {
  apiKey: string;
  apiUrl: string;
}
