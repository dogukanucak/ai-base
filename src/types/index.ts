import { Document as LangChainDocument } from "@langchain/core/documents";

// Core Types
export type Document = LangChainDocument;

// Search Related Types
export interface SearchResult {
  document: Document;
  score: number;
}

// Embedding Related Types
export type Embedding = number[];

export interface EmbeddingGenerator {
  generateEmbedding(text: string): Promise<Embedding>;
}

// Vector Store Types
export interface VectorStore {
  add(document: Document, vector: Embedding): Promise<void>;
  search(queryVector: Embedding, limit: number): Promise<SearchResult[]>;
  load(): Promise<void>;
  clear(): Promise<void>;
  setSimilarityThreshold?(threshold: number): void;
}

// Document Loading Types
export interface DocumentLoader {
  load(): Promise<Document[]>;
}

// Metadata Types
export type DocumentMetadata = Record<string, any>;
