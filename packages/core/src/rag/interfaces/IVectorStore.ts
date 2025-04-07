import type { Document } from "../../types";
import type { SearchResult } from "../../types";

export interface IVectorStore {
  initialize(reset?: boolean): Promise<void>;
  addDocuments(documents: Document[]): Promise<void>;
  findSimilar(query: string, limit?: number): Promise<SearchResult[]>;
  clear(): Promise<void>;
}
