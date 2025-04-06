import { IDocumentProcessor } from "../interfaces/IDocumentProcessor";
import { Document } from "../../types";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { ConfigLoader } from "../../config/loader";
import { TextSplitterFactory } from "../../factory/textSplitterFactory";

export class DocumentProcessor implements IDocumentProcessor {
  private configLoader: ConfigLoader;

  constructor() {
    this.configLoader = ConfigLoader.getInstance();
  }

  async splitDocuments(documents: Document[]): Promise<Document[]> {
    const config = this.configLoader.getConfig();
    const textSplitter = TextSplitterFactory.create(config.chunking);
    const langChainDocs = documents.map((doc) => this.convertToLangChainDoc(doc));
    const splitDocs = await textSplitter.splitDocuments(langChainDocs);
    return splitDocs.map((doc) => this.convertFromLangChainDoc(doc));
  }

  convertToLangChainDoc(doc: Document): LangChainDocument {
    return new LangChainDocument({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    });
  }

  convertFromLangChainDoc(doc: LangChainDocument): Document {
    return {
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    };
  }
}
