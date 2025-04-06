import { FastifyInstance } from "fastify";
import { Plugin } from "@server/plugins/types";
import { RAGConfig } from "@core/config/types";
import { Server } from "@server/Server";
import os from "os";

export class BackofficePlugin implements Plugin {
  public readonly name = "backoffice";
  private serverStartTime: number;

  constructor() {
    this.serverStartTime = Date.now();
  }

  async register(app: FastifyInstance, config: RAGConfig, server: Server): Promise<void> {
    // Server status endpoint
    app.get("/api/server/status", async () => {
      const uptime = Math.floor((Date.now() - this.serverStartTime) / 1000);
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      const cpus = os.cpus();
      const cpuUsage =
        cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b);
          const idle = cpu.times.idle;
          return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length;

      return {
        isRunning: true,
        uptime,
        memory: {
          used: usedMemory,
          total: totalMemory,
        },
        cpu: cpuUsage,
      };
    });

    // Server control endpoints
    app.post("/api/server/restart", async () => {
      this.serverStartTime = Date.now();
      return { message: "Server restarted successfully" };
    });

    // Environment variables endpoints
    app.get("/api/env/variables", async () => {
      const variables = Object.entries(config).map(([key, value]) => {
        const isSecret = key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("password");
        return {
          key,
          value: isSecret ? "••••••••" : value,
          isSecret,
          description: this.getConfigDescription(key),
        };
      });

      return variables;
    });

    app.put<{
      Body: { key: string; value: string };
    }>("/api/env/variables", async (request, reply) => {
      const { key, value } = request.body;

      if (!key || value === undefined) {
        reply.code(400);
        return { error: "Key and value are required" };
      }

      if (!(key in config)) {
        reply.code(404);
        return { error: "Configuration key not found" };
      }

      // Update the configuration using the server instance
      const updateData = { [key]: value };
      server.updateConfig(updateData);
      return { message: "Configuration updated successfully" };
    });
  }

  private getConfigDescription(key: string): string {
    // Add descriptions for your configuration keys
    const descriptions: Record<string, string> = {
      EMBEDDING_MODEL: "Model used for text embeddings",
      USE_OPENAI: "Whether to use OpenAI services",
      OPENAI_API_KEY: "API key for OpenAI services",
      OPENAI_MODEL: "OpenAI model to use",
      OPENAI_MAX_TOKENS: "Maximum tokens for OpenAI responses",
      OPENAI_TEMPERATURE: "Temperature for OpenAI responses",
      CHUNKING_TYPE: "Type of text chunking to use",
      CHUNK_SIZE: "Size of text chunks",
      CHUNK_OVERLAP: "Overlap between text chunks",
      RETRIEVAL_TYPE: "Type of retrieval method",
      FETCH_K: "Number of documents to fetch",
      SCORE_THRESHOLD: "Minimum similarity score threshold",
      // Add more descriptions as needed
    };

    return descriptions[key] || "";
  }
}
