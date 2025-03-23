import { ChromaClient, Collection, IncludeEnum } from "chromadb";
import { Document, SearchResult, VectorStore } from "../types";
import path from "path";

export class ChromaVectorStore implements VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private collectionName: string;
  private similarityThreshold: number;

  constructor(collectionName: string = "ai_base", similarityThreshold: number = 0.6) {
    this.client = new ChromaClient({
      path: "http://localhost:8000",
    });
    this.collectionName = collectionName;
    this.similarityThreshold = similarityThreshold;
  }

  private async ensureCollection() {
    if (!this.collection) {
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: this.collectionName,
          metadata: {
            "hnsw:space": "cosine",
          },
        });
      } catch (error) {
        throw error;
      }
    }
  }

  async add(document: Document, vector: number[]): Promise<void> {
    await this.ensureCollection();

    try {
      const cleanId = document.id.replace(/\.\./g, "").replace(/[\\\/]/g, "_");
      await this.collection!.add({
        ids: [cleanId],
        embeddings: [vector],
        metadatas: [
          {
            ...document.metadata,
            content: document.content,
            original_id: document.id,
          },
        ],
        documents: [document.content],
      });
    } catch (error) {
      throw error;
    }
  }

  async search(queryVector: number[], limit: number): Promise<SearchResult[]> {
    await this.ensureCollection();

    try {
      const results = await this.collection!.query({
        queryEmbeddings: [queryVector],
        nResults: limit,
        include: [IncludeEnum.Metadatas, IncludeEnum.Distances, IncludeEnum.Documents],
      });

      if (!results.ids.length) {
        return [];
      }

      const searchResults: SearchResult[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        const metadata = results.metadatas?.[0][i];
        const distance = results.distances?.[0][i] ?? 0;
        const content = results.documents?.[0][i];

        if (!metadata || !content) {
          continue;
        }

        const similarity = 1 - distance / 2;

        if (similarity >= this.similarityThreshold) {
          const document: Document = {
            id: String(metadata.original_id || results.ids[0][i]),
            content: content,
            metadata: { ...metadata, content: undefined, original_id: undefined },
          };

          searchResults.push({
            document,
            score: similarity,
          });
        }
      }

      return searchResults;
    } catch (error) {
      throw error;
    }
  }

  async load(): Promise<void> {
    await this.ensureCollection();
  }

  async clear(): Promise<void> {
    // No-op as per discussion - DB clearing will be handled manually
    return;
  }

  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = threshold;
  }
}
