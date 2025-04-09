import { pipeline } from "@huggingface/transformers";
import { Embeddings } from "@langchain/core/embeddings";
import * as dotenv from "dotenv";
import * as path from "node:path";

dotenv.config();

type FeatureExtractionOutput = {
  data: Float32Array | number[];
};

type FeatureExtractionPipeline = (
  text: string,
  options: { pooling: string; normalize: boolean },
) => Promise<FeatureExtractionOutput>;

type HFPipeline = (
  text: string,
  options: { pooling: string; normalize: boolean },
) => Promise<FeatureExtractionOutput>;

export class TransformersEmbeddingGenerator extends Embeddings {
  private model: FeatureExtractionPipeline | null = null;
  private modelName: string;

  constructor(modelName = process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2") {
    super({});
    this.modelName = modelName;
  }

  private async initModel(): Promise<FeatureExtractionPipeline> {
    if (!this.model) {
      const modelPath = process.env.LOCAL_MODEL_PATH
        ? path.resolve(process.cwd(), process.env.LOCAL_MODEL_PATH)
        : this.modelName;
      this.model = (await pipeline("feature-extraction", modelPath)) as unknown as HFPipeline;
    }
    return this.model;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const model = await this.initModel();
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const output = await model(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
      }),
    );
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const model = await this.initModel();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
