import { pipeline } from "@xenova/transformers";
import { EmbeddingGenerator } from "../types";

type FeatureExtractionOutput = {
  data: Float32Array;
};

type FeatureExtractionPipeline = {
  (text: string, options: { pooling: string; normalize: boolean }): Promise<FeatureExtractionOutput>;
};

export class TransformersEmbeddingGenerator implements EmbeddingGenerator {
  private model: FeatureExtractionPipeline | null = null;
  private modelName: string;

  constructor(modelName: string = "Xenova/all-MiniLM-L6-v2") {
    this.modelName = modelName;
  }

  private async initModel(): Promise<FeatureExtractionPipeline> {
    if (!this.model) {
      this.model = (await pipeline("feature-extraction", this.modelName)) as FeatureExtractionPipeline;
    }
    return this.model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = await this.initModel();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
