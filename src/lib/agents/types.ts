export type AgentId = "goody" | "baddy";

export type ActionSignal = "none" | "bring_colleague" | "step_out";

export interface AgentResponse {
  message: string;
  action: ActionSignal;
  transitionNote?: string;
}

export interface RoomState {
  goodyInRoom: boolean;
  baddyInRoom: boolean;
  activeAgent: AgentId;
}

export interface HandoffData {
  exitingAgent: AgentId;
  exitMessage: string;
  enteringAgent: AgentId;
  entranceMessage: string;
  newAgentResponse: string;
  newAgentDebug?: MessageDebugInfo;
  // The exiting agent's decision (their response is discarded, but we keep the decision for debugging)
  exitingAgentDecision?: {
    action: ActionSignal;
    transitionNote?: string;
    tokenUsage: TokenUsage;
  };
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  agent: AgentId;
  message: string;
  handoff?: HandoffData;
  roomState: RoomState;
  tokenUsage: TokenUsage;
  debug?: MessageDebugInfo;
}

export interface RAGChunkInfo {
  id: string;
  score: number;
  category: string;
  preview: string; // First 100 chars of text
}

export interface ToolCall {
  name: string;
  description: string;
  input?: Record<string, unknown>;
  output?: string;
  durationMs?: number;
  status: "success" | "error" | "skipped";
}

export interface MessageDebugInfo {
  // What changes per turn
  agentId?: AgentId;
  action?: ActionSignal;
  transitionNote?: string;
  timestamp?: string;
  
  // Token breakdown
  tokenUsage?: TokenUsage;
  tokenBreakdown?: {
    systemPromptTokens: number;  // Base system prompt (constant)
    ragContextTokens: number;    // RAG injection (changes per turn)
    conversationTokens: number;  // History (grows each turn)
    completionTokens: number;    // Response
  };
  
  // Conversation summary (not full content)
  messageCount?: number;
  
  // Tool calls made this turn
  toolCalls?: ToolCall[];
  
  // RAG details
  ragChunks?: RAGChunkInfo[];
  ragEnabled?: boolean;
  
  // Full data (for "show more")
  systemPrompt?: string;
  conversationHistory?: Array<{ role: string; content: string; agent?: string }>;
  
  // Constants (rarely shown)
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptSent?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
  isTransition?: boolean;
  transitionType?: "exit" | "entrance";
  debug?: MessageDebugInfo;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  systemPrompt: string;
  temperature: number;
}

