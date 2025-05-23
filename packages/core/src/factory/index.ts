import type {
  DocumentLoaderConfig,
  EmbeddingConfig,
  RetrievalConfig,
  VectorStoreConfig,
} from "@core/config/types";
import { MarkdownLoader } from "@core/documents/loader";
import { TransformersEmbeddingGenerator } from "@core/embeddings/generator";
import type { DocumentLoader } from "@core/types";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { Embeddings } from "@langchain/core/embeddings";
import type { BaseRetriever } from "@langchain/core/retrievers";
import type { VectorStore } from "@langchain/core/vectorstores";
import { createRetriever as factoryCreateRetriever } from "./retrieverFactory";

export function createEmbeddingGenerator(config: EmbeddingConfig): Embeddings {
  return new TransformersEmbeddingGenerator(config.modelName);
}

export async function createVectorStore(config: VectorStoreConfig): Promise<VectorStore> {
  const embeddings = new TransformersEmbeddingGenerator();

  switch (config.type) {
    case "chroma":
      return await Chroma.fromExistingCollection(embeddings, {
        collectionName: config.collectionName || "ai_base",
      });
    // Add other vector store types here
    default:
      throw new Error(`Unsupported vector store type: ${config.type}`);
  }
}

export function createDocumentLoader(config: DocumentLoaderConfig): DocumentLoader {
  switch (config.type) {
    case "markdown":
      return new MarkdownLoader(config.path);
    // Add other document loader types here
    default:
      throw new Error(`Unsupported document loader type: ${config.type}`);
  }
}

export async function createRetriever(
  vectorStore: VectorStore,
  config: RetrievalConfig,
): Promise<BaseRetriever> {
  return factoryCreateRetriever(vectorStore, config);
}
