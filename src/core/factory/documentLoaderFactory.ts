import fs from "node:fs";
import path from "node:path";
import type { DocumentLoaderConfig } from "@core/config/types";
import { MarkdownLoader } from "@core/documents/loader";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

export function createDocumentLoader(config: DocumentLoaderConfig): BaseDocumentLoader {
  const { path: docsPath } = config;

  // Resolve path relative to project root
  const projectRoot = process.cwd();
  const absolutePath = path.resolve(projectRoot, docsPath);

  // Validate directory exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Documents directory does not exist: ${absolutePath}`);
  }

  // Validate it's a directory
  const stats = fs.statSync(absolutePath);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${absolutePath}`);
  }

  return new DirectoryLoader(
    absolutePath,
    {
      ".txt": (path) => new TextLoader(path),
      ".md": (path) => new MarkdownLoader(path),
      ".pdf": (path) => new PDFLoader(path),
    },
    true,
  );
}
