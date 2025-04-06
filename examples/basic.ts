import { RAGSystem } from "../src/rag";
import { FlowBuilder, RAGState } from "../src/flow";
import { DocumentRetrievalNode } from "../src/flow/nodes";

async function example() {
  const rag = new RAGSystem();
  await rag.loadAndAddDocuments("docs");

  // Create a simple RAG flow without AI
  const flow = new FlowBuilder<RAGState>()
    .addNode("retrieve", new DocumentRetrievalNode(rag));

  // Use the flow
  const result = await flow.execute({
    query: "What are the key components of artificial intelligence?",
    documents: [],
    searchResults: [],
    aiResponse: undefined,
  });

  console.log("Query:", result.query);
  console.log("Found Documents:", result.searchResults.length);
  result.searchResults.forEach((doc, i) => {
    console.log(`\nDocument ${i + 1} (Score: ${doc.score}):`);
    console.log(doc.document.pageContent);
  });
}

example().catch(console.error); 