"use client";

import { cn } from "@/lib/utils";
import { AgentId, MessageDebugInfo } from "@/lib/agents";
import { Info } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
  isTransition?: boolean;
  debug?: MessageDebugInfo;
  isStreaming?: boolean;
  onOpenDebug?: () => void;
}

export function ChatMessage({ role, content, agent, isTransition, debug, isStreaming, onOpenDebug }: ChatMessageProps) {
  const isUser = role === "user";

  if (isTransition) {
    return (
      <div className="flex justify-center py-3">
        <p className="text-sm text-muted-foreground/60 italic max-w-md text-center">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-card border border-border"
        )}
      >
        {!isUser && agent && (
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div
              className={cn(
                "text-xs font-medium uppercase tracking-widest",
                agent === "goody"
                  ? "text-emerald-500/80"
                  : "text-red-400/80"
              )}
            >
              {agent === "goody" ? "Goody" : "Baddy"}
            </div>
            {debug && onOpenDebug && (
              <button
                onClick={onOpenDebug}
                className="p-1 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                title="View debug info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}
