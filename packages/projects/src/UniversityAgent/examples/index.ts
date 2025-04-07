// Use the UniversityAgent to find a page

import { OpenAIClient } from "@ai-base/core/ai/openAIClient";
import { ConfigLoader } from "@ai-base/core/config/loader";
import { FlowBuilder } from "@ai-base/core/flow/base";
import {
  AIResponseNode,
  type AIResponseState,
  DocumentLoadingNode,
  DocumentRetrievalNode,
} from "@ai-base/core/flow/nodes";
import { RAGSystem } from "@ai-base/core/rag";
import dotenv from "dotenv";

async function example() {
  dotenv.config();

  // Initialize components
  const config = ConfigLoader.getInstance();
  const rag = new RAGSystem();
  const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY || "",
    model: config.getConfig().openAI.model,
    maxTokens: config.getConfig().openAI.maxTokens,
    temperature: config.getConfig().openAI.temperature,
  });

  // Create a RAG flow with AI
  const flow = new FlowBuilder<AIResponseState>()
    .addNode("load", new DocumentLoadingNode(rag, "packages/projects/src/UniversityAgent/data"))
    .addNode("retrieve", new DocumentRetrievalNode(rag))
    .addNode("generate", new AIResponseNode(openai));

  // Use the flow
  const result = (await flow.execute({
    query: "What are the admission requirements?",
    documents: [],
    results: [],
    aiResponse: undefined,
  })) as AIResponseState;

  console.log("Query:", result.query);
  console.log("\nAI Response:", result.aiResponse);
  console.log("\nBased on documents:", result.results?.length || 0);
}

example().catch(console.error);
