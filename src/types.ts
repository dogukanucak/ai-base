import { Document as LangChainDocument } from "@langchain/core/documents";

export type Document = LangChainDocument;

export interface SearchResult {
  document: LangChainDocument;
  score: number;
}

// Note: These interfaces are no longer needed as we're using LangChain's built-in types
// export interface EmbeddingGenerator {
//   generateEmbedding(text: string): Promise<number[]>;
// }

// export interface VectorStore {
//   add(document: Document, vector: number[]): Promise<void>;
//   search(queryVector: number[], limit: number): Promise<SearchResult[]>;
//   clear(): Promise<void>;
//   setSimilarityThreshold?(threshold: number): void;
// }

export interface DocumentLoader {
  load(): Promise<LangChainDocument[]>;
}
