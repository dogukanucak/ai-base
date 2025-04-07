import { ConfigLoader } from "@core/config/loader";
import { TransformersEmbeddingGenerator } from "@core/embeddings/generator";
import type { Document, SearchResult } from "@core/types";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { IVectorStore } from "../interfaces/IVectorStore";

export class ChromaVectorStore implements IVectorStore {
  private vectorStore!: Chroma;
  private embeddings: TransformersEmbeddingGenerator;
  private configLoader: ConfigLoader;

  constructor() {
    this.configLoader = ConfigLoader.getInstance();
    this.embeddings = new TransformersEmbeddingGenerator();
  }

  async initialize(reset = false): Promise<void> {
    const config = this.configLoader.getConfig();
    if (reset || !this.vectorStore) {
      try {
        this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
          collectionName: config.vectorStore.collectionName,
          url: config.vectorStore.url,
        });
      } catch (error) {
        this.vectorStore = await Chroma.fromTexts([], [], this.embeddings, {
          collectionName: config.vectorStore.collectionName,
          url: config.vectorStore.url,
        });
      }
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    await this.vectorStore.addDocuments(documents);
  }

  async findSimilar(query: string, limit = 5): Promise<SearchResult[]> {
    const results = await this.vectorStore.similaritySearchWithScore(query, limit);
    return results.map(([doc, score]) => ({
      document: doc,
      score: score,
    }));
  }

  async clear(): Promise<void> {
    await this.initialize(true);
  }
}
