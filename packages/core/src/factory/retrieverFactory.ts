import type { BaseRetriever } from "@langchain/core/retrievers";
import type { VectorStore } from "@langchain/core/vectorstores";
import type { RetrievalConfig } from "../config/types";

export async function createRetriever(
  vectorStore: VectorStore,
  config: RetrievalConfig,
): Promise<BaseRetriever> {
  const { type, fetchK, scoreThreshold } = config;

  if (type === "mmr") {
    return vectorStore.asRetriever({
      searchType: "mmr",
      k: fetchK || 4,
      filter: scoreThreshold ? { score: { $gte: scoreThreshold } } : undefined,
    });
  }

  return vectorStore.asRetriever({
    searchType: "similarity",
    k: fetchK || 4,
    filter: scoreThreshold ? { score: { $gte: scoreThreshold } } : undefined,
  });
}
