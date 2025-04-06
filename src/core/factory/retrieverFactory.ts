import type { RetrievalConfig } from "@core/config/types";
import type { BaseRetriever } from "@langchain/core/retrievers";
import type { VectorStore } from "@langchain/core/vectorstores";

export class RetrieverFactory {
  static async create(vectorStore: VectorStore, config: RetrievalConfig): Promise<BaseRetriever> {
    const { type, fetchK, lambda, scoreThreshold } = config;

    switch (type) {
      case "mmr":
        return vectorStore.asRetriever({
          searchType: "mmr",
          searchKwargs: {
            fetchK: fetchK || 20,
            lambda: lambda || 0.5,
          },
        });

      case "similarity":
      default:
        return vectorStore.asRetriever({
          searchType: "similarity",
          k: fetchK || 4,
          filter: scoreThreshold ? { score: { $gte: scoreThreshold } } : undefined,
        });
    }
  }
}
