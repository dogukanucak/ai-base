import { ConfigLoader } from "@core/config/loader";
import { createTextSplitter } from "@core/factory/textSplitterFactory";
import type { Document } from "@core/types";
import { Document as LangChainDocument } from "@langchain/core/documents";
import type { IDocumentProcessor } from "../interfaces/IDocumentProcessor";

export class DocumentProcessor implements IDocumentProcessor {
  private configLoader: ConfigLoader;

  constructor() {
    this.configLoader = ConfigLoader.getInstance();
  }

  async splitDocuments(documents: Document[]): Promise<Document[]> {
    const config = this.configLoader.getConfig();
    const textSplitter = createTextSplitter(config.chunking);
    const langChainDocs = documents.map((doc) => this.convertToLangChainDoc(doc));
    const splitDocs = await textSplitter.splitDocuments(langChainDocs);
    return splitDocs.map((doc) => this.convertFromLangChainDoc(doc));
  }

  convertToLangChainDoc(doc: Document): LangChainDocument {
    return new LangChainDocument({
      pageContent: doc.pageContent,
      metadata: doc.metadata || {},
    });
  }

  convertFromLangChainDoc(doc: LangChainDocument): Document {
    return {
      pageContent: doc.pageContent,
      metadata: doc.metadata || {},
    };
  }
}
