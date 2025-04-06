import fs from "fs";
import * as path from "path";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import frontMatter from "front-matter";
import { readFile } from "fs/promises";
import { glob } from "glob";

interface MarkdownAttributes {
  title?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export class MarkdownLoader extends BaseDocumentLoader {
  private docsPath: string;

  constructor(docsPath = "docs") {
    super();
    this.docsPath = path.resolve(docsPath);
  }

  async load(): Promise<Document[]> {
    // Check if path is a file or directory
    const stats = fs.statSync(this.docsPath);
    const isFile = stats.isFile();

    let mdFiles: string[];
    if (isFile) {
      // If it's a file, just use that file
      mdFiles = [this.docsPath];
    } else {
      // If it's a directory, find all markdown files
      mdFiles = await glob("*.md", {
        cwd: this.docsPath,
        absolute: true,
        nodir: true,
        dot: false,
      });
    }

    const documents: Document[] = [];

    for (const file of mdFiles) {
      try {
        const content = await readFile(file, "utf-8");
        const { attributes, body } = frontMatter<MarkdownAttributes>(content);
        const relativePath = isFile ? path.basename(file) : path.relative(this.docsPath, file);

        documents.push(
          new Document({
            pageContent: body.trim(),
            metadata: {
              ...attributes,
              filepath: relativePath,
            },
          }),
        );
      } catch (error) {
        console.error("Error processing file:", file, error);
      }
    }

    return documents;
  }
}
