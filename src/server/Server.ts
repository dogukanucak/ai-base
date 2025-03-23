import express, { Express } from "express";
import cors from "cors";
import { Plugin } from "./plugins/types";
import { ConfigLoader } from "../config/loader";
import { RAGConfig } from "../config/types";

export class Server {
  private app: Express;
  private config: RAGConfig;
  private plugins: Plugin[] = [];

  constructor() {
    this.app = express();
    this.config = ConfigLoader.getInstance().getConfig();

    // Setup middleware
    this.app.use(express.json());
    this.app.use(cors());
  }

  public async registerPlugin(plugin: Plugin): Promise<void> {
    try {
      await plugin.register(this.app, this.config);
      this.plugins.push(plugin);
      console.log(`Plugin "${plugin.name}" registered successfully`);
    } catch (error) {
      console.error(`Failed to register plugin "${plugin.name}":`, error);
      throw error;
    }
  }

  public async start(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        console.log("Registered plugins:", this.plugins.map((p) => p.name).join(", "));
        resolve();
      });
    });
  }

  public getConfig(): RAGConfig {
    return this.config;
  }

  public updateConfig(config: Partial<RAGConfig>): void {
    ConfigLoader.getInstance().updateConfig(config);
    this.config = ConfigLoader.getInstance().getConfig();
  }
}
