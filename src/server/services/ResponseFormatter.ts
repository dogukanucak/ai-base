import { SearchResult } from "./SimilarityService";
import { QueryResponse } from "../plugins/types";
import { RAGConfig } from "../../config/types";

export class ResponseFormatter {
  format(query: string, searchResults: SearchResult[], relevantResults: SearchResult[], config: RAGConfig, aiResponse?: string): QueryResponse {
    const response: QueryResponse = {
      query,
      documents: relevantResults.map((result) => ({
        content: this.truncateContent(result.document.content, config.console.truncateDocuments, config.console.documentPreviewLength),
        similarity: result.score,
        id: result.document.id,
        isRelevant: result.score >= config.vectorStore.similarityThreshold,
      })),
      metadata: {
        totalResults: searchResults.length,
        relevantResults: relevantResults.length,
        similarityThreshold: config.vectorStore.similarityThreshold,
        filteredOutResults: searchResults.length - relevantResults.length,
      },
    };

    if (aiResponse) {
      response.aiResponse = this.truncateContent(aiResponse, config.console.maxResponseLength > 0, config.console.maxResponseLength);
    }

    return response;
  }

  private truncateContent(content: string, shouldTruncate: boolean, maxLength: number): string {
    if (!shouldTruncate || maxLength <= 0) {
      return content;
    }
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  }
}
