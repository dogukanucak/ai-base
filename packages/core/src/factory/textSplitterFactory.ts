import {
  MarkdownTextSplitter,
  RecursiveCharacterTextSplitter,
  type TextSplitter,
} from "langchain/text_splitter";
import type { ChunkingConfig } from "../config/types";

export function createTextSplitter(config: ChunkingConfig): TextSplitter {
  const { type, chunkSize = 1000, chunkOverlap = 200, separators } = config;

  if (type === "markdown") {
    return new MarkdownTextSplitter({
      chunkSize,
      chunkOverlap,
    });
  }

  return new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: separators || ["\n\n", "\n", ". ", " ", ""],
  });
}
