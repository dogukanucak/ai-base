import { SearchResult } from "./SimilarityService";
import { QueryResponse } from "../plugins/types";
import { RAGConfig } from "@core/config/types";

export class ResponseFormatter {
  private config: RAGConfig;

  constructor(config: RAGConfig) {
    this.config = config;
  }

  formatResponse(query: string, relevantResults: SearchResult[]): QueryResponse {
    const scoreThreshold = this.config.retrieval?.scoreThreshold ?? 0.7;
    
    return {
      query,
      documents: relevantResults.map((result) => ({
        content: result.document.pageContent,
        similarity: result.score,
        id: result.document.metadata?.id || "",
        isRelevant: result.score >= scoreThreshold
      })),
      metadata: {
        totalResults: relevantResults.length,
        relevantResults: relevantResults.length,
        similarityThreshold: scoreThreshold,
        filteredOutResults: 0
      }
    };
  }
}
