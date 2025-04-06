import { RAGSystem } from "../src";

async function example() {
  const rag = new RAGSystem();

  // Clear existing documents
  await rag.clearDocuments();
  console.log("Cleared existing documents");

  // Load and add documents in one step
  const documentCount = await rag.loadAndAddDocuments("docs");
  if (documentCount === 0) {
    console.log("No documents were loaded. Exiting...");
    return;
  }

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
