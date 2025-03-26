import { FastifyInstance } from "fastify";
import { RAGConfig } from "../../config/types";

export interface Plugin {
  name: string;
  register(app: FastifyInstance, config: RAGConfig): void | Promise<void>;
}

export interface QueryRequest {
  query: string;
  maxResults?: number;
}

export interface QueryResponse {
  query: string;
  aiResponse?: string;
  documents: {
    content: string;
    similarity: number;
    id: string;
    isRelevant: boolean;
  }[];
  metadata: {
    totalResults: number;
    relevantResults: number;
    similarityThreshold: number;
    filteredOutResults: number;
  };
  error?: string;
}
