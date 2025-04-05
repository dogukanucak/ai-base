import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocumentLoaderConfig } from "../config/types";
import { MarkdownLoader } from "../documents/loader";

export class DocumentLoaderFactory {
  static create(config: DocumentLoaderConfig): BaseDocumentLoader {
    const { type, path } = config;

    switch (type) {
      case "pdf":
        return new PDFLoader(path);

      case "multi":
        return new DirectoryLoader(path, {
          ".txt": (path) => new TextLoader(path),
          ".md": (path) => new MarkdownLoader(path),
          ".pdf": (path) => new PDFLoader(path),
        });

      case "markdown":
      default:
        return new MarkdownLoader(path);
    }
  }
}
