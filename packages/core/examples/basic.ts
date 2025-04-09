import { FlowBuilder } from "../src/flow/base";
import { DocumentLoadingNode, DocumentRetrievalNode } from "../src/flow/nodes";
import { RAGSystem } from "../src/rag";
import type { Document } from "@langchain/core/documents";
import type { SearchResult } from "../src/types";

interface QueryState {
  query: string;
  documents: Document[];
  results?: SearchResult[];
}

async function example() {
  const rag = new RAGSystem();

  // Create a flow that loads documents and performs search
  const flow = new FlowBuilder<QueryState>()
    .addNode("load-docs", new DocumentLoadingNode(rag, "docs"))
    .addNode("search", new DocumentRetrievalNode(rag));

  // Execute the flow with the query
  const result = await flow.execute({
    query:
      "Explain the core principles of microservices architecture and why they are important for modern software development.",
    documents: [],
  });

  // Debug: Print loaded documents
  console.log("\nLoaded Documents:");
  for (const doc of result.documents) {
    console.log("- Source:", doc.metadata?.source);
  }

  // Print search results
  console.log("\nQuery:", result.query);
  console.log("Found Documents:", result.results?.length || 0);
  for (const [i, doc] of (result.results || []).entries()) {
    console.log(`\nDocument ${i + 1} (Score: ${doc.score}):`);
    console.log("Source:", doc.document.metadata.source);
    console.log("Type:", doc.document.metadata.type);
    console.log("Content:", doc.document.pageContent);
  }
}

example().catch(console.error);
