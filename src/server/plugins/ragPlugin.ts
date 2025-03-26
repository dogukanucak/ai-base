import { Express } from "express";
import { Plugin, QueryRequest, QueryResponse } from "./types";
import { RAGConfig } from "../../config/types";
import { RAGSystem } from "../../rag";
import { OpenAIClient } from "../../ai/openAIClient";
import { SimilarityService } from "../services/SimilarityService";
import { ResponseFormatter } from "../services/ResponseFormatter";

export class RAGPlugin implements Plugin {
  name = "rag";
  private similarityService: SimilarityService;
  private responseFormatter: ResponseFormatter;
  private openai: OpenAIClient | null = null;

  constructor() {
    const rag = new RAGSystem();
    this.similarityService = new SimilarityService(rag);
    this.responseFormatter = new ResponseFormatter();
  }

  async register(app: Express, config: RAGConfig): Promise<void> {
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
    app.post("/api/documents/load", async (req, res) => {
      try {
        const { path = "docs" } = req.body;
        await this.similarityService.loadDocuments(path);
        res.json({
          success: true,
          message: `Documents loaded successfully from ${path}`,
        });
      } catch (error) {
        console.error("Error loading documents:", error);
        res.status(500).json({
          error: "Failed to load documents",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Load documents if enabled
    if (config.documentLoader.enabled) {
      await this.similarityService.loadDocuments(config.documentLoader.path);
    }

    // Register the query endpoint
    app.post("/api/query", async (req, res) => {
      try {
        const { query, maxResults = 5 }: QueryRequest = req.body;

        if (!query) {
          return res.status(400).json({
            error: "Query is required",
          });
        }

        const searchResults = await this.similarityService.findRelevantDocuments(query, maxResults, config.vectorStore.similarityThreshold);

        let aiResponse: string | undefined;
        if (this.openai) {
          aiResponse = await this.openai.getResponse(query, searchResults);
        }

        const response = this.responseFormatter.format(query, searchResults, searchResults, config, aiResponse);

        res.json(response);
      } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }
}
