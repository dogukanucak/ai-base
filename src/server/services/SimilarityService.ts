import type { RAGSystem } from "@core/rag";
import { SearchResult as LangChainSearchResult } from "@core/types";
import type { Document as LangChainDocument } from "@langchain/core/documents";

export interface SearchResult {
  document: LangChainDocument;
  score: number;
}

export class SimilarityService {
  private rag: RAGSystem;

  constructor(rag: RAGSystem) {
    this.rag = rag;
  }

  async findRelevantDocuments(
    query: string,
    maxResults: number,
    similarityThreshold: number,
  ): Promise<SearchResult[]> {
    const searchResults = await this.rag.findSimilarDocuments(query, maxResults);
    return searchResults.filter((result: SearchResult) => result.score >= similarityThreshold);
  }

  async loadDocuments(path: string): Promise<void> {
    await this.rag.loadDocuments(path);
  }
}
