"use client";

import { useState } from "react";
import { X, Zap, Brain, ArrowRight, Database, ChevronDown, ChevronRight, Wrench, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageDebugInfo, ToolCall } from "@/lib/agents";

interface DebugSidebarProps {
  debug: MessageDebugInfo | null;
  messageContent: string;
  onClose: () => void;
}

export function DebugSidebar({ debug, messageContent, onClose }: DebugSidebarProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  if (!debug) return null;

  const getActionLabel = (action?: string) => {
    switch (action) {
      case "bring_colleague": return "Handoff triggered";
      case "step_out": return "Stepping out";
      case "none": return "Continue";
      default: return "—";
    }
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case "bring_colleague": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "step_out": return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      case "none": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const totalTokens = debug.tokenUsage?.totalTokens || 0;
  const breakdown = debug.tokenBreakdown;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-black/95 border-l border-white/10 z-50 flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            debug.agentId === "goody" ? "bg-emerald-400" : "bg-red-400"
          )} />
          <span className="font-medium text-white/90">Turn Debug</span>
          <span className={cn(
            "text-xs uppercase tracking-wider px-2 py-0.5 rounded",
            debug.agentId === "goody" ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
          )}>
            {debug.agentId}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Agent Decision */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5" />
            Decision
          </div>
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2",
            getActionColor(debug.action)
          )}>
            {debug.action !== "none" && <ArrowRight className="w-3.5 h-3.5" />}
            {getActionLabel(debug.action)}
          </div>
          {debug.transitionNote && (
            <div className="text-sm text-white/60 italic pl-1">
              "{debug.transitionNote}"
            </div>
          )}
        </div>

        {/* Tool Calls */}
        {debug.toolCalls && debug.toolCalls.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" />
              Tools Used ({debug.toolCalls.length})
            </div>
            <div className="space-y-2">
              {debug.toolCalls.map((tool, idx) => (
                <ToolCallItem key={idx} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* RAG Chunks - This is the key new info! */}
        {debug.ragEnabled && debug.ragChunks && debug.ragChunks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              RAG Context ({debug.ragChunks.length} chunks)
            </div>
            <div className="space-y-2">
              {debug.ragChunks.map((chunk, idx) => (
                <div 
                  key={chunk.id}
                  className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-purple-400 font-mono">
                      {chunk.id}
                    </span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      chunk.score >= 0.8 ? "bg-emerald-500/20 text-emerald-400" :
                      chunk.score >= 0.6 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-white/10 text-white/50"
                    )}>
                      {(chunk.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-white/60 leading-relaxed">
                    {chunk.preview}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">
                    {chunk.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!debug.ragEnabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              RAG Context
            </div>
            <div className="text-sm text-white/30 italic">
              No relevant chunks found
            </div>
          </div>
        )}

        {/* Token Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Token Usage ({totalTokens.toLocaleString()} total)
          </div>
          
          {breakdown && (
            <div className="space-y-1.5">
              <TokenBar 
                label="System Prompt" 
                value={breakdown.systemPromptTokens} 
                total={totalTokens}
                color="blue"
                constant
              />
              <TokenBar 
                label="RAG Context" 
                value={breakdown.ragContextTokens} 
                total={totalTokens}
                color="purple"
              />
              <TokenBar 
                label={`Conversation (${debug.messageCount || 0} msgs)`}
                value={breakdown.conversationTokens} 
                total={totalTokens}
                color="amber"
              />
              <TokenBar 
                label="Completion" 
                value={breakdown.completionTokens} 
                total={totalTokens}
                color="emerald"
              />
            </div>
          )}
          
          <div className="text-[10px] text-white/30 pt-1">
            ~${(totalTokens * 0.00000015).toFixed(5)} estimated
          </div>
        </div>

        {/* Expandable: Full System Prompt */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowFullPrompt(!showFullPrompt)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors w-full"
          >
            {showFullPrompt ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            System Prompt (with RAG)
          </button>
          {showFullPrompt && (
            <div className="mt-2 bg-white/[0.02] rounded-lg p-3 max-h-[300px] overflow-y-auto">
              <pre className="text-[11px] text-white/50 whitespace-pre-wrap font-mono leading-relaxed">
                {debug.systemPrompt || "—"}
              </pre>
            </div>
          )}
        </div>

        {/* Expandable: Conversation History */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors w-full"
          >
            {showFullHistory ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Full Conversation Sent ({debug.messageCount || 0} messages)
          </button>
          {showFullHistory && debug.conversationHistory && (
            <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto">
              {debug.conversationHistory.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "rounded-lg p-2 text-xs",
                    msg.role === "user" 
                      ? "bg-white/[0.03] border-l-2 border-white/20" 
                      : "bg-white/[0.02] border-l-2 border-red-500/20"
                  )}
                >
                  <div className="text-[10px] uppercase text-white/30 mb-0.5">
                    {msg.role}
                  </div>
                  <p className="text-white/60 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Constants (collapsed by default, rarely needed) */}
        <div className="border-t border-white/5 pt-4 text-[10px] text-white/20">
          Model: {debug.model} • Temp: {debug.temperature} • Max: {debug.maxTokens}
        </div>
      </div>
    </div>
  );
}

// Token breakdown bar
function TokenBar({ 
  label, 
  value, 
  total, 
  color,
  constant = false
}: { 
  label: string; 
  value: number; 
  total: number; 
  color: "blue" | "purple" | "amber" | "emerald";
  constant?: boolean;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  };

  const textClasses = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("text-white/60", constant && "text-white/40")}>
          {label}
          {constant && <span className="text-white/20 ml-1">(constant)</span>}
        </span>
        <span className={cn(textClasses[color], "font-mono text-[11px]")}>
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", colorClasses[color])}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Tool call item
function ToolCallItem({ tool }: { tool: ToolCall }) {
  const statusIcon = {
    success: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    error: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    skipped: <MinusCircle className="w-3.5 h-3.5 text-white/30" />,
  };

  const statusBg = {
    success: "bg-emerald-500/10 border-emerald-500/20",
    error: "bg-red-500/10 border-red-500/20",
    skipped: "bg-white/5 border-white/10",
  };

  const toolIcons: Record<string, string> = {
    suspect_lookup: "👤",
    rag_retrieval: "🔍",
    check_evidence: "📋",
    check_criminal_history: "📁",
    check_associates: "👥",
    verify_alibi: "🕐",
    calculate_sentence: "⚖️",
  };

  return (
    <div className={cn("rounded-lg border p-3", statusBg[tool.status])}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{toolIcons[tool.name] || "🔧"}</span>
          <div>
            <div className="text-xs font-medium text-white/80 font-mono">
              {tool.name}
            </div>
            <div className="text-[10px] text-white/40">
              {tool.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {tool.durationMs !== undefined && (
            <span className="text-[10px] text-white/30 font-mono">
              {tool.durationMs}ms
            </span>
          )}
          {statusIcon[tool.status]}
        </div>
      </div>
      
      {tool.input && Object.keys(tool.input).length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-white/30 mb-1">Input:</div>
          <div className="text-[11px] text-white/50 font-mono bg-black/20 rounded px-2 py-1">
            {JSON.stringify(tool.input)}
          </div>
        </div>
      )}
      
      {tool.output && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-white/30 mb-1">Output:</div>
          <div className="text-[11px] text-white/60 leading-relaxed">
            {tool.output}
          </div>
        </div>
      )}
    </div>
  );
}
