// Export types as they are implemented
export interface UniversitySearchState {
  query: string;
  url?: string;
  results?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export interface SearchResult {
  query: string;
  url?: string;
  results?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}
