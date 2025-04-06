export interface EmbeddingConfig {
  modelName: string;
}

export interface ChunkingConfig {
  type: "character" | "markdown" | "recursive";
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
  encodingName?: string;
  tokenBudget?: {
    maxTokens: number;
    minLength: number;
  };
}

export interface RetrievalConfig {
  type: "similarity" | "mmr" | "hybrid";
  fetchK?: number;
  lambda?: number;
  scoreThreshold?: number;
  useReranking?: boolean;
  queryCount?: number;
}

export interface VectorStoreConfig {
  type: "chroma";
  collectionName?: string;
  url?: string;
}

export interface DocumentLoaderConfig {
  type: "markdown" | "text" | "pdf";
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

export interface RAGConfig {
  embedding: EmbeddingConfig;
  chunking: ChunkingConfig;
  retrieval: RetrievalConfig;
  vectorStore: VectorStoreConfig;
  documentLoader: DocumentLoaderConfig;
  openAI: OpenAIConfig;
  console: ConsoleConfig;
}
