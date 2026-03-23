"use client";

import { useState, useEffect, useRef } from "react";
import { PipelineStep } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

interface InlineStepsProps {
  steps: PipelineStep[];
  isStreaming: boolean;
  onStepClick?: (stepId: string) => void;
}

export function InlineSteps({ steps, isStreaming, onStepClick }: InlineStepsProps) {
  const [expanded, setExpanded] = useState(true);
  const wasStreaming = useRef(isStreaming);

  useEffect(() => {
    if (wasStreaming.current && !isStreaming) {
      setExpanded(false);
    }
    wasStreaming.current = isStreaming;
  }, [isStreaming]);

  if (steps.length === 0) return null;

  const hasRunning = steps.some(s => s.status === "running");

  const totalDurationMs = steps.reduce((sum, s) => sum + (s.durationMs || 0), 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(1);

  const summary = hasRunning
    ? "Thinking..."
    : `Thought for ${totalDurationSec}s`;

  return (
    <div className="mb-0">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground/70 hover:text-muted-foreground transition-colors py-0.5"
      >
        {hasRunning ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span className="font-medium">{summary}</span>
      </button>

      {/* Timeline */}
      {expanded && (
        <div className="mt-0.5 ml-0.5">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const clickable = onStepClick && step.status !== "running";
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-baseline gap-2 group",
                  clickable && "cursor-pointer",
                )}
                onClick={() => clickable && onStepClick(step.id)}
              >
                <StepDot status={step.status} />

                {/* Content */}
                <div className={cn("pb-2 flex-1 min-w-0", isLast && "pb-0.5")}>
                  <span className={cn(
                    "text-[13px] leading-tight",
                    step.status === "running" ? "text-foreground/70" :
                    step.status === "done" ? "text-muted-foreground" :
                    "text-muted-foreground/50"
                  )}>
                    {step.label}
                  </span>
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
  const base = "w-1.5 h-1.5 rounded-full shrink-0 translate-y-[-1px]";

  switch (status) {
    case "running":
      return <div className={cn(base, "bg-muted-foreground/50 animate-pulse")} />;
    case "done":
      return <div className={cn(base, "bg-muted-foreground/40")} />;
    case "error":
      return <div className={cn(base, "bg-red-500/60")} />;
    case "skipped":
      return <div className={cn(base, "bg-muted-foreground/20")} />;
  }
}
