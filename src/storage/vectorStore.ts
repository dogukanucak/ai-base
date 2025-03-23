import { writeFile, readFile, mkdir } from "fs/promises";
import { Document, SearchResult, VectorStore } from "../types";
import path from "path";

interface StoredItem {
  document: Document;
  vector: number[];
}

export class SimpleVectorStore implements VectorStore {
  private items: StoredItem[] = [];
  private storePath: string;
  private similarityThreshold: number;

  constructor(storePath: string = "data/vectors.json", similarityThreshold: number = 0.7) {
    this.storePath = storePath;
    this.similarityThreshold = similarityThreshold;
  }

  async add(document: Document, vector: number[]): Promise<void> {
    // Check if a document with the same content already exists
    const exists = this.items.some((item) => item.document.content === document.content);

    if (!exists) {
      this.items.push({ document, vector });
    }
  }

  async search(queryVector: number[], limit: number): Promise<SearchResult[]> {
    const results = this.items
      .map((item) => ({
        document: item.document,
        score: this.cosineSimilarity(queryVector, item.vector),
      }))
      .filter((result) => result.score >= this.similarityThreshold) // Only keep documents above threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  async save(): Promise<void> {
    const dir = path.dirname(this.storePath);
    await mkdir(dir, { recursive: true });
    await writeFile(this.storePath, JSON.stringify(this.items, null, 2));
  }

  async load(): Promise<void> {
    try {
      const content = await readFile(this.storePath, "utf-8");
      this.items = JSON.parse(content);
    } catch (error) {
      this.items = [];
    }
  }

  // Add method to clear all documents
  async clear(): Promise<void> {
    this.items = [];
    await this.save();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Method to adjust similarity threshold
  setSimilarityThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error("Similarity threshold must be between 0 and 1");
    }
    this.similarityThreshold = threshold;
  }
}
