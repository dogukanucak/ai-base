export interface RAGConfig {
  embedding: EmbeddingConfig;
  vectorStore: VectorStoreConfig;
  documentLoader: DocumentLoaderConfig;
  openAI: OpenAIConfig;
  console: ConsoleConfig;
}

export interface EmbeddingConfig {
  modelName: string;
}

export interface VectorStoreConfig {
  type: "chroma";
  collectionName?: string;
}

export interface DocumentLoaderConfig {
  type: "markdown";
  path: string;
  enabled: boolean;
}

export interface OpenAIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  apiKey?: string;
}

export interface ConsoleConfig {
  maxResponseLength: number;
  showDebugInfo: boolean;
  truncateDocuments: boolean;
  documentPreviewLength: number;
}
