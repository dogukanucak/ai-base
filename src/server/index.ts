import { Server } from "./Server";
import { ConfigLoader } from "../config/loader";
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
    const server = new Server(config);
    await server.start();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
