"use client";

import { useState } from "react";
import { PipelineStep } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Check, Loader2, X, SkipForward } from "lucide-react";

interface InlineStepsProps {
  steps: PipelineStep[];
  isStreaming: boolean;
  onStepClick?: (stepId: string) => void;
}

export function InlineSteps({ steps, isStreaming, onStepClick }: InlineStepsProps) {
  const [expanded, setExpanded] = useState(true);

  if (steps.length === 0) return null;

  const hasRunning = steps.some(s => s.status === "running");
  const doneCount = steps.filter(s => s.status === "done").length;

  const summary = hasRunning
    ? steps.find(s => s.status === "running")?.label || "Processing..."
    : `${doneCount} step${doneCount !== 1 ? "s" : ""} completed`;

  return (
    <div className="mb-3">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        {hasRunning ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        ) : expanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <span className="font-medium">{summary}</span>
      </button>

      {/* Timeline */}
      {expanded && (
        <div className="mt-1">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const clickable = onStepClick && step.status !== "running";
            return (
              <div
                key={step.id}
                className={cn(
                  "flex gap-3 group",
                  clickable && "cursor-pointer",
                )}
                onClick={() => clickable && onStepClick(step.id)}
              >
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <StepDot status={step.status} />
                  {!isLast && (
                    <div className={cn(
                      "w-px flex-1 min-h-[16px]",
                      step.status === "done" ? "bg-emerald-500/20" :
                      step.status === "running" ? "bg-muted-foreground/15" :
                      "bg-border"
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className={cn("pb-3 flex-1 min-w-0", isLast && "pb-1")}>
                  <span className={cn(
                    "text-sm font-medium leading-tight",
                    step.status === "running" ? "text-foreground" :
                    step.status === "done" ? "text-muted-foreground" :
                    "text-muted-foreground/50"
                  )}>
                    {step.label}
                  </span>
                  {step.detail && (
                    <span className="text-sm ml-1.5 text-muted-foreground">
                      &middot; {step.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepDot({ status }: { status: PipelineStep["status"] }) {
  const base = "w-5 h-5 rounded-full flex items-center justify-center shrink-0";

  switch (status) {
    case "running":
      return (
        <div className={cn(base, "bg-muted")}>
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        </div>
      );
    case "done":
      return (
        <div className={cn(base, "bg-emerald-500/10")}>
          <Check className="w-3 h-3 text-emerald-500" />
        </div>
      );
    case "error":
      return (
        <div className={cn(base, "bg-red-500/10")}>
          <X className="w-3 h-3 text-red-500" />
        </div>
      );
    case "skipped":
      return (
        <div className={cn(base, "bg-secondary")}>
          <SkipForward className="w-3 h-3 text-muted-foreground/40" />
        </div>
      );
  }
}
