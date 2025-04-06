import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SearchResult } from "@types";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIClient {
  private chatModel: ChatOpenAI;

  constructor(config: OpenAIConfig) {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: config.apiKey,
      modelName: config.model || "gpt-4-turbo-preview",
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
    });
  }

  private formatContext(searchResults: SearchResult[]): string {
    return searchResults
      .map((result, index) => {
        return `[Document ${index + 1}] (Relevance: ${result.score.toFixed(2)})\n${result.document.pageContent}\n`;
      })
      .join("\n");
  }

  async getResponse(query: string, context?: SearchResult[]): Promise<string> {
    const messages = [
      new SystemMessage(
        "You are a helpful assistant. When answering questions, use the provided context information if available, but you can also draw on your general knowledge when needed. Always aim to provide accurate and relevant information."
      ),
    ];

    if (context && context.length > 0) {
      const contextText = this.formatContext(context);
      messages.push(
        new HumanMessage(
          `Context information is below:
---
${contextText}
---
Given the context above, please answer the following question:
${query}`
        )
      );
    } else {
      messages.push(new HumanMessage(query));
    }

    const response = await this.chatModel.invoke(messages);
    return response.content.toString();
  }

  setModel(model: string): void {
    this.chatModel.model = model;
  }

  setMaxTokens(maxTokens: number): void {
    this.chatModel.maxTokens = maxTokens;
  }

  setTemperature(temperature: number): void {
    if (temperature < 0 || temperature > 1) {
      throw new Error("Temperature must be between 0 and 1");
    }
    this.chatModel.temperature = temperature;
  }
}
