import { RAGSystem } from "../../rag";
import { Document } from "../../documents/types";

export interface SearchResult {
  document: Document;
  score: number;
}

export class SimilarityService {
  private rag: RAGSystem;

  constructor(rag: RAGSystem) {
    this.rag = rag;
  }

  async findRelevantDocuments(query: string, maxResults: number, similarityThreshold: number): Promise<SearchResult[]> {
    const searchResults = await this.rag.findSimilarDocuments(query, maxResults);
    return searchResults.filter((result) => result.score >= similarityThreshold);
  }

  async loadDocuments(path: string): Promise<void> {
    await this.rag.loadMarkdownDocuments(path);
  }
}
