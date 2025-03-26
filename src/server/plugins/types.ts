import { FastifyInstance } from "fastify";
import { RAGConfig } from "../../config/types";
import { Server } from "../Server";

export interface Plugin {
  name: string;
  register(app: FastifyInstance, config: RAGConfig, server: Server): void | Promise<void>;
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
