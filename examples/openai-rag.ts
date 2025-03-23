import { RAGSystem } from "../src";
import { OpenAIClient } from "../src/ai/openAIClient";
import { ConfigLoader } from "../src/config/loader";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

async function example() {
  // Initialize configuration
  const config = ConfigLoader.getInstance();

  // Load config from file if it exists
  const configPath = path.join(__dirname, "../config.json");
  config.loadFromFile(configPath);

  // Load config from environment variables (will override file config)
  config.loadFromEnv();

  const currentConfig = config.getConfig();

  // Initialize RAG system with configuration
  const rag = new RAGSystem();

  // Initialize OpenAI client with configuration
  const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY || "",
    model: currentConfig.openAI.model,
    maxTokens: currentConfig.openAI.maxTokens,
    temperature: currentConfig.openAI.temperature,
  });

  // Load documents if enabled
  if (currentConfig.documentLoader.enabled) {
    await rag.loadMarkdownDocuments(currentConfig.documentLoader.path);
  }

  // Example queries
  const queries = ["What are the key components of artificial intelligence? And tell me about Ethical Considerations about it"];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);

    // Get relevant documents
    const searchResults = await rag.findSimilarDocuments(query, 1);

    // Get AI response with context if OpenAI is enabled
    console.log("OpenAI is enabled:", currentConfig.openAI.enabled);
    if (currentConfig.openAI.enabled) {
      const response = await openai.getResponse(query, searchResults);

      if (currentConfig.console.showDebugInfo) {
        console.log("\nRelevant Documents:");
        searchResults.forEach((result, index) => {
          console.log(`\n[${index + 1}] Similarity: ${result.score.toFixed(2)}`);
          const content = currentConfig.console.truncateDocuments
            ? result.document.content.substring(0, currentConfig.console.documentPreviewLength) + "..."
            : result.document.content;
          console.log("Excerpt:", content);
        });
      }

      console.log("\nAI Response:");
      const truncatedResponse =
        currentConfig.console.maxResponseLength > 0
          ? response.substring(0, currentConfig.console.maxResponseLength) + (response.length > currentConfig.console.maxResponseLength ? "..." : "")
          : response;
      console.log(truncatedResponse);
    } else {
      console.log("\nRelevant Documents:");
      searchResults.forEach((result, index) => {
        console.log(`\n[${index + 1}] Similarity: ${result.score.toFixed(2)}`);
        const content = currentConfig.console.truncateDocuments
          ? result.document.content.substring(0, currentConfig.console.documentPreviewLength) + "..."
          : result.document.content;
        console.log("Content:", content);
      });
    }
    console.log("\n---");
  }
}

// Run the example
example().catch(console.error);
