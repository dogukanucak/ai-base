import { TextSplitter, CharacterTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChunkingConfig } from "../config/types";

export class TextSplitterFactory {
  static create(config: ChunkingConfig): TextSplitter {
    switch (config.type) {
      case "markdown":
        return new RecursiveCharacterTextSplitter({
          chunkSize: config.chunkSize || 500,
          chunkOverlap: config.chunkOverlap || 50,
          separators: ["## ", "# ", "\n### ", "\n## ", "\n# ", "\n\n", "\n", ". ", " "],
          keepSeparator: false,
        });

      case "recursive":
        return new RecursiveCharacterTextSplitter({
          chunkSize: config.chunkSize || 1000,
          chunkOverlap: config.chunkOverlap || 200,
        });

      default:
        return new CharacterTextSplitter({
          separator: "\n\n",
          chunkSize: config.chunkSize || 1000,
          chunkOverlap: config.chunkOverlap || 200,
        });
    }
  }
}
