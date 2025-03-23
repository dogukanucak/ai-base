import { RAGSystem } from "../src";

async function example() {
  // Create a RAG system with default configuration
  const rag = new RAGSystem();
  // await rag.loadMarkdownDocuments("docs");

  const queries = ["I am not sure about how to invest my money"];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);
    console.log("Results:\n");
    const results = await rag.findSimilarDocuments(query);
    for (const result of results) {
      console.log(`Similarity: ${result.score.toFixed(4)}`);
      console.log("Content:", result.document.id);
      console.log("\n");
    }
  }
}

example().catch(console.error);
