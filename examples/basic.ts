import { RAGSystem } from "../src";

async function example() {
  // Create a RAG system with default configuration
  const rag = new RAGSystem();
  await rag.loadMarkdownDocuments("docs");

  const queries = ["Dogs are incredible companions that have been"];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);
    console.log("Results:\n");
    const results = await rag.findSimilarDocuments(query);
    for (const result of results) {
      console.log(`Similarity: ${result.score.toFixed(4)}`);
      console.log("Content:", result.document.content);
      console.log("\n");
    }
  }
}

example().catch(console.error);
