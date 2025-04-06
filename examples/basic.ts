import { RAGSystem } from "../src/rag";
import { FlowBuilder, RAGState } from "../src/flow";
import { DocumentLoadingNode, DocumentRetrievalNode, AIResponseNode } from "../src/flow/nodes";

async function example() {
  const rag = new RAGSystem();
  
  // Load documents from the docs directory (will include both markdown and PDF files)
  await rag.loadAndAddDocuments("docs");

  // Create a simple RAG flow
  const flow = new FlowBuilder<RAGState>()
    .addNode("load", new DocumentLoadingNode(rag, "docs"))
    .addNode("retrieve", new DocumentRetrievalNode(rag));

  // Use the flow to search for content in both markdown and PDF files
  const result = await flow.execute({
    query: "What information is stored in the PDF?",
    aiResponse: undefined
  });

  console.log("Query:", result.query);
  console.log("Found Documents:", result.searchResults?.length || 0);
  result.searchResults?.forEach((doc, i) => {
    console.log(`\nDocument ${i + 1} (Score: ${doc.score}):`);
    console.log("Source:", doc.document.metadata.source);
    console.log("Type:", doc.document.metadata.type);
    console.log("Content:", doc.document.pageContent);
  });
}

example().catch(console.error); 