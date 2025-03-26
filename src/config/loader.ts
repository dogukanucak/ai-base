import { RAGConfig } from "./types";
import { defaultConfig } from "./defaults";
import fs from "fs";
import path from "path";

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: RAGConfig;

  private constructor() {
    this.config = { ...defaultConfig };
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
    const envConfig: Partial<RAGConfig> = {
      vectorStore: {
        ...this.config.vectorStore,
        collectionName: process.env.COLLECTION_NAME || this.config.vectorStore.collectionName,
      },
      documentLoader: {
        ...this.config.documentLoader,
        enabled: process.env.LOAD_DOCUMENTS === "true",
        path: process.env.DOCUMENTS_PATH || this.config.documentLoader.path,
      },
      openAI: {
        ...this.config.openAI,
        enabled: process.env.USE_OPENAI === "true",
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || this.config.openAI.model,
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || String(this.config.openAI.maxTokens)),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || String(this.config.openAI.temperature)),
      },
      console: {
        ...this.config.console,
        maxResponseLength: parseInt(process.env.CONSOLE_MAX_RESPONSE_LENGTH || String(this.config.console.maxResponseLength)),
        showDebugInfo: process.env.SHOW_DEBUG_INFO === "true",
        truncateDocuments: process.env.TRUNCATE_DOCUMENTS !== "false",
        documentPreviewLength: parseInt(process.env.DOCUMENT_PREVIEW_LENGTH || String(this.config.console.documentPreviewLength)),
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
