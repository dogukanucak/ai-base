export interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  document: Document;
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
  loadDocuments(): Promise<Document[]>;
}
