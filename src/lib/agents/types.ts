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
  preview: string;
  fullText?: string;
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
    basePromptTokens: number;      // Base system prompt (constant per agent)
    suspectContextTokens: number;  // Suspect profile injected into system prompt
    ragContextTokens: number;      // RAG chunks injected into system prompt
    conversationTokens: number;    // Conversation history (grows each turn)
    completionTokens: number;      // LLM output
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

export interface PipelineStep {
  id: string;
  label: string;
  status: "running" | "done" | "error" | "skipped";
  detail?: string;
  durationMs?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
  isTransition?: boolean;
  transitionType?: "exit" | "entrance";
  debug?: MessageDebugInfo;
  steps?: PipelineStep[];
  transitions?: string[];
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  systemPrompt: string;
  temperature: number;
}

