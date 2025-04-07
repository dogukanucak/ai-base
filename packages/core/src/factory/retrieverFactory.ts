import type { BaseRetriever } from "@langchain/core/retrievers";
import type { VectorStore } from "@langchain/core/vectorstores";
import type { RetrievalConfig } from "../config/types";

export async function createRetriever(
  vectorStore: VectorStore,
  config: RetrievalConfig,
): Promise<BaseRetriever> {
  const { searchType, fetchK, scoreThreshold } = config;

  if (searchType === "mmr") {
    return vectorStore.asRetriever({
      searchType: "mmr",
      k: fetchK || 4,
      fetchK: (fetchK || 4) * 2,
      lambda: 0.5,
      filter: scoreThreshold ? { score: { $gte: scoreThreshold } } : undefined,
    });
  }

  return vectorStore.asRetriever({
    searchType: "similarity",
    k: fetchK || 4,
    filter: scoreThreshold ? { score: { $gte: scoreThreshold } } : undefined,
  });
}
