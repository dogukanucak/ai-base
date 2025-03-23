import { EmbeddingGenerator, VectorStore, DocumentLoader } from "../types";
import { EmbeddingConfig, VectorStoreConfig, DocumentLoaderConfig } from "../config/types";
import { TransformersEmbeddingGenerator } from "../embeddings/generator";
import { ChromaVectorStore } from "../storage/chromaVectorStore";
import { MarkdownLoader } from "../documents/loader";

export class RAGFactory {
  static createEmbeddingGenerator(config: EmbeddingConfig): EmbeddingGenerator {
    return new TransformersEmbeddingGenerator(config.modelName);
  }

  static createVectorStore(config: VectorStoreConfig): VectorStore {
    switch (config.type) {
      case "chroma":
        return new ChromaVectorStore(config.collectionName || "custom_rag", config.similarityThreshold || 0.7);
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
