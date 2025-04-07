export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
}

export interface QueryResponse {
  query: string;
  documents: {
    content: string;
    similarity: number;
    id: string;
    isRelevant: boolean;
  }[];
  metadata: {
    totalResults: number;
    relevantResults: number;
    similarityThreshold: number;
    filteredOutResults: number;
  };
  aiResponse?: string;
}
