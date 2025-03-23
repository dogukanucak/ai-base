import { RAGSystem } from "../src";
import { OpenAIClient } from "../src/ai/openAIClient";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function example() {
  // Initialize RAG system
  const rag = new RAGSystem();

  // Initialize OpenAI client
  const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY || "",
    temperature: 0.7, // Controls randomness (0 = deterministic, 1 = creative)
  });

  // Load documents
  //await rag.loadMarkdownDocuments("docs");

  // "How should I start investing my money?",
  // "What's the most important thing to remember about kitchen safety?",
  // Example queries
  const queries = ["What are the key components of artificial intelligence? And tell me about Ethical Considerations about it"];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);

    // Get relevant documents
    const searchResults = await rag.findSimilarDocuments(query, 1); // Get top 2 relevant docs

    // Get AI response with context
    const response = await openai.getResponse(query, searchResults);

    console.log("\nRelevant Documents:");
    searchResults.forEach((result, index) => {
      console.log(`\n[${index + 1}] Similarity: ${result.score.toFixed(2)}`);
      console.log("Excerpt:", result.document.content.substring(0, 150) + "...");
    });

    console.log("\nAI Response:");
    console.log(response);
    console.log("\n---");
  }
}

// Run the example
example().catch(console.error);
