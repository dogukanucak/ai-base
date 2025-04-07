import type { OpenAIClient } from "@core/ai/openAIClient";
import { FlowNode } from "@core/flow/base";
import type { Document } from "@langchain/core/documents";
import type { RAGSystem } from "@core/rag";
import type { SearchResult } from "@core/types";
import type { WebSearchState } from "@core/flow/web-flows/web-content-loader-node";

export interface DocumentState {
  documents: Document[];
}

export interface QueryState extends DocumentState {
  query: string;
  results?: Document[];
}

export interface AIResponseState extends QueryState {
  aiResponse?: string;
}

export interface CombinedSearchState extends QueryState {
  searchResults?: SearchResult[];
}

// Document loading node
export class DocumentLoadingNode extends FlowNode<WebSearchState, WebSearchState> {
  constructor(
    private rag: RAGSystem,
    private path: string,
  ) {
    super();
  }

  async process(state: WebSearchState): Promise<Partial<WebSearchState>> {
    const documents = await this.rag.loadDocuments(this.path);
    await this.rag.addDocuments(documents);
    return { documents };
  }
}

// Document retrieval node
export class DocumentRetrievalNode extends FlowNode<QueryState, QueryState> {
  constructor(private rag: RAGSystem) {
    super();
  }

  async process(state: QueryState): Promise<QueryState> {
    const results = await this.rag.findSimilarDocuments(state.query);
    return { ...state, results };
  }
}

// Optional AI response node
export class AIResponseNode extends FlowNode<QueryState, AIResponseState> {
  constructor(private openai: OpenAIClient) {
    super();
  }

  async process(state: QueryState): Promise<AIResponseState> {
    if (!state.results) {
      return { ...state, aiResponse: "No results found." };
    }

    const response = await this.openai.getResponse(state.query, state.results);
    return { ...state, aiResponse: response };
  }
}

// Combine results node for web and document search
export class CombineResultsNode extends FlowNode<WebSearchState, WebSearchState> {
  constructor(private rag: RAGSystem) {
    super();
  }

  async process(state: WebSearchState): Promise<Partial<WebSearchState>> {
    // Get web search results (already in state.searchResults)
    const webResults = state.searchResults || [];

    // Search in documents using RAG
    const documentResults = await this.rag.findSimilarDocuments(state.query);

    // Combine and sort all results by score
    const allResults = [...webResults, ...documentResults].sort((a, b) => b.score - a.score);

    // Remove duplicates based on content
    const uniqueResults = allResults.filter(
      (result, index, self) =>
        index === self.findIndex((r) => r.document.pageContent === result.document.pageContent),
    );

    return { searchResults: uniqueResults };
  }
}
