import type { DocumentLoaderConfig, EmbeddingConfig, VectorStoreConfig } from "@core/config/types";
import { MarkdownLoader } from "@core/documents/loader";
import { TransformersEmbeddingGenerator } from "@core/embeddings/generator";
import type { DocumentLoader } from "@core/types";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { Embeddings } from "@langchain/core/embeddings";
import type { VectorStore } from "@langchain/core/vectorstores";

export class RAGFactory {
  static createEmbeddingGenerator(config: EmbeddingConfig): Embeddings {
    return new TransformersEmbeddingGenerator(config.modelName);
  }

  static async createVectorStore(config: VectorStoreConfig): Promise<VectorStore> {
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

  static createDocumentLoader(config: DocumentLoaderConfig): DocumentLoader {
    switch (config.type) {
      case "markdown":
        return new MarkdownLoader(config.path);
      // Add other document loader types here
      default:
        throw new Error(`Unsupported document loader type: ${config.type}`);
    }
  }
}
