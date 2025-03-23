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
    this.docsPath = path.resolve(docsPath);
  }

  async loadDocuments(): Promise<Document[]> {
    const mdFiles = await glob("*.md", {
      cwd: this.docsPath,
      absolute: true,
      nodir: true,
      dot: false,
    });

    const documents: Document[] = [];

    for (const file of mdFiles) {
      try {
        const content = await readFile(file, "utf-8");
        const { attributes, body } = frontMatter<MarkdownAttributes>(content);
        const relativePath = path.relative(this.docsPath, file);

        documents.push({
          id: relativePath,
          content: body.trim(),
          metadata: {
            ...attributes,
            filepath: relativePath,
          },
        });
      } catch (error) {
        console.error("Error processing file:", file, error);
      }
    }

    return documents;
  }
}
