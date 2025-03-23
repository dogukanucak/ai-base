import { Express } from "express";
import { Plugin, QueryRequest, QueryResponse } from "./types";
import { RAGConfig } from "../../config/types";
import { RAGSystem } from "../../rag";
import { OpenAIClient } from "../../ai/openAIClient";

export class RAGPlugin implements Plugin {
  name = "rag";
  private rag: RAGSystem;
  private openai: OpenAIClient | null = null;

  constructor() {
    this.rag = new RAGSystem();
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

        // Load documents from the specified path
        await this.rag.loadMarkdownDocuments(path);

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
      await this.rag.loadMarkdownDocuments(config.documentLoader.path);
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

        // Search for relevant documents
        const searchResults = await this.rag.findSimilarDocuments(query, maxResults);

        // Filter out low similarity results
        const relevantResults = searchResults.filter((result) => result.score >= config.vectorStore.similarityThreshold);

        // Prepare response
        const response: QueryResponse = {
          query,
          documents: relevantResults.map((result) => ({
            content: config.console.truncateDocuments
              ? result.document.content.substring(0, config.console.documentPreviewLength) + "..."
              : result.document.content,
            similarity: result.score,
            id: result.document.id,
            isRelevant: result.score >= config.vectorStore.similarityThreshold,
          })),
          metadata: {
            totalResults: searchResults.length,
            relevantResults: relevantResults.length,
            similarityThreshold: config.vectorStore.similarityThreshold,
            filteredOutResults: searchResults.length - relevantResults.length,
          },
        };

        // Get AI response if enabled
        if (this.openai) {
          const aiResponse = await this.openai.getResponse(query, relevantResults);
          response.aiResponse =
            config.console.maxResponseLength > 0
              ? aiResponse.substring(0, config.console.maxResponseLength) + (aiResponse.length > config.console.maxResponseLength ? "..." : "")
              : aiResponse;
        }

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
