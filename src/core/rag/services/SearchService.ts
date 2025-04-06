import { ISearchService } from "../interfaces/ISearchService";
import { SearchResult } from "../../types";
import { ConfigLoader } from "../../config/loader";
import { IVectorStore } from "../interfaces/IVectorStore";

export class SearchService implements ISearchService {
  private configLoader: ConfigLoader;
  private vectorStore: IVectorStore;
  private similarityThreshold: number;

  constructor(vectorStore: IVectorStore) {
    this.configLoader = ConfigLoader.getInstance();
    this.vectorStore = vectorStore;
    this.similarityThreshold = this.configLoader.getConfig().retrieval.scoreThreshold || 0.5;
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const results = await this.vectorStore.findSimilar(query, limit * 2);
    return this.filterResults(results, limit);
  }

  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = threshold;
  }

  filterResults(results: SearchResult[], limit: number): SearchResult[] {
    // Filter by threshold and sort by score
    const filteredResults = results.filter((result) => result.score >= this.similarityThreshold).sort((a, b) => b.score - a.score);

    // Remove duplicates based on content
    const uniqueResults: SearchResult[] = [];
    const seenContent = new Set<string>();

    for (const result of filteredResults) {
      const content = result.document.pageContent.trim();
      if (!seenContent.has(content)) {
        seenContent.add(content);
        uniqueResults.push(result);
        if (uniqueResults.length >= limit) break;
      }
    }

    return uniqueResults;
  }
}
