import { Document, type SearchResult } from "@core/types";

// Base state that all flows will extend
export interface BaseState {
  query: string;
}

// RAG specific state
export interface RAGState extends BaseState {
  searchResults?: SearchResult[];
  aiResponse?: string;
}

// Base class for all flow nodes
export abstract class FlowNode<TInput, TOutput> {
  abstract process(state: TInput): Promise<Partial<TOutput>>;
}

// Flow builder to make flow creation easy and chainable
export class FlowBuilder<TState> {
  private nodes: { name: string; node: FlowNode<TState, TState> }[] = [];

  addNode(name: string, node: FlowNode<TState, TState>): this {
    this.nodes.push({ name, node });
    return this;
  }

  async execute(state: TState): Promise<TState> {
    let currentState = { ...state };

    for (const { node } of this.nodes) {
      const result = await node.process(currentState);
      currentState = { ...currentState, ...result };
    }

    return currentState;
  }
}
