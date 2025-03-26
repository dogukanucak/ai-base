import { pipeline, Pipeline } from "@xenova/transformers";
import { Embeddings } from "@langchain/core/embeddings";
import { AsyncCaller } from "@langchain/core/utils/async_caller";
import type { FeatureExtractionPipeline } from "@xenova/transformers";

export class TransformersEmbeddingGenerator extends Embeddings {
  private model: FeatureExtractionPipeline | null = null;
  private modelName: string;

  constructor(modelName: string = "Xenova/all-MiniLM-L6-v2") {
    super({});
    this.modelName = modelName;
  }

  private async initModel(): Promise<FeatureExtractionPipeline> {
    if (!this.model) {
      this.model = (await pipeline("feature-extraction", this.modelName)) as FeatureExtractionPipeline;
    }
    return this.model;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const model = await this.initModel();
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const output = await model(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
      })
    );
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const model = await this.initModel();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
