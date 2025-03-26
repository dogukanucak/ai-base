import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { Plugin } from "./plugins/types";
import { ConfigLoader } from "../config/loader";
import { RAGConfig } from "../config/types";
import { RAGPlugin } from "./plugins/ragPlugin";

export class Server {
  private app: FastifyInstance;
  private config: RAGConfig;
  private plugins: Plugin[] = [];

  constructor(config: RAGConfig) {
    this.app = fastify();
    this.config = config;
    this.plugins.push(new RAGPlugin());
  }

  async start(port: number = 3000): Promise<void> {
    try {
      // Register CORS
      await this.app.register(cors, {
        origin: true,
      });

      // Register plugins
      for (const plugin of this.plugins) {
        await plugin.register(this.app, this.config);
      }

      // Start server
      await this.app.listen({ port });
      console.log(`Server is running on port ${port}`);
    } catch (error) {
      console.error("Failed to start server:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.app.close();
    } catch (error) {
      console.error("Failed to stop server:", error);
      throw error;
    }
  }

  public getConfig(): RAGConfig {
    return this.config;
  }

  public updateConfig(config: Partial<RAGConfig>): void {
    ConfigLoader.getInstance().updateConfig(config);
    this.config = ConfigLoader.getInstance().getConfig();
  }
}
