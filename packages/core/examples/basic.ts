import { FlowBuilder } from "../src/flow/base";
import { DocumentLoadingNode } from "../src/flow/nodes";
import { RAGSystem } from "../src/rag";
import type { Document } from "@langchain/core/documents";

async function example() {
  const rag = new RAGSystem();

  // Create a simple flow that just loads and searches documents
  const flow = new FlowBuilder<{ query: string; documents: Document[] }>().addNode(
    "load-docs",
    new DocumentLoadingNode(rag, "docs"),
  );

  // Load documents first
  const loadResult = await flow.execute({
    query: "",
    documents: [],
  });

  // Debug: Print loaded documents
  console.log("\nLoaded Documents:");
  for (const doc of loadResult.documents) {
    console.log("- Source:", doc.metadata?.source);
  }

  // Now search for content in documents
  const results = await rag.findSimilarDocuments(
    "Explain the core principles of microservices architecture and why they are important for modern software development.",
    5,
  );

  console.log(
    "\nQuery:",
    "Explain the core principles of microservices architecture and why they are important for modern software development.",
  );
  console.log("Found Documents:", results.length);
  for (const [i, doc] of results.entries()) {
    console.log(`\nDocument ${i + 1} (Score: ${doc.score}):`);
    console.log("Source:", doc.document.metadata.source);
    console.log("Type:", doc.document.metadata.type);
    console.log("Content:", doc.document.pageContent);
  }
}

example().catch(console.error);
