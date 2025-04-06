import { RAGSystem } from "@core/rag";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { SearchResult as LangChainSearchResult } from "@core/types";

export interface SearchResult {
  document: LangChainDocument;
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
    await this.rag.loadDocuments(path);
  }
}
