import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocumentLoaderConfig } from "../config/types";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured"

export class DocumentLoaderFactory {
  static create(config: DocumentLoaderConfig) {
    const { type, path } = config;

    switch (type) {
      case "pdf":
        return new PDFLoader(path);     

      case "multi":
        return new DirectoryLoader(path, {
          ".txt": (path) => new TextLoader(path),
          ".md": (path) => new UnstructuredLoader(path),
          ".pdf": (path) => new PDFLoader(path),       
        });

      case "markdown":
      default:
        return new UnstructuredLoader(path);
    }
  }
}
