"use client";

import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import type { MerchantCardData } from "@/systems/smb-analytics/types";

export type { MerchantCardData };

interface MerchantCardProps {
  merchant: MerchantCardData;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
}

const colorConfig: Record<string, {
  accent: string;
  selectedBg: string;
  selectedBorder: string;
  ring: string;
  iconBg: string;
}> = {
  blue: {
    accent: "from-blue-400 to-blue-600",
    selectedBg: "bg-blue-50 dark:bg-blue-950/20",
    selectedBorder: "border-blue-400 dark:border-blue-400/50",
    ring: "ring-blue-400/30 dark:ring-blue-500/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  purple: {
    accent: "from-purple-400 to-purple-600",
    selectedBg: "bg-purple-50 dark:bg-purple-950/20",
    selectedBorder: "border-purple-400 dark:border-purple-400/50",
    ring: "ring-purple-400/30 dark:ring-purple-500/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
  },
  amber: {
    accent: "from-amber-400 to-amber-600",
    selectedBg: "bg-amber-50 dark:bg-amber-950/20",
    selectedBorder: "border-amber-400 dark:border-amber-400/50",
    ring: "ring-amber-400/30 dark:ring-amber-500/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
  },
  green: {
    accent: "from-green-400 to-green-600",
    selectedBg: "bg-green-50 dark:bg-green-950/20",
    selectedBorder: "border-green-400 dark:border-green-400/50",
    ring: "ring-green-400/30 dark:ring-green-500/20",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
};

export function MerchantCard({ merchant, selected, onClick, index = 0 }: MerchantCardProps) {
  const colors = colorConfig[merchant.color] || colorConfig.blue;

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
          ? cn("ring-2 shadow-md shadow-black/5 dark:shadow-black/20", colors.selectedBg, colors.selectedBorder, colors.ring)
          : "bg-card border border-border hover:border-transparent"
      )}
    >
      <div className={cn("h-1 w-full bg-gradient-to-r", colors.accent)} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl",
            selected ? cn("bg-gradient-to-br text-white", colors.accent) : colors.iconBg,
          )}>
            {merchant.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground text-[15px] leading-tight tracking-tight">{merchant.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>{merchant.city}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
              <span className="capitalize">{merchant.business_type}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{merchant.description}</p>
      </div>
    </button>
  );
}
