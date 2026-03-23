"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { AgentId, MessageDebugInfo } from "@/lib/agents";
import { SkillBadges } from "@/components/skill-badge";
import { Eye } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
  agentName?: string;
  isTransition?: boolean;
  debug?: MessageDebugInfo;
  isStreaming?: boolean;
  onOpenDebug?: () => void;
  onBadgeClick?: (section: string) => void;
}

export function ChatMessage({ role, content, agent, agentName, isTransition, debug, isStreaming, onOpenDebug, onBadgeClick }: ChatMessageProps) {
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
          "relative",
          isUser
            ? "max-w-[80%] rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground rounded-br-md"
            : "max-w-[80%] py-2"
        )}
      >
        {!isUser && agent && (
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-widest",
                agent === "goody"
                  ? "text-emerald-600 dark:text-emerald-500"
                  : agent === "baddy"
                  ? "text-red-600 dark:text-red-400"
                  : "text-purple-600 dark:text-purple-400"
              )}
            >
              {agentName || agent}
            </span>
            {debug && onOpenDebug && (
              <button
                onClick={onOpenDebug}
                className="p-1 rounded-lg text-muted-foreground/20 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                title="View debug info"
              >
                <Eye className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <div className="text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-blockquote:my-2 prose-table:my-2 prose-th:px-3 prose-th:py-1.5 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:uppercase prose-th:tracking-wider prose-th:text-muted-foreground prose-td:px-3 prose-td:py-1.5 prose-td:text-sm prose-thead:border-b prose-thead:border-border prose-tr:border-b prose-tr:border-border/50">
          {isUser ? (
            <p className="whitespace-pre-wrap m-0">{content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse rounded-full" />
          )}
        </div>

        {!isUser && debug && !isStreaming && (
          <SkillBadges debug={debug} onBadgeClick={onBadgeClick} />
        )}
      </div>
    </div>
  );
}
