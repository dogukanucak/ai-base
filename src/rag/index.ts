import { Document as LangChainDocument } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document, SearchResult } from "../types";
import { TransformersEmbeddingGenerator } from "../embeddings/generator";
import { TextSplitterFactory } from "../factory/textSplitterFactory";
import { ConfigLoader } from "../config/loader";
import dotenv from "dotenv";
import { DocumentLoaderFactory } from "../factory/documentLoaderFactory";
import { DocumentLoaderConfig } from "../config/types";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";

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
    await this.initVectorStore(true); // Force new collection creation
  }
}
