import { SearchResult } from "../../types";

export interface ISearchService {
  search(query: string, limit?: number): Promise<SearchResult[]>;
  setSimilarityThreshold(threshold: number): void;
  filterResults(results: SearchResult[], limit: number): SearchResult[];
}
