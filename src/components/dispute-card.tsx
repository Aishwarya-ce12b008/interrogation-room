"use client";

import { cn } from "@/lib/utils";
import { Shield, Clock, AlertTriangle } from "lucide-react";
import type { DisputeCardData } from "@/systems/chargeback-war-room/types";

export type { DisputeCardData };

interface DisputeCardProps {
  dispute: DisputeCardData;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
}

function getUrgency(respondBy: string): { label: string; color: string; badgeColor: string } {
  const daysLeft = Math.ceil(
    (new Date(respondBy).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: "text-red-500", badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: "text-amber-500", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: `${daysLeft}d left`, color: "text-green-500", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
}

function formatAmountINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

const networkColors: Record<string, string> = {
  visa: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  mastercard: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function DisputeCard({ dispute, selected, onClick, index = 0 }: DisputeCardProps) {
  const urgency = getUrgency(dispute.respond_by);
  const isUrgent = urgency.color === "text-red-500";

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
          ? "ring-2 shadow-md shadow-black/5 dark:shadow-black/20 bg-purple-50 dark:bg-purple-950/20 border-purple-400 dark:border-purple-400/50 ring-purple-400/30 dark:ring-purple-500/20"
          : "bg-card border border-border hover:border-transparent"
      )}
    >
      <div className={cn(
        "h-1 w-full",
        isUrgent ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-gradient-to-r from-purple-400 to-purple-600"
      )} />

      <div className="p-4">
        {/* Header: amount + urgency */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-foreground tracking-tight">
            {formatAmountINR(dispute.amount)}
          </span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1", urgency.badgeColor)}>
            {isUrgent ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {urgency.label}
          </span>
        </div>

        {/* Merchant + dispute ID */}
        <div className="mb-2">
          <div className="font-semibold text-foreground text-[15px] leading-tight tracking-tight">
            {dispute.merchant_name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">
            {dispute.razorpay_dispute_id}
          </div>
        </div>

        {/* Reason code + network badges */}
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full uppercase", networkColors[dispute.network] || networkColors.visa)}>
            {dispute.network}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {dispute.reason_code}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {dispute.reason_description}
        </p>
      </div>
    </button>
  );
}
