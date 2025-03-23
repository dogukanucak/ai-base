import { ChromaClient, Collection, IncludeEnum } from "chromadb";
import { Document, SearchResult, VectorStore } from "../types";
import path from "path";

interface CollectionInfo {
  name: string;
  metadata?: Record<string, any>;
}

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
        console.log(`Creating/getting collection: ${this.collectionName}`);
        this.collection = await this.client.getOrCreateCollection({
          name: this.collectionName,
          metadata: {
            "hnsw:space": "cosine",
          },
        });
        console.log("Collection ready.");
      } catch (error) {
        console.error("Failed to connect to ChromaDB:", error);
        throw error;
      }
    }
  }

  async add(document: Document, vector: number[]): Promise<void> {
    await this.ensureCollection();

    try {
      // Clean up the document ID to ensure it's valid
      const cleanId = document.id.replace(/\.\./g, "").replace(/[\\\/]/g, "_");

      // Check if document already exists
      const existingDocs = await this.collection!.get({
        ids: [cleanId],
        include: [IncludeEnum.Metadatas],
      });

      if (!existingDocs.ids.length) {
        console.log(`Adding document with ID: ${cleanId}`);
        await this.collection!.add({
          ids: [cleanId],
          embeddings: [vector],
          metadatas: [
            {
              ...document.metadata,
              content: document.content,
              original_id: document.id, // Store original ID in metadata
            },
          ],
          documents: [document.content],
        });
        console.log(`Successfully added document: ${cleanId}`);
      } else {
        console.log(`Document ${cleanId} already exists, skipping...`);
      }
    } catch (error) {
      console.error(`Failed to add document ${document.id}:`, error);
      throw error;
    }
  }

  async search(queryVector: number[], limit: number): Promise<SearchResult[]> {
    await this.ensureCollection();

    try {
      console.log(`Searching with limit: ${limit}`);
      const results = await this.collection!.query({
        queryEmbeddings: [queryVector],
        nResults: limit,
        include: [IncludeEnum.Metadatas, IncludeEnum.Distances, IncludeEnum.Documents],
      });

      if (!results.ids.length) {
        console.log("No results found.");
        return [];
      }

      const searchResults: SearchResult[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        const metadata = results.metadatas?.[0][i];
        const distance = results.distances?.[0][i] ?? 0;
        const content = results.documents?.[0][i];

        if (!metadata || !content) {
          console.log(`Skipping result ${i} due to missing metadata or content`);
          continue;
        }

        const similarity = 1 - distance / 2;

        if (similarity >= this.similarityThreshold) {
          const document: Document = {
            id: String(metadata.original_id || results.ids[0][i]), // Ensure ID is a string
            content: content,
            metadata: { ...metadata, content: undefined, original_id: undefined },
          };

          searchResults.push({
            document,
            score: similarity,
          });
          console.log(`Found document ${document.id} with similarity ${similarity.toFixed(4)}`);
        } else {
          console.log(`Skipping document ${results.ids[0][i]} due to low similarity: ${similarity.toFixed(4)}`);
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
      // Try to delete the collection directly
      console.log(`Attempting to delete collection: ${this.collectionName}`);
      await this.client.deleteCollection({
        name: this.collectionName,
      });
      console.log("Collection deleted successfully.");
      this.collection = null;
    } catch (error) {
      // If the collection doesn't exist, that's fine - we wanted to clear it anyway
      if (error instanceof Error && error.message.includes("does not exist")) {
        console.log(`Collection ${this.collectionName} does not exist, nothing to clear.`);
        this.collection = null;
        return;
      }
      // For other errors, log and rethrow
      console.error("Failed to clear ChromaDB collection:", error);
      throw error;
    }
  }

  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = threshold;
    console.log(`Set similarity threshold to: ${threshold}`);
  }
}
