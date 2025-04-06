import fs from "node:fs";
import path from "node:path";
import { defaultConfig } from "./defaults";
import type { RAGConfig } from "./types";

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: RAGConfig;

  private constructor(config: Partial<RAGConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.loadFromEnv();
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  public loadFromFile(filePath: string): void {
    try {
      const configFile = fs.readFileSync(filePath, "utf8");
      const fileConfig = JSON.parse(configFile);
      this.mergeConfig(fileConfig);
    } catch (error) {
      console.warn(`Failed to load config from file ${filePath}:`, error);
    }
  }

  public loadFromEnv(): void {
    const envConfig: RAGConfig = {
      embedding: {
        modelName: process.env.EMBEDDING_MODEL || this.config.embedding.modelName,
      },
      chunking: {
        type:
          (process.env.CHUNKING_TYPE as RAGConfig["chunking"]["type"]) || this.config.chunking.type,
        chunkSize: Number.parseInt(
          process.env.CHUNK_SIZE || String(this.config.chunking.chunkSize),
        ),
        chunkOverlap: Number.parseInt(
          process.env.CHUNK_OVERLAP || String(this.config.chunking.chunkOverlap),
        ),
        separators: process.env.CHUNK_SEPARATORS
          ? process.env.CHUNK_SEPARATORS.split(",")
          : this.config.chunking.separators,
      },
      retrieval: {
        type:
          (process.env.RETRIEVAL_TYPE as RAGConfig["retrieval"]["type"]) ||
          this.config.retrieval.type,
        fetchK: Number.parseInt(process.env.FETCH_K || String(this.config.retrieval.fetchK)),
        lambda: Number.parseFloat(process.env.LAMBDA || String(this.config.retrieval.lambda)),
        scoreThreshold: Number.parseFloat(
          process.env.SCORE_THRESHOLD || String(this.config.retrieval.scoreThreshold),
        ),
        useReranking: process.env.USE_RERANKING === "true" || this.config.retrieval.useReranking,
        queryCount: Number.parseInt(
          process.env.QUERY_COUNT || String(this.config.retrieval.queryCount),
        ),
      },
      vectorStore: {
        type:
          (process.env.VECTOR_STORE_TYPE as RAGConfig["vectorStore"]["type"]) ||
          this.config.vectorStore.type,
        collectionName: process.env.COLLECTION_NAME || this.config.vectorStore.collectionName,
        url: process.env.VECTOR_STORE_URL || this.config.vectorStore.url,
      },
      documentLoader: {
        type: "markdown" as const,
        path: process.env.DOCUMENTS_PATH
          ? path.resolve(process.cwd(), process.env.DOCUMENTS_PATH)
          : this.config.documentLoader.path,
        enabled: process.env.LOAD_DOCUMENTS === "true" || this.config.documentLoader.enabled,
      },
      openAI: {
        model: process.env.OPENAI_MODEL || this.config.openAI.model,
        maxTokens: Number.parseInt(
          process.env.OPENAI_MAX_TOKENS || String(this.config.openAI.maxTokens),
        ),
        temperature: Number.parseFloat(
          process.env.OPENAI_TEMPERATURE || String(this.config.openAI.temperature),
        ),
        enabled: process.env.USE_OPENAI === "true" || this.config.openAI.enabled,
        apiKey: process.env.OPENAI_API_KEY || this.config.openAI.apiKey,
      },
      console: {
        maxResponseLength: Number.parseInt(
          process.env.MAX_RESPONSE_LENGTH || String(this.config.console.maxResponseLength),
        ),
        showDebugInfo: process.env.SHOW_DEBUG_INFO === "true" || this.config.console.showDebugInfo,
        truncateDocuments:
          process.env.TRUNCATE_DOCUMENTS === "true" || this.config.console.truncateDocuments,
        documentPreviewLength: Number.parseInt(
          process.env.DOCUMENT_PREVIEW_LENGTH || String(this.config.console.documentPreviewLength),
        ),
      },
    };

    this.mergeConfig(envConfig);
  }

  public updateConfig(partialConfig: Partial<RAGConfig>): void {
    this.mergeConfig(partialConfig);
  }

  public getConfig(): RAGConfig {
    return { ...this.config };
  }

  private mergeConfig(newConfig: Partial<RAGConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      vectorStore: {
        ...this.config.vectorStore,
        ...newConfig.vectorStore,
      },
      documentLoader: {
        ...this.config.documentLoader,
        ...newConfig.documentLoader,
      },
      openAI: {
        ...this.config.openAI,
        ...newConfig.openAI,
      },
      console: {
        ...this.config.console,
        ...newConfig.console,
      },
    };
  }
}
