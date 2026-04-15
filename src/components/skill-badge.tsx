"use client";

import { MessageDebugInfo } from "@/lib/agents";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  debug: MessageDebugInfo;
  onBadgeClick?: (section: string) => void;
}

export function SkillBadges({ debug, onBadgeClick }: SkillBadgeProps) {
  const badges: Array<{
    key: string;
    label: string;
    icon: string;
    section: string;
    color: string;
  }> = [];

  const goodyTools = new Set(["offer_deal", "share_similar_case", "offer_comfort"]);
  const baddyTools = new Set(["threaten_arrest_associate", "read_victim_impact", "show_time_pressure"]);

  if (debug.toolCalls && debug.toolCalls.length > 0) {
    debug.toolCalls.forEach((tool) => {
      const isKnowledgeBase = tool.name === "search_knowledge_base";
      const isGoodyExclusive = goodyTools.has(tool.name);
      const isBaddyExclusive = baddyTools.has(tool.name);

      let icon = "\u{1F527}"; // wrench
      let color = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

      if (isKnowledgeBase) {
        badges.push({
          key: `rag-${tool.name}`,
          label: "RAG",
          icon: "\u{1F4DA}",
          section: "rag",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        });
        return;
      } else if (isGoodyExclusive) {
        icon = "\u{1F49A}"; // green heart
        color = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      } else if (isBaddyExclusive) {
        icon = "\u{1F525}"; // fire
        color = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      }

      badges.push({
        key: `tool-${tool.name}`,
        label: tool.description || tool.name.replace(/_/g, " "),
        icon,
        section: "tools",
        color,
      });
    });
  }

  if (debug.action === "bring_colleague" || debug.action === "step_out") {
    badges.push({
      key: "handoff",
      label: "Handoff",
      icon: "\u2194",
      section: "agent",
      color:
        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((badge) => (
        <button
          key={badge.key}
          onClick={() => onBadgeClick?.(badge.section)}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors hover:opacity-80",
            badge.color
          )}
        >
          <span>{badge.icon}</span>
          {badge.label}
        </button>
      ))}
    </div>
  );
}
