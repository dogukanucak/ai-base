export interface RAGConfig {
  embedding: EmbeddingConfig;
  vectorStore: VectorStoreConfig;
  documentLoader: DocumentLoaderConfig;
  openAI: OpenAIConfig;
  console: ConsoleConfig;
}

export interface EmbeddingConfig {
  modelName: string;
  // Add any other embedding-specific configuration
}

export interface VectorStoreConfig {
  type: "chroma" | "faiss" | "simple"; // extensible to other vector stores
  collectionName?: string;
  similarityThreshold: number;
  // Add any other vector store-specific configuration
}

export interface DocumentLoaderConfig {
  type: "markdown";
  path: string;
  enabled: boolean; // Whether to load documents or not
}

export interface OpenAIConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean; // Whether to use OpenAI or not
}

export interface ConsoleConfig {
  maxResponseLength: number; // Maximum length of response to display in console
  showDebugInfo: boolean; // Whether to show debug information
  truncateDocuments: boolean; // Whether to truncate document content in console
  documentPreviewLength: number; // Length of document preview in console
}
