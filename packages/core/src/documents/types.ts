export interface Document {
  id: string;
  content: string;
  metadata?: {
    [key: string]: string | number | boolean | null | undefined;
  };
  embedding?: number[];
}
