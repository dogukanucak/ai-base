import { Document as LangChainDocument } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document, SearchResult } from "@core/types";
import { TransformersEmbeddingGenerator } from "@core/embeddings/generator";
import { TextSplitterFactory } from "@core/factory/textSplitterFactory";
import { ConfigLoader } from "@core/config/loader";
import dotenv from "dotenv";
import { DocumentLoaderFactory } from "@core/factory/documentLoaderFactory";
import { DocumentLoaderConfig } from "@core/config/types";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { RAGSystem } from "./RAGSystem";

export class RAGSystem {
  private embeddings: TransformersEmbeddingGenerator;
  private vectorStore!: Chroma;
  private documentLoader: BaseDocumentLoader;
  private configLoader: ConfigLoader;

  constructor() {
    dotenv.config();
    this.configLoader = ConfigLoader.getInstance();
    const config = this.configLoader.getConfig();
    this.embeddings = new TransformersEmbeddingGenerator();
    this.documentLoader = DocumentLoaderFactory.create(config.documentLoader);
    
    if (config.documentLoader.enabled) {
      this.initializeDocuments().catch(console.error);
    }
  }

  private async initializeDocuments(): Promise<void> {
    try {
      const config = this.configLoader.getConfig();
      const documents = await this.loadDocuments(config.documentLoader.path);
      if (documents.length > 0) {
        await this.addDocuments(documents);
      }
    } catch (error) {
      console.error("Error initializing documents:", error);
      throw error;
    }
  }

  private async initVectorStore(reset: boolean = false): Promise<void> {
    const config = this.configLoader.getConfig();
    try {
      if (reset || !this.vectorStore) {
        this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
          collectionName: config.vectorStore.collectionName,
          url: config.vectorStore.url,
        });
      }
    } catch (error) {
      this.vectorStore = await Chroma.fromTexts([], [], this.embeddings, {
        collectionName: config.vectorStore.collectionName,
        url: config.vectorStore.url,
      });
    }
  }

  private convertToLangChainDoc(doc: Document): LangChainDocument {
    return new LangChainDocument({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    });
  }

  private convertFromLangChainDoc(doc: LangChainDocument, score?: number): SearchResult {
    return {
      document: doc,
      score: score || 0,
    };
  }

  async addDocuments(documents: Document[]): Promise<void> {
    if (!documents.length) return;
    
    await this.initVectorStore();
    const config = this.configLoader.getConfig();
    const textSplitter = TextSplitterFactory.create(config.chunking);
    const langChainDocs = documents.map((doc) => this.convertToLangChainDoc(doc));
    const splitDocs = await textSplitter.splitDocuments(langChainDocs);
    await this.vectorStore.addDocuments(splitDocs);
  }

  async loadDocuments(path: string): Promise<LangChainDocument[]> {
    const loaderConfig: DocumentLoaderConfig = {
      ...this.configLoader.getConfig().documentLoader,
      path
    };
    this.documentLoader = DocumentLoaderFactory.create(loaderConfig);
    return await this.documentLoader.load();
  }

  async findSimilarDocuments(query: string, limit = 5): Promise<SearchResult[]> {
    await this.initVectorStore();
    const config = this.configLoader.getConfig();
    const results = await this.vectorStore.similaritySearchWithScore(query, limit * 2);

    const scoreThreshold = config.retrieval.scoreThreshold || 0.5;
    const filteredResults = results
      .map(([doc, score]) => this.convertFromLangChainDoc(doc, score))
      .filter((result) => result.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score);

    return this.removeDuplicateResults(filteredResults, limit);
  }

  private removeDuplicateResults(results: SearchResult[], limit: number): SearchResult[] {
    const uniqueResults: SearchResult[] = [];
    const seenContent = new Set<string>();

    for (const result of results) {
      const content = result.document.pageContent.trim();
      if (!seenContent.has(content)) {
        seenContent.add(content);
        uniqueResults.push(result);
        if (uniqueResults.length >= limit) break;
      }
    }

    return uniqueResults;
  }

  async clearDocuments(): Promise<void> {
    await this.initVectorStore(true);
  }

  async loadAndAddDocuments(path: string): Promise<number> {
    const documents = await this.loadDocuments(path);
    if (documents.length > 0) {
      await this.addDocuments(documents);
    }
    return documents.length;
  }
}
