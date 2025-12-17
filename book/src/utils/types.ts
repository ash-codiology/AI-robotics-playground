export interface QueryRequest {
  query: string;
  selected_text?: string;
  mode?: 'full_book' | 'selected_text' | 'conversation';
  conversation_id?: string;
  temperature?: number;
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
  conversation_id?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  source_metadata?: SourceMetadata[];
  conversation_id?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  mode?: 'full_book' | 'selected_text' | 'conversation';
}

export interface ThemeSettings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  enableAnimations: boolean;
  messageDisplay: 'compact' | 'comfortable' | 'cozy';
}

export interface ChatExportOptions {
  format: 'json' | 'text' | 'pdf';
  includeSources: boolean;
  includeTimestamps: boolean;
  dateRange?: { start: Date; end: Date };
}