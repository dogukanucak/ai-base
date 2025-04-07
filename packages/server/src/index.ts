import { ConfigLoader } from "@ai-base/core/config/loader";
import { Server } from "./Server";
import dotenv from "dotenv";

async function startServer() {
  try {
    // Load environment variables
    dotenv.config();

    // Initialize configuration
    const configLoader = ConfigLoader.getInstance();
    configLoader.loadFromEnv();
    const config = configLoader.getConfig();

    // Start server
    const server = new Server();
    await server.start(3000);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
