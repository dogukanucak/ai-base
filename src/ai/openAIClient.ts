import OpenAI from "openai";
import { SearchResult } from "../types";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIClient {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model || "gpt-4-turbo-preview";
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
  }

  private formatContext(searchResults: SearchResult[]): string {
    return searchResults
      .map((result, index) => {
        return `[Document ${index + 1}] (Relevance: ${result.score.toFixed(2)})\n${result.document.content}\n`;
      })
      .join("\n");
  }

  async getResponse(query: string, context?: SearchResult[]): Promise<string> {
    try {
      let prompt = query;

      if (context && context.length > 0) {
        const contextText = this.formatContext(context);
        prompt = `Context information is below:
---
${contextText}
---
Given the context above, please answer the following question:
${query}`;
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. When answering questions, use the provided context information if available, but you can also draw on your general knowledge when needed. Always aim to provide accurate and relevant information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0]?.message?.content || "No response generated";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw error;
    }
  }

  setModel(model: string): void {
    this.model = model;
  }

  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }

  setTemperature(temperature: number): void {
    if (temperature < 0 || temperature > 1) {
      throw new Error("Temperature must be between 0 and 1");
    }
    this.temperature = temperature;
  }
}
