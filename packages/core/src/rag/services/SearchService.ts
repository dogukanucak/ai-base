import { ConfigLoader } from "../../config/loader";
import type { SearchResult } from "../../types";
import type { ISearchService } from "../interfaces/ISearchService";
import type { IVectorStore } from "../interfaces/IVectorStore";

export class SearchService implements ISearchService {
  private configLoader: ConfigLoader;
  private vectorStore: IVectorStore;
  private similarityThreshold: number;

  constructor(vectorStore: IVectorStore) {
    this.configLoader = ConfigLoader.getInstance();
    this.vectorStore = vectorStore;
    this.similarityThreshold = this.configLoader.getConfig().retrieval.scoreThreshold || 0.5;
  }

  async search(query: string, limit = 5): Promise<SearchResult[]> {
    // Get more results than needed to allow for filtering
    const results = await this.vectorStore.findSimilar(query, limit * 2);
    return this.filterResults(results, limit);
  }

  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = threshold;
  }

  filterResults(results: SearchResult[], limit: number): SearchResult[] {
    // Filter by threshold and normalize scores
    const filteredResults = results
      .filter((result) => result.score >= this.similarityThreshold)
      .map((result) => ({
        ...result,
        // Normalize score to be between 0 and 1
        score: Math.min(Math.max(result.score, 0), 1),
      }))
      .sort((a, b) => b.score - a.score);

    // Remove duplicates based on content similarity
    const uniqueResults: SearchResult[] = [];
    const seenContent = new Set<string>();

    for (const result of filteredResults) {
      const content = result.document.pageContent.trim();
      // Simple deduplication based on content similarity
      if (!this.hasVerySimilarContent(content, seenContent)) {
        seenContent.add(content);
        uniqueResults.push(result);
        if (uniqueResults.length >= limit) break;
      }
    }

    return uniqueResults;
  }

  private hasVerySimilarContent(content: string, seenContent: Set<string>): boolean {
    // Simple similarity check based on content overlap
    for (const seen of seenContent) {
      const similarity = this.calculateContentSimilarity(content, seen);
      if (similarity > 0.8) return true;
    }
    return false;
  }

  private calculateContentSimilarity(a: string, b: string): number {
    // Simple Jaccard similarity for quick content comparison
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);
    return intersection.size / union.size;
  }
}
