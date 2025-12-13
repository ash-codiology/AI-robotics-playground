export interface QueryRequest {
  query: string;
  selected_text?: string;
  mode?: 'full_book' | 'selected_text';
}

export interface SourceMetadata {
  content: string;
  source_id: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

export interface QueryResponse {
  response: string;
  source_metadata: SourceMetadata[];
  mode_used: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  source_metadata?: SourceMetadata[];
}