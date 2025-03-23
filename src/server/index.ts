import { Server } from "./Server";
import { RAGPlugin } from "./plugins/ragPlugin";
import { ConfigLoader } from "../config/loader";
import dotenv from "dotenv";
import path from "path";

async function startServer() {
  // Load environment variables
  dotenv.config();

  // Initialize configuration
  const config = ConfigLoader.getInstance();

  // Load config from file if it exists
  const configPath = path.join(__dirname, "../../config.json");
  config.loadFromFile(configPath);

  // Load config from environment variables (will override file config)
  config.loadFromEnv();

  // Create and configure server
  const server = new Server();

  // Register plugins
  await server.registerPlugin(new RAGPlugin());

  // Start server
  const port = parseInt(process.env.PORT || "3000");
  await server.start(port);
}

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
