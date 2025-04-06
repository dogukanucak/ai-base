import * as cheerio from "cheerio";
import { FlowNode } from "@core/flow/base";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { SearchResult } from "@core/types";
import { TransformersEmbeddingGenerator } from "@core/embeddings/generator";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export interface WebSearchState {
  query: string;
  urls: string[];
  searchResults?: SearchResult[];
  aiResponse?: string;
}

export class WebSearchNode extends FlowNode<WebSearchState, WebSearchState> {
  private embeddings: TransformersEmbeddingGenerator;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    super();
    this.embeddings = new TransformersEmbeddingGenerator();
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    });
  }

  async process(state: WebSearchState): Promise<Partial<WebSearchState>> {
    if (!state.urls || state.urls.length === 0) {
      return {};
    }

    const allSearchResults: SearchResult[] = [];

    for (const url of state.urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
          continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract main content and split into chunks
        const content = this.extractMainContent($);
        const chunks = await this.textSplitter.createDocuments([content]);

        // Create documents with metadata for this URL
        const documents = chunks.map(
          (chunk) =>
            new LangChainDocument({
              pageContent: chunk.pageContent,
              metadata: {
                source: url,
                title: this.extractTitle($),
                type: "web",
                domain: new URL(url).hostname,
                lastFetched: new Date().toISOString(),
              },
            }),
        );

        // Create a new vector store for this URL's content
        const vectorStore = new MemoryVectorStore(this.embeddings);
        await vectorStore.addDocuments(documents);

        // Search within this URL's content
        const results = await vectorStore.similaritySearchWithScore(state.query, 5);

        // Add results to all results with the correct source URL
        allSearchResults.push(
          ...results
            .filter(([_, score]) => score > 0.5)
            .map(([document, score]: [LangChainDocument, number]) => ({
              document: new LangChainDocument({
                pageContent: document.pageContent,
                metadata: {
                  source: url,
                  title: document.metadata.title,
                  type: "web",
                  domain: new URL(url).hostname,
                  lastFetched: new Date().toISOString(),
                },
              }),
              score,
            })),
        );
      } catch (error) {
        console.error(`Failed to process ${url}:`, error);
      }
    }

    // Sort all results by score
    allSearchResults.sort((a, b) => b.score - a.score);

    return { searchResults: allSearchResults };
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Remove unwanted elements
    $("script, style, nav, footer, header, iframe, noscript").remove();

    // Try to find the main content area
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
