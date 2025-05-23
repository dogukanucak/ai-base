import { OpenAIClient } from "@ai-base/core/ai/openAIClient";
import type { RAGConfig } from "@ai-base/core/config/types";
import { RAGSystem } from "@ai-base/core/rag";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Server } from "../Server";
import { ResponseFormatter } from "../services/ResponseFormatter";
import { SimilarityService } from "../services/SimilarityService";
import type { QueryRequest } from "./types";
import type { Plugin } from "./types";

const DEFAULT_SIMILARITY_THRESHOLD = 0.7;

export class RAGPlugin implements Plugin {
  readonly name = "rag";
  private similarityService: SimilarityService;
  private responseFormatter: ResponseFormatter;
  private openai: OpenAIClient | null = null;
  private config: RAGConfig;
  private rag: RAGSystem;
  private openAIClient: OpenAIClient;

  constructor(config: RAGConfig) {
    this.config = config;
    this.rag = new RAGSystem();
    this.openAIClient = new OpenAIClient({ ...config.openAI, apiKey: config.openAI.apiKey || "" });
    this.similarityService = new SimilarityService(this.rag);
    this.responseFormatter = new ResponseFormatter(config);
  }

  async register(app: FastifyInstance, config: RAGConfig, server: Server): Promise<void> {
    // Initialize OpenAI if enabled
    if (config.openAI.enabled && config.openAI.apiKey) {
      this.openai = new OpenAIClient({
        apiKey: config.openAI.apiKey,
        model: config.openAI.model,
        maxTokens: config.openAI.maxTokens,
        temperature: config.openAI.temperature,
      });
    }

    // Register document loading endpoint
    app.post(
      "/api/documents/load",
      async (
        request: FastifyRequest<{
          Body: { path?: string };
        }>,
        reply: FastifyReply,
      ) => {
        try {
          const { path = "docs" } = request.body;
          await this.similarityService.loadDocuments(path);
          reply.send({
            success: true,
            message: `Documents loaded successfully from ${path}`,
          });
        } catch (error) {
          console.error("Error loading documents:", error);
          reply.status(500).send({
            error: "Failed to load documents",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    );

    // Load documents if enabled
    if (config.documentLoader.enabled) {
      await this.similarityService.loadDocuments(config.documentLoader.path);
    }

    // Register the query endpoint
    app.post(
      "/api/query",
      async (
        request: FastifyRequest<{
          Body: QueryRequest;
        }>,
        reply: FastifyReply,
      ) => {
        try {
          const { query, maxResults = 5 } = request.body;

          if (!query) {
            return reply.status(400).send({
              error: "Query is required",
            });
          }

          const searchResults = await this.similarityService.findRelevantDocuments(
            query,
            maxResults,
            DEFAULT_SIMILARITY_THRESHOLD,
          );

          let aiResponse: string | undefined;
          if (this.openai) {
            aiResponse = await this.openai.getResponse(query, searchResults);
          }

          const response = this.responseFormatter.formatResponse(query, searchResults);
          reply.send(response);
        } catch (error) {
          console.error("Error processing query:", error);
          reply.status(500).send({
            error: "Failed to process query",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    );
  }

  async handleQuery(
    request: FastifyRequest<{ Body: QueryRequest }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { query } = request.body;
    const searchResults = await this.similarityService.findRelevantDocuments(
      query,
      (this.config.retrieval as { fetchK?: number }).fetchK || 5,
      (this.config.retrieval as { scoreThreshold?: number }).scoreThreshold || 0.7,
    );
    const aiResponse = await this.openAIClient.getResponse(query, searchResults);
    const response = this.responseFormatter.formatResponse(query, searchResults);
    await reply.send(response);
  }
}
