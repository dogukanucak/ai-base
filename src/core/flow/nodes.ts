import { FlowNode } from "@core/flow/base";
import { RAGSystem } from "@core/rag";
import { Document } from "@core/types";
import { OpenAIClient } from "@core/ai/openAIClient";
import { SearchResult } from "@core/types";

// Document loading node
export class DocumentLoadingNode extends FlowNode<any, any> {
  constructor(private rag: RAGSystem, private path: string) {
    super();
  }

  async process(state: any): Promise<{}> {
    await this.rag.loadAndAddDocuments(this.path);
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