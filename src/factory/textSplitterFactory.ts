import { TextSplitter } from "@langchain/core/text_splitter";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { MarkdownTextSplitter } from "langchain/text_splitter";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TokenTextSplitter } from "langchain/text_splitter";
import { ChunkingConfig } from "../config/types";

export class TextSplitterFactory {
  static create(config: ChunkingConfig): TextSplitter {
    const { type, chunkSize, chunkOverlap, separators, encodingName, tokenBudget } = config;

    switch (type) {
      case "markdown":
        return new MarkdownTextSplitter({
          chunkSize,
          chunkOverlap,
        });

      case "recursive":
        return new RecursiveCharacterTextSplitter({
          chunkSize,
          chunkOverlap,
          separators: separators || ["\n\n", "\n", " ", ""],
        });

      case "token":
        return new TokenTextSplitter({
          encodingName: encodingName || "cl100k_base",
          chunkSize,
          chunkOverlap,
          disallowedSpecial: [],
        });

      case "character":
      default:
        return new CharacterTextSplitter({
          chunkSize,
          chunkOverlap,
        });
    }
  }
}
