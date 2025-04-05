import { Document } from "../../types";
import { SearchResult } from "../../types";

export interface IVectorStore {
  initialize(reset?: boolean): Promise<void>;
  addDocuments(documents: Document[]): Promise<void>;
  findSimilar(query: string, limit?: number): Promise<SearchResult[]>;
  clear(): Promise<void>;
}
