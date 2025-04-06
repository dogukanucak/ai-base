import { FlowNode } from "@core/flow/base";
import { RAGSystem } from "../rag/RAGSystem";
import { Document } from "@core/types";
import { OpenAIClient } from "@core/ai/openAIClient";
import { SearchResult } from "@core/types";

// Document loading node
export class DocumentLoadingNode extends FlowNode<any, any> {
  constructor(private rag: RAGSystem, private path: string) {
    super();
  }

  async process(state: any): Promise<{}> {
    const documents = await this.rag.loadDocuments(this.path);
    await this.rag.addDocuments(documents);
    return {};
  }
}

// Document retrieval node
export class DocumentRetrievalNode extends FlowNode<any, any> {
  constructor(private rag: RAGSystem) {
    super();
  }

  async process(state: { query: string }): Promise<{ searchResults: SearchResult[] }> {
    const results = await this.rag.findSimilarDocuments(state.query);
    return { searchResults: results };
  }
}

// Optional AI response node
export class AIResponseNode extends FlowNode<any, any> {
  constructor(private openai: OpenAIClient) {
    super();
  }

  async process(state: { query: string; searchResults: SearchResult[] }): Promise<{ aiResponse: string }> {
    const response = await this.openai.getResponse(state.query, state.searchResults);
    return { aiResponse: response };
  }
}

// Combine results node for web and document search
export class CombineResultsNode extends FlowNode<any, any> {
  constructor(private rag: RAGSystem) {
    super();
  }

  async process(state: { query: string; searchResults?: SearchResult[] }): Promise<{ searchResults: SearchResult[] }> {
    // Get web search results (already in state.searchResults)
    const webResults = state.searchResults || [];

    // Search in documents using RAG
    const documentResults = await this.rag.findSimilarDocuments(state.query);

    // Combine and sort all results by score
    const allResults = [...webResults, ...documentResults].sort((a, b) => b.score - a.score);

    // Remove duplicates based on content
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex((r) => r.document.pageContent === result.document.pageContent)
    );

    return { searchResults: uniqueResults };
  }
} 