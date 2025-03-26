import { Document as LangChainDocument } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document, SearchResult } from "../types";
import { TransformersEmbeddingGenerator } from "../embeddings/generator";
import { MarkdownLoader } from "../documents/loader";
import { TextSplitterFactory } from "../factory/textSplitterFactory";
import { ConfigLoader } from "../config/loader";
import dotenv from "dotenv";

export class RAGSystem {
  private embeddings: TransformersEmbeddingGenerator;
  private vectorStore!: Chroma;
  private documentLoader: MarkdownLoader;
  private configLoader: ConfigLoader;

  constructor() {
    dotenv.config();
    this.embeddings = new TransformersEmbeddingGenerator();
    this.documentLoader = new MarkdownLoader();
    this.configLoader = ConfigLoader.getInstance();
  }

  private async initVectorStore(reset: boolean = false): Promise<void> {
    const config = this.configLoader.getConfig();
    if (reset || !this.vectorStore) {
      try {
        this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
          collectionName: config.vectorStore.collectionName,
          url: config.vectorStore.url,
        });
      } catch (error) {
        // If collection doesn't exist or error occurs, create a new one
        this.vectorStore = await Chroma.fromTexts([], [], this.embeddings, {
          collectionName: config.vectorStore.collectionName,
          url: config.vectorStore.url,
        });
      }
    }
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
      const config = this.configLoader.getConfig();
      const textSplitter = TextSplitterFactory.create(config.chunking);
      const langChainDocs = documents.map((doc) => this.convertToLangChainDoc(doc));
      const splitDocs = await textSplitter.splitDocuments(langChainDocs);
      await this.vectorStore.addDocuments(splitDocs);
    } catch (error) {
      console.error("Failed to add documents:", error);
      throw error;
    }
  }

  async loadMarkdownDocuments(path?: string): Promise<void> {
    try {
      this.documentLoader = new MarkdownLoader(path);
      const documents = await this.documentLoader.loadDocuments();
      await this.clearDocuments(); // Clear existing documents before loading new ones
      await this.addDocuments(documents);
    } catch (error) {
      console.error("Failed to load markdown documents:", error);
      throw error;
    }
  }

  async findSimilarDocuments(query: string, limit = 5): Promise<SearchResult[]> {
    try {
      await this.initVectorStore();
      const config = this.configLoader.getConfig();
      const results = await this.vectorStore.similaritySearchWithScore(query, limit * 2);

      // Convert results and filter by score threshold
      const scoreThreshold = config.retrieval.scoreThreshold || 0.5;
      const filteredResults = results
        .map(([doc, score]) => this.convertFromLangChainDoc(doc, score))
        .filter((result) => result.score >= scoreThreshold);

      // Sort by score in descending order
      filteredResults.sort((a, b) => b.score - a.score);

      // Remove duplicates based on content similarity
      const uniqueResults: SearchResult[] = [];
      const seenContent = new Set<string>();

      for (const result of filteredResults) {
        const content = result.document.content.trim();
        if (!seenContent.has(content)) {
          seenContent.add(content);
          uniqueResults.push(result);
          if (uniqueResults.length >= limit) break;
        }
      }

      return uniqueResults;
    } catch (error) {
      console.error("Failed to find similar documents:", error);
      throw error;
    }
  }

  async clearDocuments(): Promise<void> {
    await this.initVectorStore(true); // Force new collection creation
  }

  setSimilarityThreshold(threshold: number): void {
    // Note: LangChain's Chroma implementation doesn't directly support similarity threshold
    // We'll need to filter results in the findSimilarDocuments method if needed
    console.warn("setSimilarityThreshold is not supported in LangChain implementation");
  }
}
