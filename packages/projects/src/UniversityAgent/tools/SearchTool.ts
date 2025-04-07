import fetch from "node-fetch";
import { config } from "dotenv";

config();

interface SearchResult {
  value: string;
  url: string;
}

export class SearchTool {
  private readonly searchUrl: string;

  constructor() {
    this.searchUrl = process.env.UNIVERSITY_SEARCH_URL || "";
    if (!this.searchUrl) {
      throw new Error("UNIVERSITY_SEARCH_URL is not configured in .env file");
    }
  }

  async search(query: string): Promise<string | null> {
    try {
      const formData = new URLSearchParams();
      formData.append("search", query);
      formData.append("lang", "en");

      const response = await fetch(this.searchUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as SearchResult[];
      return data[0]?.url || null;
    } catch (error) {
      console.error("Error performing university search:", error);
      throw error;
    }
  }

  private getPageUrl() {}
}
