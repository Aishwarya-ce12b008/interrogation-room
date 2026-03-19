"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Database,
  Wrench,
  Zap,
  CheckCircle,
  XCircle,
  MinusCircle,
  FileText,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { MessageDebugInfo, ToolCall as ToolCallType, LLMCallInfo } from "@/lib/agents";

interface ObservabilityPanelProps {
  debug: MessageDebugInfo | null;
  allTurnDebug?: MessageDebugInfo[];
  onSelectTurn?: (index: number) => void;
  selectedTurnIndex?: number;
  expandSection?: string | null;
  onSectionViewed?: () => void;
}

const COST_PER_TOKEN = 0.00000015;
const CONTEXT_WINDOW = 128_000;

type TabId = "agent" | "prompt" | "tools" | "rag" | "tokens";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "agent", label: "Agent", icon: <Brain className="w-3.5 h-3.5" /> },
  { id: "prompt", label: "Prompt", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "tools", label: "Tools", icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: "rag", label: "RAG", icon: <Database className="w-3.5 h-3.5" /> },
  { id: "tokens", label: "Pricing", icon: <Zap className="w-3.5 h-3.5" /> },
];

export function ObservabilityPanel({
  debug, allTurnDebug, onSelectTurn, selectedTurnIndex, expandSection, onSectionViewed,
}: ObservabilityPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("agent");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggle = (section: string) =>
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  // When a step is clicked, switch to the corresponding tab
  useEffect(() => {
    if (expandSection) {
      const tabMap: Record<string, TabId> = { tools: "tools", rag: "rag", tokens: "tokens", prompt: "prompt" };
      if (tabMap[expandSection]) setActiveTab(tabMap[expandSection]);
      onSectionViewed?.();
    }
  }, [expandSection, onSectionViewed]);

  if (!debug) {
    return (
      <div className="h-full flex flex-col bg-background border-l border-border">
        <PanelHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">Waiting for first message...</p>
        </div>
      </div>
    );
  }

  const totalTokens = debug.tokenUsage?.totalTokens || 0;
  const breakdown = debug.tokenBreakdown;
  const contextUsage = totalTokens / CONTEXT_WINDOW;
  const hasTools = debug.toolCalls && debug.toolCalls.length > 0;
  const hasRag = debug.ragChunks && debug.ragChunks.length > 0;

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <PanelHeader />

      {/* Turn Selector */}
      {allTurnDebug && allTurnDebug.length > 1 && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Turn:</span>
            <div className="flex gap-1 flex-wrap">
              {allTurnDebug.map((t, i) => (
                <button key={i} onClick={() => onSelectTurn?.(i)} className={cn(
                  "w-7 h-7 rounded text-xs font-mono border transition-colors",
                  i === selectedTurnIndex ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
                )}>{i + 1}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border px-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* ===== AGENT TAB ===== */}
        {activeTab === "agent" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", debug.agentId === "goody" ? "bg-emerald-500" : debug.agentId === "baddy" ? "bg-red-500" : "bg-purple-500")} />
              <span className="text-base font-semibold text-foreground capitalize">{debug.agentId || "Agent"}</span>
              {debug.action && debug.action !== "none" && (
                <>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getActionLabel(debug.action)}</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetaCell label="Model" value={debug.model || "gpt-4.1-mini"} mono />
              <MetaCell label="Temperature" value={String(debug.temperature ?? "—")} mono />
              <MetaCell label="Max tokens" value={debug.maxTokens?.toLocaleString() || "1024"} mono />
              <MetaCell label="Response format" value="JSON object" mono />
              <MetaCell label="Messages in context" value={String(debug.messageCount || 0)} />
              <MetaCell label="Timestamp" value={debug.timestamp ? new Date(debug.timestamp).toLocaleTimeString() : "—"} />
            </div>

            {debug.action && debug.action !== "none" && debug.transitionNote && (
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-xs text-foreground/70">
                <div className="text-[10px] uppercase tracking-widest text-yellow-600 dark:text-yellow-400 font-medium mb-1">Transition note</div>
                {debug.transitionNote}
              </div>
            )}
          </div>
        )}

        {/* ===== TOOLS TAB ===== */}
        {activeTab === "tools" && (
          <div className="space-y-3">
            {debug.llmCalls && debug.llmCalls.length > 0 ? (
              <PipelineTimeline llmCalls={debug.llmCalls} toolCalls={debug.toolCalls || []} />
            ) : hasTools ? (
              debug.toolCalls!.map((tool, idx) => (
                <ToolCallDetail key={idx} tool={tool} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic py-8 text-center">No tool calls this turn</p>
            )}
          </div>
        )}

        {/* ===== RAG TAB ===== */}
        {activeTab === "rag" && (
          <div className="space-y-4">
            {/* RAG config */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-medium">Configuration</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <MetaCell label="Embedding model" value="text-embedding-3-small" mono />
                <MetaCell label="Vector DB" value="Pinecone" mono />
                <MetaCell label="Top-K" value="5" mono />
                <MetaCell label="Min score threshold" value="0.3 (30%)" mono />
              </div>
            </div>

            {/* Chunks */}
            {hasRag ? (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-medium">
                  {debug.ragChunks!.length} chunks retrieved and injected into system prompt
                </div>
                <div className="space-y-2">
                  {debug.ragChunks!.map((chunk, i) => (
                    <RagChunkCard key={chunk.id} chunk={chunk} index={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic py-8 text-center">
                {debug.ragEnabled
                  ? "Query was sent but no chunks scored above 30% threshold"
                  : "RAG was skipped this turn (first turn or short message)"}
              </div>
            )}
          </div>
        )}

        {/* ===== PRICING TAB ===== */}
        {activeTab === "tokens" && (
          <div className="space-y-4">
            {breakdown && (
              <>
                {/* Augmented system prompt group */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-medium">Augmented system prompt</div>
                  <div className="space-y-2 pl-2 border-l-2 border-blue-500/20">
                    <TokenBar label="Base system prompt" value={breakdown.basePromptTokens} total={totalTokens} color="blue" />
                    <TokenBar label="Dynamic context" value={breakdown.suspectContextTokens} total={totalTokens} color="blue" />
                    <TokenBar label="RAG context (injected)" value={breakdown.ragContextTokens} total={totalTokens} color="purple" />
                  </div>
                  <div className="mt-1.5 pl-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>= Augmented system prompt total</span>
                    <span className="font-mono text-foreground">{(breakdown.basePromptTokens + breakdown.suspectContextTokens + breakdown.ragContextTokens).toLocaleString()}</span>
                  </div>
                </div>

                {/* Other components */}
                <div className="space-y-2">
                  <TokenBar label={`Conversation history (${debug.messageCount || 0} msgs)`} value={breakdown.conversationTokens} total={totalTokens} color="amber" />
                  <TokenBar label="Completion (output)" value={breakdown.completionTokens} total={totalTokens} color="emerald" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <MetaCell label="Prompt tokens (API)" value={debug.tokenUsage?.promptTokens?.toLocaleString() || "—"} mono />
                  <MetaCell label="Completion tokens" value={debug.tokenUsage?.completionTokens?.toLocaleString() || "—"} mono />
                  <MetaCell label="Total tokens" value={totalTokens.toLocaleString()} mono />
                  <MetaCell label="Cost (this turn)" value={`~$${(totalTokens * COST_PER_TOKEN).toFixed(5)}`} mono />
                </div>

                <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed">
                  Augmented System Prompt = Base Prompt + Dynamic Context + RAG Context. Conversation history is all messages so far. Output is the completion tokens for this turn.
                </p>
              </>
            )}

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Context window usage</span>
                <span className="font-mono text-foreground">{(contextUsage * 100).toFixed(1)}% of 128K</span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className={cn(
                  "h-full rounded-full transition-all",
                  contextUsage > 0.8 ? "bg-red-500" : contextUsage > 0.5 ? "bg-yellow-500" : "bg-emerald-500"
                )} style={{ width: `${Math.min(contextUsage * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ===== PROMPT TAB ===== */}
        {activeTab === "prompt" && (
          <div className="space-y-4">
            {/* System prompt */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1.5 font-medium">
                Augmented system prompt ({debug.systemPrompt ? Math.ceil(debug.systemPrompt.length / 4).toLocaleString() : 0} est. tokens)
              </div>
              <div className="max-h-[70vh] overflow-y-auto prompt-prose">
                <ReactMarkdown>{debug.systemPrompt || "—"}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Primitives ---

function PanelHeader() {
  return (
    <div className="px-4 py-3 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Activity className="w-4 h-4" />
        LLM Control Room
      </h2>
    </div>
  );
}

function MetaCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-secondary rounded p-2">
      <div className="text-muted-foreground mb-0.5 text-[10px] uppercase tracking-widest">{label}</div>
      <div className={cn("text-foreground text-xs truncate", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function getActionLabel(action?: string) {
  switch (action) {
    case "bring_colleague": return "Handoff";
    case "step_out": return "Stepping out";
    case "none": return "Continue";
    default: return "—";
  }
}

function ToolCallDetail({ tool }: { tool: ToolCallType }) {
  const statusIcon = {
    success: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    error: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    skipped: <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />,
  };

  return (
    <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusIcon[tool.status]}
          <span className="text-sm font-medium text-foreground font-mono">{tool.name}</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider",
            tool.status === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : tool.status === "error" ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-secondary text-muted-foreground"
          )}>{tool.status}</span>
        </div>
        {tool.durationMs !== undefined && (
          <span className="text-xs text-muted-foreground font-mono">{tool.durationMs}ms</span>
        )}
      </div>
      {tool.description && (
        <p className="text-xs text-muted-foreground">{tool.description}</p>
      )}
      {tool.input && Object.keys(tool.input).length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 font-medium">Input args</div>
          <pre className="text-xs text-foreground/80 font-mono bg-secondary rounded px-2.5 py-1.5 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(tool.input, null, 2)}</pre>
        </div>
      )}
      {tool.output && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 font-medium">Return value</div>
          <pre className="text-xs text-foreground/80 font-mono bg-secondary rounded px-2.5 py-1.5 overflow-x-auto whitespace-pre-wrap">{(() => { try { return JSON.stringify(JSON.parse(tool.output), null, 2); } catch { return tool.output; } })()}</pre>
        </div>
      )}
    </div>
  );
}

function PipelineTimeline({ llmCalls, toolCalls }: { llmCalls: LLMCallInfo[]; toolCalls: ToolCallType[] }) {
  const isMultiCall = llmCalls.length > 1;

  if (!isMultiCall) {
    return (
      <div className="space-y-3">
        <LLMCallDetail call={llmCalls[0]} index={0} />
        {toolCalls.map((tool, idx) => (
          <ToolCallDetail key={idx} tool={tool} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <LLMCallDetail call={llmCalls[0]} index={0} />
      {toolCalls.map((tool, idx) => (
        <ToolCallDetail key={idx} tool={tool} />
      ))}
      <LLMCallDetail call={llmCalls[1]} index={1} />
    </div>
  );
}

function LLMCallDetail({ call, index }: { call: LLMCallInfo; index: number }) {
  const [showMessages, setShowMessages] = useState(false);

  return (
    <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-sm font-medium text-foreground">LLM Call #{index + 1}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
            {call.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{call.durationMs}ms</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-secondary rounded px-2 py-1.5">
          <div className="text-muted-foreground text-[10px] uppercase tracking-widest">Prompt</div>
          <div className="font-mono text-foreground">{call.promptTokens.toLocaleString()}</div>
        </div>
        <div className="bg-secondary rounded px-2 py-1.5">
          <div className="text-muted-foreground text-[10px] uppercase tracking-widest">Completion</div>
          <div className="font-mono text-foreground">{call.completionTokens.toLocaleString()}</div>
        </div>
        <div className="bg-secondary rounded px-2 py-1.5">
          <div className="text-muted-foreground text-[10px] uppercase tracking-widest">Total</div>
          <div className="font-mono text-foreground">{(call.promptTokens + call.completionTokens).toLocaleString()}</div>
        </div>
      </div>

      {call.toolResultTokens !== undefined && call.toolResultTokens > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Wrench className="w-3 h-3" />
          <span>Includes ~{call.toolResultTokens.toLocaleString()} tokens from tool results</span>
        </div>
      )}

      <button
        onClick={() => setShowMessages(!showMessages)}
        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        {showMessages ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {showMessages ? "Hide" : "View"} messages sent to LLM ({call.messages.length})
      </button>

      {showMessages && (
        <div className="space-y-2 mt-1">
          {call.messages.map((msg, i) => (
            <LLMMessageCard key={i} message={msg} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function LLMMessageCard({ message, index }: { message: { role: string; content: string | null }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const rawContent = message.content || "(empty)";

  // Pretty-print JSON for tool messages
  let content = rawContent;
  if (message.role === "tool" && rawContent !== "(empty)") {
    try {
      content = JSON.stringify(JSON.parse(rawContent), null, 2);
    } catch {
      content = rawContent;
    }
  }

  const isLong = content.length > 300;
  const displayContent = expanded || !isLong ? content : content.slice(0, 300) + "...";

  const roleBadgeClass: Record<string, string> = {
    system: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    user: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    assistant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tool: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="bg-secondary/70 rounded p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">#{index + 1}</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider",
            roleBadgeClass[message.role] || "bg-secondary text-muted-foreground"
          )}>{message.role}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">~{Math.ceil(rawContent.length / 4)} tokens</span>
      </div>
      <pre className="text-[11px] text-foreground/80 font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[400px] overflow-y-auto">{displayContent}</pre>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
          {expanded ? "Show less" : "Show full content"}
        </button>
      )}
    </div>
  );
}

function RagChunkCard({ chunk, index }: { chunk: { id: string; score: number; category: string; preview: string; fullText?: string }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = chunk.fullText && chunk.fullText.length > 100;

  return (
    <div className="bg-secondary/50 border border-purple-500/10 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">#{index + 1}</span>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-mono truncate">{chunk.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0",
            chunk.score >= 0.8 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : chunk.score >= 0.5 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
              : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
          )}>
            {(chunk.score * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">INJECTED</span>
        </div>
      </div>
      <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {expanded && chunk.fullText ? chunk.fullText : chunk.preview}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{chunk.category}</span>
        {hasMore && (
          <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline">
            {expanded ? "Show less" : "Show full text"}
          </button>
        )}
      </div>
    </div>
  );
}

function TokenBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: "blue" | "purple" | "amber" | "emerald";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = { blue: "bg-blue-500", purple: "bg-purple-500", amber: "bg-amber-500", emerald: "bg-emerald-500" };
  const textClasses = { blue: "text-blue-600 dark:text-blue-400", purple: "text-purple-600 dark:text-purple-400", amber: "text-amber-600 dark:text-amber-400", emerald: "text-emerald-600 dark:text-emerald-400" };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(textClasses[color], "font-mono text-[11px]")}>{value.toLocaleString()} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", colorClasses[color])} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}
