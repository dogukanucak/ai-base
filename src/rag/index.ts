import { Document as LangChainDocument } from "@langchain/core/documents";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document, SearchResult } from "../types";
import { TransformersEmbeddingGenerator } from "../embeddings/generator";
import { MarkdownLoader } from "../documents/loader";
import dotenv from "dotenv";

export class RAGSystem {
  private embeddings: TransformersEmbeddingGenerator;
  private vectorStore!: Chroma;
  private documentLoader: MarkdownLoader;
  private textSplitter: CharacterTextSplitter;

  constructor() {
    dotenv.config();
    this.embeddings = new TransformersEmbeddingGenerator();
    this.textSplitter = new CharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    this.documentLoader = new MarkdownLoader();
  }

  private async initVectorStore(reset: boolean = false): Promise<void> {
    try {
      if (reset || !this.vectorStore) {
        // Create a new collection
        this.vectorStore = new Chroma(this.embeddings, {
          collectionName: "ai_base",
          url: "http://localhost:8000", // Default ChromaDB server URL
        });
      }
    } catch (error) {
      console.error("Error initializing vector store:", error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    await this.initVectorStore(true);
  }

  private convertToLangChainDoc(doc: Document): LangChainDocument {
    return new LangChainDocument({
      pageContent: doc.content,
      metadata: {
        ...doc.metadata,
        id: doc.id,
      },
    });
  }

  private convertFromLangChainDoc(doc: LangChainDocument, score?: number): SearchResult {
    return {
      document: {
        id: doc.metadata?.id || "",
        content: doc.pageContent,
        metadata: { ...doc.metadata, id: undefined },
      },
      score: score || 0,
    };
  }

  async addDocuments(documents: Document[]): Promise<void> {
    try {
      await this.initVectorStore();
      const langChainDocs = documents.map((doc) => this.convertToLangChainDoc(doc));
      const splitDocs = await this.textSplitter.splitDocuments(langChainDocs);
      await this.vectorStore.addDocuments(splitDocs);
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
      await this.initVectorStore();
      const results = await this.vectorStore.similaritySearchWithScore(query, limit);
      return results.map(([doc, score]: [LangChainDocument, number]) => this.convertFromLangChainDoc(doc, score));
    } catch (error) {
      console.error("Failed to find similar documents:", error);
      throw error;
    }
  }

  async clearDocuments(): Promise<void> {
    await this.initialize();
  }

  setSimilarityThreshold(threshold: number): void {
    // Note: LangChain's Chroma implementation doesn't directly support similarity threshold
    // We'll need to filter results in the findSimilarDocuments method if needed
    console.warn("setSimilarityThreshold is not supported in LangChain implementation");
  }
}
