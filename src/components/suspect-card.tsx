"use client";

import { AlertTriangle, History, Shield, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SuspectCardData {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  occupation: string;
  employer?: string;
  priorCount: number;
  currentCrime: string;
  caseAmount?: string;
  maxSentence: string;
}

interface SuspectCardProps {
  suspect: SuspectCardData;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  index?: number;
}

function getSeverity(maxSentence: string): "low" | "mid" | "high" | "extreme" {
  if (maxSentence.includes("Life") || maxSentence.includes("life")) return "extreme";
  const years = parseInt(maxSentence);
  if (years >= 10) return "high";
  if (years >= 5) return "mid";
  return "low";
}

const severityConfig = {
  low: {
    accent: "from-amber-400 to-orange-500",
    bg: "bg-amber-500/8 dark:bg-amber-500/5",
    selectedBg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-300/60 dark:border-amber-500/30",
    selectedBorder: "border-amber-400 dark:border-amber-400/50",
    ring: "ring-amber-400/30 dark:ring-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    label: "LOW",
    icon: Shield,
    dot: "bg-amber-400",
  },
  mid: {
    accent: "from-orange-400 to-red-500",
    bg: "bg-orange-500/8 dark:bg-orange-500/5",
    selectedBg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-300/60 dark:border-orange-500/30",
    selectedBorder: "border-orange-400 dark:border-orange-400/50",
    ring: "ring-orange-400/30 dark:ring-orange-500/20",
    text: "text-orange-700 dark:text-orange-400",
    label: "MED",
    icon: Zap,
    dot: "bg-orange-400",
  },
  high: {
    accent: "from-red-400 to-red-600",
    bg: "bg-red-500/8 dark:bg-red-500/5",
    selectedBg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-300/60 dark:border-red-500/30",
    selectedBorder: "border-red-400 dark:border-red-400/50",
    ring: "ring-red-400/30 dark:ring-red-500/20",
    text: "text-red-600 dark:text-red-400",
    label: "HIGH",
    icon: AlertTriangle,
    dot: "bg-red-500",
  },
  extreme: {
    accent: "from-red-500 to-rose-700",
    bg: "bg-red-500/8 dark:bg-red-500/5",
    selectedBg: "bg-red-50 dark:bg-red-950/15",
    border: "border-red-400/60 dark:border-red-500/30",
    selectedBorder: "border-red-500 dark:border-red-500/60",
    ring: "ring-red-500/30 dark:ring-red-500/25",
    text: "text-red-700 dark:text-red-400",
    label: "MAX",
    icon: Flame,
    dot: "bg-red-600",
  },
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export function SuspectCard({ suspect, selected, onClick, compact, index = 0 }: SuspectCardProps) {
  const severity = getSeverity(suspect.maxSentence);
  const config = severityConfig[severity];
  const SeverityIcon = config.icon;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ animationDelay: `${index * 50}ms` }}
        className={cn(
          "animate-float-in w-full text-left rounded-2xl transition-all duration-200 group overflow-hidden",
          "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5",
          "active:scale-[0.98] active:shadow-sm",
          selected
            ? cn("ring-2 shadow-md shadow-black/5 dark:shadow-black/20", config.selectedBg, config.selectedBorder, config.ring)
            : "bg-card border border-border hover:border-transparent"
        )}
      >
        {/* Severity accent strip */}
        <div className={cn("h-1 w-full bg-gradient-to-r", config.accent)} />

        <div className="p-4">
          {/* Avatar + Name row */}
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm tracking-wide transition-colors",
              selected
                ? cn("bg-gradient-to-br text-white", config.accent)
                : "bg-secondary text-muted-foreground group-hover:bg-gradient-to-br group-hover:text-white",
              !selected && cn("group-hover:" + config.accent.split(" ")[0])
            )}>
              <span className={cn(!selected && "group-hover:hidden")}>{getInitials(suspect.name)}</span>
              <span className={cn("hidden", !selected && "group-hover:inline")}>{getInitials(suspect.name)}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground text-[15px] leading-tight tracking-tight">{suspect.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>{suspect.age}y</span>
                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                <span>{suspect.city}</span>
              </div>
            </div>

            {/* Severity badge */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shrink-0",
              config.bg, config.text,
            )}>
              <SeverityIcon className="w-3 h-3" />
              {config.label}
            </div>
          </div>

          {/* Crime - the main attraction */}
          <div className={cn(
            "rounded-xl px-3 py-2.5 mb-3",
            selected ? "bg-white/60 dark:bg-white/5" : "bg-secondary/60 dark:bg-secondary/40"
          )}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 font-medium">Charged with</div>
            <div className={cn("text-sm font-semibold leading-snug", config.text)}>
              {suspect.currentCrime}
            </div>
            {suspect.caseAmount && (
              <div className="text-xs text-muted-foreground mt-0.5">{suspect.caseAmount}</div>
            )}
          </div>

          {/* Bottom meta row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">{suspect.occupation}</span>
            <div className="flex items-center gap-2">
              {suspect.priorCount > 0 ? (
                <div className="flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                  <History className="w-3 h-3" />
                  {suspect.priorCount} prior{suspect.priorCount > 1 ? "s" : ""}
                </div>
              ) : (
                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Clean
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Full card (used in chat view) - more like a dossier
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm dark:shadow-none mb-4">
      {/* Header band */}
      <div className={cn("h-1.5 bg-gradient-to-r", config.accent)} />
      <div className="bg-card p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 font-bold text-sm text-white tracking-wide",
              config.accent
            )}>
              {getInitials(suspect.name)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground tracking-tight">{suspect.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span>{suspect.age}y</span>
                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                <span>{suspect.gender}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                <span>{suspect.city}</span>
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shrink-0",
            config.bg, config.text,
          )}>
            <SeverityIcon className="w-3 h-3" />
            {config.label}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-secondary/50 dark:bg-secondary/30 rounded-xl px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5 font-medium">Charge</div>
            <div className={cn("font-semibold text-sm", config.text)}>
              {suspect.currentCrime}
              {suspect.caseAmount && <span className="text-muted-foreground font-normal text-xs ml-1">({suspect.caseAmount})</span>}
            </div>
          </div>
          <div className="bg-secondary/50 dark:bg-secondary/30 rounded-xl px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5 font-medium">Max sentence</div>
            <div className="font-semibold text-foreground text-sm">Up to {suspect.maxSentence}</div>
          </div>
          <div className="bg-secondary/50 dark:bg-secondary/30 rounded-xl px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5 font-medium">Occupation</div>
            <div className="text-foreground/80 text-sm">
              {suspect.occupation}
              {suspect.employer && <span className="text-muted-foreground"> at {suspect.employer}</span>}
            </div>
          </div>
          <div className="bg-secondary/50 dark:bg-secondary/30 rounded-xl px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5 font-medium">Record</div>
            <div className="text-sm">
              {suspect.priorCount > 0 ? (
                <span className="font-semibold text-red-600 dark:text-red-400">{suspect.priorCount} prior conviction{suspect.priorCount > 1 ? "s" : ""}</span>
              ) : (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Clean record</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
