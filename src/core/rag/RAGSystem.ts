import { ConfigLoader } from "@core/config/loader";
import { DocumentLoaderFactory } from "@core/factory/documentLoaderFactory";
import type { Document, SearchResult } from "@core/types";
import dotenv from "dotenv";
import { ChromaVectorStore } from "./services/ChromaVectorStore";
import { DocumentProcessor } from "./services/DocumentProcessor";
import { SearchService } from "./services/SearchService";

export class RAGSystem {
  private vectorStore: ChromaVectorStore;
  private documentProcessor: DocumentProcessor;
  private searchService: SearchService;
  private configLoader: ConfigLoader;

  constructor() {
    dotenv.config();
    this.configLoader = ConfigLoader.getInstance();
    this.vectorStore = new ChromaVectorStore();
    this.documentProcessor = new DocumentProcessor();
    this.searchService = new SearchService(this.vectorStore);
  }

  async addDocuments(documents: Document[]): Promise<void> {
    try {
      await this.vectorStore.initialize();
      const processedDocs = await this.documentProcessor.splitDocuments(documents);
      await this.vectorStore.addDocuments(processedDocs);
    } catch (error) {
      console.error("Failed to add documents:", error);
      throw error;
    }
  }

  async loadDocuments(path: string): Promise<Document[]> {
    const config = {
      ...this.configLoader.getConfig().documentLoader,
      path,
    };
    const documentLoader = DocumentLoaderFactory.create(config);
    const docs = await documentLoader.load();
    return docs.map((doc: Document) => this.documentProcessor.convertFromLangChainDoc(doc));
  }

  async findSimilarDocuments(query: string, limit = 5): Promise<SearchResult[]> {
    try {
      await this.vectorStore.initialize();
      return await this.searchService.search(query, limit);
    } catch (error) {
      console.error("Failed to find similar documents:", error);
      throw error;
    }
  }

  async clearDocuments(): Promise<void> {
    await this.vectorStore.clear();
  }

  setSimilarityThreshold(threshold: number): void {
    this.searchService.setSimilarityThreshold(threshold);
  }
}
