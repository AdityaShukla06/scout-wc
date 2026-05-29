export type MessageRole = "user" | "assistant";

export interface ToolCall {
  name: string;
  status: "loading" | "done";
  query?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  history: Message[];
}

export interface ChatResponse {
  message: string;
  toolCalls?: ToolCall[];
}
