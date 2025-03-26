import { Embeddings } from "@langchain/core/embeddings";
import { VectorStore } from "@langchain/core/vectorstores";
import { DocumentLoader } from "../types";
import { EmbeddingConfig, VectorStoreConfig, DocumentLoaderConfig } from "../config/types";
import { TransformersEmbeddingGenerator } from "../embeddings/generator";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { MarkdownLoader } from "../documents/loader";

export class RAGFactory {
  static createEmbeddingGenerator(config: EmbeddingConfig): Embeddings {
    return new TransformersEmbeddingGenerator(config.modelName);
  }

  static async createVectorStore(config: VectorStoreConfig): Promise<VectorStore> {
    const embeddings = new TransformersEmbeddingGenerator();

    switch (config.type) {
      case "chroma":
        return await Chroma.fromExistingCollection(embeddings, { collectionName: config.collectionName || "ai_base" });
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
