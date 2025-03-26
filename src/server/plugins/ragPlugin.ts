import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { RAGSystem } from "../../rag";
import { RAGConfig } from "../../config/types";
import { QueryRequest } from "./types";
import { OpenAIClient } from "../../ai/openAIClient";
import { SimilarityService } from "../services/SimilarityService";
import { ResponseFormatter } from "../services/ResponseFormatter";
import { Plugin } from "./types";

const DEFAULT_SIMILARITY_THRESHOLD = 0.7;

export class RAGPlugin implements Plugin {
  readonly name = "rag";
  private similarityService: SimilarityService;
  private responseFormatter: ResponseFormatter;
  private openai: OpenAIClient | null = null;

  constructor() {
    const rag = new RAGSystem();
    this.similarityService = new SimilarityService(rag);
    this.responseFormatter = new ResponseFormatter();
  }

  async register(app: FastifyInstance, config: RAGConfig): Promise<void> {
    // Initialize OpenAI if enabled
    console.log("OpenAI config:", {
      enabled: config.openAI.enabled,
      hasApiKey: !!config.openAI.apiKey,
      model: config.openAI.model,
    });

    if (config.openAI.enabled) {
      if (!config.openAI.apiKey) {
        console.warn("OpenAI is enabled but no API key provided. OpenAI features will be disabled.");
      } else {
        console.log("Initializing OpenAI client...");
        this.openai = new OpenAIClient({
          apiKey: config.openAI.apiKey,
          model: config.openAI.model,
          maxTokens: config.openAI.maxTokens,
          temperature: config.openAI.temperature,
        });
      }
    }

    // Register document loading endpoint
    app.post(
      "/api/documents/load",
      async (
        request: FastifyRequest<{
          Body: { path?: string };
        }>,
        reply: FastifyReply
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
      }
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
        reply: FastifyReply
      ) => {
        try {
          const { query, maxResults = 5 } = request.body;

          if (!query) {
            return reply.status(400).send({
              error: "Query is required",
            });
          }

          const searchResults = await this.similarityService.findRelevantDocuments(query, maxResults, DEFAULT_SIMILARITY_THRESHOLD);

          let aiResponse: string | undefined;
          console.log("OpenAI client status:", {
            isInitialized: !!this.openai,
            query,
            resultsCount: searchResults.length,
          });

          if (this.openai) {
            console.log("Requesting OpenAI response...");
            aiResponse = await this.openai.getResponse(query, searchResults);
            console.log("Received OpenAI response:", aiResponse ? "success" : "no response");
          } else {
            console.log("OpenAI client not initialized, skipping AI response");
          }

          const response = this.responseFormatter.format(query, searchResults, searchResults, config, aiResponse);

          reply.send(response);
        } catch (error) {
          console.error("Error processing query:", error);
          reply.status(500).send({
            error: "Failed to process query",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );
  }
}
