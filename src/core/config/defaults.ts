import { RAGConfig } from "./types";

export const defaultConfig: RAGConfig = {
  embedding: {
    modelName: "Xenova/all-MiniLM-L6-v2",
  },
  chunking: {
    type: "markdown",
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ["## ", "# ", "\n### ", "\n## ", "\n# ", "\n\n", "\n", ". ", " "],
    encodingName: "cl100k_base",
    tokenBudget: {
      maxTokens: 500,
      minLength: 100,
    },
  },
  retrieval: {
    type: "similarity",
    fetchK: 5,
    lambda: 0.5,
    scoreThreshold: 0.7,
    useReranking: false,
    queryCount: 3,
  },
  vectorStore: {
    type: "chroma",
    collectionName: "documents",
    url: "http://localhost:8000",
  },
  documentLoader: {
    type: "markdown" as const,
    path: "./docs",
    enabled: true,
  },
  openAI: {
    model: "gpt-3.5-turbo",
    maxTokens: 500,
    temperature: 0.7,
    enabled: false,
  },
  console: {
    maxResponseLength: 1000,
    showDebugInfo: true,
    truncateDocuments: true,
    documentPreviewLength: 200,
  },
};
