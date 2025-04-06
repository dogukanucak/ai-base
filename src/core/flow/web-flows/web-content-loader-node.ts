import * as cheerio from 'cheerio';
import { FlowNode } from '@core/flow/base';
import { RAGSystem } from '@core/rag';
import { Document as LangChainDocument } from '@langchain/core/documents';

export interface WebContentState {
  query: string;
  urls: string[];
  searchResults?: any[];
  aiResponse?: string;
}

export class WebContentLoaderNode extends FlowNode<WebContentState, WebContentState> {
  constructor(private rag: RAGSystem) {
    super();
  }

  async process(state: WebContentState): Promise<{}> {
    if (!state.urls || state.urls.length === 0) {
      return {};
    }

    const documents: LangChainDocument[] = [];
    
    for (const url of state.urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const content = this.extractMainContent($);
        
        documents.push(
          new LangChainDocument({
            pageContent: content,
            metadata: {
              source: url,
              title: this.extractTitle($),
              type: 'web',
              domain: new URL(url).hostname,
              lastFetched: new Date().toISOString(),
            }
          })
        );
      } catch (error) {
        console.error(`Failed to fetch content from ${url}:`, error);
      }
    }

    await this.rag.addDocuments(documents);
    return {};
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    $('script, style, nav, footer, header').remove();
    
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