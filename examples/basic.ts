import { RAGSystem } from "../src";
import { RAGConfig } from "../src/config/types";

async function example() {
  // Create a RAG system with default configuration
  const config: RAGConfig = {
    embedding: { modelName: "Xenova/all-MiniLM-L6-v2" },
    chunking: { type: "character", chunkSize: 1000, chunkOverlap: 200 },
    retrieval: { type: "similarity", scoreThreshold: 0.5 },
    vectorStore: { type: "chroma", collectionName: "ai_base" },
    documentLoader: { type: "markdown", path: "docs", enabled: true },
    openAI: { model: "gpt-3.5-turbo", maxTokens: 1000, temperature: 0.7, enabled: false },
    console: { maxResponseLength: 1000, showDebugInfo: true, truncateDocuments: true, documentPreviewLength: 200 }
  };

  const rag = new RAGSystem(config);

  // Clear existing documents
  await rag.clearDocuments();

  // Load documents
  const documents = await rag.loadDocuments("docs");
  console.log(`Found ${documents.length} documents`);

  // Add documents to RAG system
  await rag.addDocuments(documents);

  const queries = ["where can I study to learn about Game development"];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);
    const results = await rag.findSimilarDocuments(query);

    if (results.length === 0) {
      console.log("No matching documents found.");
      continue;
    }

    console.log(`\nFound ${results.length} matching documents:\n`);
    for (const result of results) {
      console.log(`Similarity: ${result.score.toFixed(4)}`);
      console.log(`Document: ${result.document.metadata?.filepath || "unknown"}\n`);
      console.log("Content:");
      console.log("--------");
      console.log(result.document.pageContent);
      console.log("--------\n");
    }
  }
}

example().catch(console.error);
