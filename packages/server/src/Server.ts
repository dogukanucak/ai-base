import { ConfigLoader } from "@ai-base/core/config/loader";
import type { RAGConfig } from "@ai-base/core/config/types";
import cors from "@fastify/cors";
import { BackofficePlugin } from "./plugins/backoffice/BackofficePlugin";
import { RAGPlugin } from "./plugins/ragPlugin";
import type { Plugin } from "./plugins/types";
import fastify, { type FastifyInstance } from "fastify";

export class Server {
  private app: FastifyInstance;
  private config: RAGConfig;
  private plugins: Plugin[] = [];

  constructor() {
    this.app = fastify();
    this.config = ConfigLoader.getInstance().getConfig();
    this.plugins.push(new RAGPlugin(this.config));
    this.plugins.push(new BackofficePlugin());
  }

  async start(port = 3000): Promise<void> {
    try {
      await this.app.register(cors, {
        origin: true,
      });

      for (const plugin of this.plugins) {
        await plugin.register(this.app, this.config, this);
      }

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
    (
      ConfigLoader.getInstance() as { updateConfig: (config: Partial<RAGConfig>) => void }
    ).updateConfig(config);
    this.config = ConfigLoader.getInstance().getConfig();
  }
}
