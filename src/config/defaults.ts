import { RAGConfig } from "./types";

export const defaultConfig: RAGConfig = {
  embedding: {
    modelName: "Xenova/all-MiniLM-L6-v2",
  },
  chunking: {
    type: "character",
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", ""],
    encodingName: "cl100k_base",
    tokenBudget: 4096,
  },
  retrieval: {
    type: "similarity",
    fetchK: 10,
    lambda: 0.5,
    scoreThreshold: 0.7,
    useReranking: false,
    queryCount: 3,
  },
  vectorStore: {
    type: "chroma",
    collectionName: "ai_base",
    url: "http://localhost:8000",
  },
  documentLoader: {
    type: "markdown",
    path: "docs",
    enabled: true,
  },
  openAI: {
    model: "gpt-4-turbo-preview",
    maxTokens: 1000,
    temperature: 0.7,
    enabled: true,
  },
  console: {
    maxResponseLength: 1000,
    showDebugInfo: false,
    truncateDocuments: true,
    documentPreviewLength: 150,
  },
};
