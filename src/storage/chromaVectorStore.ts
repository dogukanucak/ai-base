import { ChromaClient, Collection, IncludeEnum } from "chromadb";
import { Document, SearchResult, VectorStore } from "../types";
import path from "path";

export class ChromaVectorStore implements VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private collectionName: string;
  private similarityThreshold: number;

  constructor(collectionName: string = "ai_base", similarityThreshold: number = 0.7) {
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
            "hnsw:space": "cosine", // Use cosine similarity
          },
        });
      } catch (error) {
        console.error("Failed to connect to ChromaDB:", error);
        throw error;
      }
    }
  }

  async add(document: Document, vector: number[]): Promise<void> {
    await this.ensureCollection();

    try {
      // Add document to collection
      await this.collection!.add({
        ids: [document.id],
        embeddings: [vector],
        metadatas: [
          {
            ...document.metadata,
            content: document.content,
          },
        ],
        documents: [document.content], // Store the document content directly
      });
    } catch (error) {
      console.error("Failed to add document to ChromaDB:", error);
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

        // Skip if we don't have valid content
        if (!metadata || !content) {
          continue;
        }

        // Convert distance to similarity score (1 - normalized_distance)
        const similarity = 1 - distance / 2; // ChromaDB uses cosine distance which ranges from 0 to 2

        if (similarity >= this.similarityThreshold) {
          const document: Document = {
            id: results.ids[0][i],
            content: content,
            metadata: { ...metadata, content: undefined },
          };

          searchResults.push({
            document,
            score: similarity,
          });
        }
      }

      return searchResults;
    } catch (error) {
      console.error("Failed to search ChromaDB:", error);
      throw error;
    }
  }

  async load(): Promise<void> {
    await this.ensureCollection();
  }

  async clear(): Promise<void> {
    try {
      // Delete the old collection if it exists
      await this.client.deleteCollection({
        name: this.collectionName,
      });

      // Reset collection reference
      this.collection = null;

      // Create a new collection
      await this.ensureCollection();
    } catch (error) {
      console.error("Failed to clear ChromaDB collection:", error);
      throw error;
    }
  }

  setSimilarityThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error("Similarity threshold must be between 0 and 1");
    }
    this.similarityThreshold = threshold;
  }
}
