import { OpenAIClient } from "../src/ai/openAIClient";
import { ConfigLoader } from "../src/config/loader";
import { FlowBuilder, type RAGState } from "../src/flow/base";
import { AIResponseNode, DocumentLoadingNode, DocumentRetrievalNode } from "../src/flow/nodes";
import { RAGSystem } from "../src/rag";

async function example() {
  // Initialize components
  const config = ConfigLoader.getInstance();
  config.loadFromEnv();

  const rag = new RAGSystem();
  const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY || "",
    model: config.getConfig().openAI.model,
    maxTokens: config.getConfig().openAI.maxTokens,
    temperature: config.getConfig().openAI.temperature,
  });

  // Create a RAG flow with AI
  const flow = new FlowBuilder<RAGState>()
    .addNode("load", new DocumentLoadingNode(rag, "docs"))
    .addNode("retrieve", new DocumentRetrievalNode(rag))
    .addNode("generate", new AIResponseNode(openai));

  // Use the flow
  const result = await flow.execute({
    query: "What are the key components of artificial intelligence?",
    searchResults: [],
    aiResponse: undefined,
  });

  console.log("Query:", result.query);
  console.log("\nAI Response:", result.aiResponse);
  console.log("\nBased on documents:", result.searchResults?.length || 0);
}

example().catch(console.error);
