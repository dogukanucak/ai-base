import { RAGSystem } from "@core/rag";
import { FlowBuilder } from "@core/flow/base";
import { DocumentLoadingNode, CombineResultsNode } from "@core/flow/nodes";
import { WebSearchNode, WebSearchState } from "@core/flow/web-flows";

async function example() {
  const rag = new RAGSystem();
  
  // Create a RAG flow with both document and web content search
  const flow = new FlowBuilder<WebSearchState>()
    .addNode("load-docs", new DocumentLoadingNode(rag, "docs"))
    .addNode("search-web", new WebSearchNode())
    .addNode("combine-results", new CombineResultsNode(rag));

  // Use the flow to search for content in documents and web pages
  const result = await flow.execute({
    query: "Culinary Arts",
    urls: [
      "https://culinary.ieu.edu.tr/en/hakkimizda",
    ],
    searchResults: undefined,
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