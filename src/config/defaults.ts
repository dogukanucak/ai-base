import { RAGConfig } from "./types";

export const defaultConfig: RAGConfig = {
  embedding: {
    modelName: "Xenova/all-MiniLM-L6-v2",
  },
  vectorStore: {
    type: "chroma",
    collectionName: "custom_rag",
    similarityThreshold: 0.7,
  },
  documentLoader: {
    type: "markdown",
    path: "docs",
  },
};
