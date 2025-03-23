import { glob } from "glob";
import { readFile } from "fs/promises";
import * as path from "path";
import frontMatter from "front-matter";
import { Document } from "../types";

interface MarkdownAttributes {
  title?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export class MarkdownLoader {
  private docsPath: string;

  constructor(docsPath: string = "docs") {
    this.docsPath = docsPath;
  }

  async loadDocuments(): Promise<Document[]> {
    const mdFiles = await glob("**/*.md", { cwd: this.docsPath });
    const documents: Document[] = [];

    for (const file of mdFiles) {
      const content = await readFile(path.join(this.docsPath, file), "utf-8");
      const { attributes, body } = frontMatter<MarkdownAttributes>(content);

      documents.push({
        id: path.relative(this.docsPath, file), // Use relative path as ID
        content: body.trim(),
        metadata: {
          ...attributes,
          filepath: file,
        },
      });
    }

    return documents;
  }
}
