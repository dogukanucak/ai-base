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
    try {
      console.log("Initializing RAG system...");
      await this.vectorStore.clear();
      console.log("Cleared existing documents.");
    } catch (error) {
      console.error("Failed to initialize RAG system:", error);
      throw error;
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    try {
      console.log(`Adding ${documents.length} documents...`);
      for (const document of documents) {
        console.log(`Processing document: ${document.id}`);
        const vector = await this.embeddings.generateEmbedding(document.content);
        await this.vectorStore.add(document, vector);
      }
      console.log("Finished adding documents.");
    } catch (error) {
      console.error("Failed to add documents:", error);
      throw error;
    }
  }

  async loadMarkdownDocuments(directory: string): Promise<void> {
    try {
      console.log(`Loading markdown documents from ${directory}...`);
      await this.initialize(); // Clear existing documents first
      const documents = await this.documentLoader.loadDocuments();
      console.log(`Found ${documents.length} documents to process.`);
      await this.addDocuments(documents);
    } catch (error) {
      console.error("Failed to load markdown documents:", error);
      throw error;
    }
  }

  async findSimilarDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      console.log(`Searching for documents similar to: "${query}"`);
      const queryVector = await this.embeddings.generateEmbedding(query);
      const results = await this.vectorStore.search(queryVector, limit);
      console.log(`Found ${results.length} similar documents.`);
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
