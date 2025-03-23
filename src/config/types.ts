export interface RAGConfig {
  embedding: EmbeddingConfig;
  vectorStore: VectorStoreConfig;
  documentLoader: DocumentLoaderConfig;
}

export interface EmbeddingConfig {
  modelName: string;
  // Add any other embedding-specific configuration
}

export interface VectorStoreConfig {
  type: "chroma" | "faiss" | "simple"; // extensible to other vector stores
  collectionName?: string;
  similarityThreshold?: number;
  // Add any other vector store-specific configuration
}

export interface DocumentLoaderConfig {
  type: "markdown" | "pdf" | "text"; // extensible to other document types
  path: string;
  // Add any other loader-specific configuration
}
