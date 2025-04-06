import type { Document as LangChainDocument } from "@langchain/core/documents";
import type { Document } from "../../types";

export interface IDocumentProcessor {
  splitDocuments(documents: Document[]): Promise<Document[]>;
  convertToLangChainDoc(doc: Document): LangChainDocument;
  convertFromLangChainDoc(doc: LangChainDocument, score?: number): Document;
}
