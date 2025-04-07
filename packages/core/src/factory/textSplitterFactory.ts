import type { ChunkingConfig } from "../config/types";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
  type TextSplitter,
} from "langchain/text_splitter";

export function createTextSplitter(config: ChunkingConfig): TextSplitter {
  return new RecursiveCharacterTextSplitter({
    chunkSize: config.chunkSize || 1000,
    chunkOverlap: config.chunkOverlap || 200,
    separators: config.separators || ["\n\n", "\n", " ", ""],
  });
}
