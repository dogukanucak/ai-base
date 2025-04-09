import { pipeline } from "@huggingface/transformers";
import { Embeddings } from "@langchain/core/embeddings";
import * as dotenv from "dotenv";
import * as path from "node:path";
import * as fs from "node:fs";
// Function to find the project root by looking for package.json
function findRootDir(startPath: string): string {
  let currentPath = startPath;

  // Keep going up until we find package.json or hit the root
  while (currentPath !== path.dirname(currentPath)) {
    // Stop at filesystem root
    if (fs.existsSync(path.join(currentPath, "package.json"))) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(currentPath, "package.json"), "utf8"),
      );
      // Verify it's our root package.json by checking the name
      if (packageJson.name === "ai-base") {
        return currentPath;
      }
    }
    currentPath = path.dirname(currentPath);
  }

  throw new Error(
    'Could not find project root (directory containing package.json with name "ai-base")',
  );
}

dotenv.config({ path: `${findRootDir(process.cwd())}/.env` });

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
      console.log("Loading model from Hugging Face:", process.env.LOCAL_MODEL_PATH);
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
