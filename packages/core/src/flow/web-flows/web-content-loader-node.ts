import { FlowNode } from "@core/flow/base";
import type { RAGSystem } from "@core/rag";
import type { SearchResult } from "@core/types";
import type { Document } from "@langchain/core/documents";
import * as cheerio from "cheerio";

export interface WebSearchState {
  query: string;
  urls: string[];
  documents: Document[];
  searchResults: SearchResult[];
  aiResponse?: string;
}

export class WebContentLoaderNode extends FlowNode<WebSearchState, WebSearchState> {
  constructor(private rag: RAGSystem) {
    super();
  }

  async process(state: WebSearchState): Promise<Partial<WebSearchState>> {
    if (!state.urls || state.urls.length === 0) {
      return { ...state, searchResults: [] };
    }

    const results: SearchResult[] = [];
    for (const url of state.urls) {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      const content = $("body").text();

      results.push({
        document: {
          pageContent: content,
          metadata: { source: url, type: "web" },
        },
        score: 1.0,
      });
    }

    return { searchResults: results };
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    $("script, style, nav, footer, header").remove();

    const selectors = [
      "article",
      "main",
      ".article",
      ".post",
      ".content",
      "#content",
      "#main",
      "body",
    ];

    for (const selector of selectors) {
      const content = $(selector).text().trim();
      if (content.length > 100) {
        return content;
      }
    }

    return $("body").text().trim();
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      $("h1").first().text() ||
      "Untitled Web Content";

    return title.trim();
  }
}
