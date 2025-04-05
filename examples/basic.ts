import { RAGSystem } from "../src";
import { DocumentLoaderFactory } from "../src/factory/documentLoaderFactory";

async function example() {
  // Create a RAG system with default configuration
  const rag = new RAGSystem();

  // Clear existing documents
  await rag.clearDocuments();

  // Load documents
  const loader = DocumentLoaderFactory.create({type: "markdown", path: "docs", enabled: true});
  const documents = await loader.load();
  console.log(`Found ${documents.length} documents`);

  // Add documents to RAG system
  await rag.loadMarkdownDocuments("docs");

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
      console.log(`Document: ${result.document.id}\n`);
      console.log("Content:");
      console.log("--------");
      console.log(result.document.content);
      console.log("--------\n");
    }
  }
}

example().catch(console.error);
