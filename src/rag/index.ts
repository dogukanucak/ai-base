import { EmbeddingGenerator, VectorStore, DocumentLoader, Document, SearchResult } from "../types";
import { RAGConfig } from "../config/types";
import { defaultConfig } from "../config/defaults";
import { RAGFactory } from "../factory";
import { ChromaVectorStore } from "../storage/chromaVectorStore";
import { TransformersEmbeddingGenerator } from "../embeddings/generator";
import { MarkdownLoader } from "../documents/loader";

export class RAGSystem {
  private embeddings: EmbeddingGenerator;
  private vectorStore: VectorStore;
  private documentLoader: DocumentLoader;

  constructor() {
    this.embeddings = new TransformersEmbeddingGenerator();
    this.vectorStore = new ChromaVectorStore();
    this.documentLoader = new MarkdownLoader();
  }

  async initialize(): Promise<void> {
    await this.vectorStore.clear();
  }

  async addDocuments(documents: Document[]): Promise<void> {
    try {
      for (const document of documents) {
        const vector = await this.embeddings.generateEmbedding(document.content);
        await this.vectorStore.add(document, vector);
      }
    } catch (error) {
      console.error("Failed to add documents:", error);
      throw error;
    }
  }

  async loadMarkdownDocuments(directory: string): Promise<void> {
    try {
      await this.initialize();
      const documents = await this.documentLoader.loadDocuments();
      await this.addDocuments(documents);
    } catch (error) {
      throw error;
    }
  }

  async findSimilarDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const queryVector = await this.embeddings.generateEmbedding(query);
      const results = await this.vectorStore.search(queryVector, limit);
      return results;
    } catch (error) {
      console.error("Failed to find similar documents:", error);
      throw error;
    }
  }

  async clearDocuments(): Promise<void> {
    await this.vectorStore.clear();
  }

  setSimilarityThreshold(threshold: number): void {
    if (this.vectorStore.setSimilarityThreshold) {
      this.vectorStore.setSimilarityThreshold(threshold);
    }
  }
}
