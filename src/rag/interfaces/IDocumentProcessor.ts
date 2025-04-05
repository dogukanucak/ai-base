import { Document } from "../../types";
import { Document as LangChainDocument } from "@langchain/core/documents";

export interface IDocumentProcessor {
  splitDocuments(documents: Document[]): Promise<Document[]>;
  convertToLangChainDoc(doc: Document): LangChainDocument;
  convertFromLangChainDoc(doc: LangChainDocument, score?: number): Document;
}
