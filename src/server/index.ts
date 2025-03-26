import { Server } from "./Server";
import { ConfigLoader } from "../config/loader";

async function startServer() {
  try {
    const config = ConfigLoader.getInstance().getConfig();
    const server = new Server(config);
    await server.start();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
