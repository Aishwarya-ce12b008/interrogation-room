"use client";

import { cn } from "@/lib/utils";
import { AgentId, MessageDebugInfo } from "@/lib/agents";
import { SkillBadges } from "@/components/skill-badge";
import { Eye } from "lucide-react";

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

  if (isTransition) return null;

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
            ? "bg-secondary text-secondary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        )}
      >
        {!isUser && agent && (
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                agent === "goody" ? "bg-emerald-500" : "bg-red-500"
              )} />
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-widest",
                  agent === "goody"
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {agent === "goody" ? "Goody" : "Baddy"}
              </span>
            </div>
            {debug && onOpenDebug && (
              <button
                onClick={onOpenDebug}
                className="p-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                title="View debug info"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse rounded-full" />
          )}
        </p>

        {!isUser && debug && !isStreaming && (
          <SkillBadges debug={debug} />
        )}
      </div>
    </div>
  );
}
