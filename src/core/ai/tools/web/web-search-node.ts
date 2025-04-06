import * as cheerio from 'cheerio';
import { FlowNode } from '@core/flow/base';
import { RAGSystem } from '@core/rag';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { SearchResult } from '@core/types';
import { TransformersEmbeddingGenerator } from '@core/embeddings/generator';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export interface WebSearchState {
  query: string;
  urls: string[];
  searchResults?: SearchResult[];
  aiResponse?: string;
}

export class WebSearchNode extends FlowNode<WebSearchState, WebSearchState> {
  private embeddings: TransformersEmbeddingGenerator;
  private vectorStore: MemoryVectorStore;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    super();
    this.embeddings = new TransformersEmbeddingGenerator();
    this.vectorStore = new MemoryVectorStore(this.embeddings);
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

    const documents: LangChainDocument[] = [];
    
    for (const url of state.urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Extract main content and split into chunks
        const content = this.extractMainContent($);
        const chunks = await this.textSplitter.createDocuments([content]);
        
        // Add metadata to each chunk
        const chunkedDocs = chunks.map(chunk => new LangChainDocument({
          pageContent: chunk.pageContent,
          metadata: {
            source: url,
            title: this.extractTitle($),
            type: 'web',
            domain: new URL(url).hostname,
            lastFetched: new Date().toISOString(),
          }
        }));
        
        documents.push(...chunkedDocs);
      } catch (error) {
        console.error(`Failed to fetch content from ${url}:`, error);
      }
    }

    // Add all documents to the in-memory vector store
    await this.vectorStore.addDocuments(documents);

    // Perform similarity search with a higher k to get more results
    const results = await this.vectorStore.similaritySearchWithScore(state.query, 10);
    
    // Convert to SearchResult format and filter by similarity threshold
    const searchResults: SearchResult[] = results
      .filter(([_, score]) => score > 0.5) // Only include results with significant similarity
      .map(([document, score]: [LangChainDocument, number]) => ({
        document,
        score
      }));

    return { searchResults };
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Remove unwanted elements
    $('script, style, nav, footer, header, iframe, noscript').remove();
    
    // Try to find the main content area
    const selectors = [
      'article',
      'main',
      '.article',
      '.post',
      '.content',
      '#content',
      '#main',
      'body'
    ];

    for (const selector of selectors) {
      const content = $(selector).text().trim();
      if (content.length > 100) {
        return content;
      }
    }

    return $('body').text().trim();
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    const title = $('meta[property="og:title"]').attr('content') ||
                 $('meta[name="twitter:title"]').attr('content') ||
                 $('title').text() ||
                 $('h1').first().text() ||
                 'Untitled Web Content';
    
    return title.trim();
  }
} 