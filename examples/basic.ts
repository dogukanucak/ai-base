import { RAGSystem } from "../src/rag";
import { FlowBuilder, WebSearchNode } from "../src/flow";
import { DocumentLoadingNode, DocumentRetrievalNode, AIResponseNode } from "../src/flow/nodes";
import { WebContentLoaderNode, WebContentState } from "../src/flow/web-flows/web-content-loader-node";

async function example() {
  const rag = new RAGSystem();
  
  // Create a RAG flow with both document and web content search
  const flow = new FlowBuilder<WebContentState>()
   // .addNode("load-docs", new DocumentLoadingNode(rag, "docs"))
    .addNode("search-web", new WebSearchNode());
    
    //.addNode("retrieve", new DocumentRetrievalNode(rag));

  // Use the flow to search for content in documents and web pages
  const result = await flow.execute({
    query: "The purpose of Gastronomy and Culinary Arts program in the field of gastronomy",
    urls: [
      "https://culinary.ieu.edu.tr/en/hakkimizda",
    ],
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