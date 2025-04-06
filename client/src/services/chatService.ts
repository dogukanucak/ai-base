import type { QueryResponse } from "../types/chat";

class ChatService {
  private readonly API_URL = "http://localhost:3000/api";

  async sendQuery(query: string, maxResults = 5): Promise<QueryResponse> {
    const response = await fetch(`${this.API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        maxResults,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  formatResponse(data: QueryResponse): string {
    if (data.aiResponse) {
      const relevantDocs = data.documents.filter((doc) => doc.isRelevant).map((doc) => doc.id);

      const docReference =
        relevantDocs.length > 0 ? `\n\nReferenced documents: ${relevantDocs.join(", ")}` : "";

      return data.aiResponse + docReference;
    }

    return `I found these relevant documents:\n\n${data.documents
      .filter((doc) => doc.isRelevant)
      .map((doc) => `${doc.content} (Similarity: ${(doc.similarity * 100).toFixed(1)}%)`)
      .join("\n\n")}`;
  }
}

export const chatService = new ChatService();
