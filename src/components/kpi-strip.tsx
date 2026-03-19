"use client";

import { useEffect, useState } from "react";
import { IndianRupee, AlertCircle, TrendingUp, Package, Wallet } from "lucide-react";
import type { KPIDashboard } from "@/systems/smb-analytics/types";

interface KpiStripProps {
  merchantCardId: string;
  apiEndpoint: string;
}

function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString("en-IN");
}

export function KpiStrip({ merchantCardId, apiEndpoint }: KpiStripProps) {
  const [kpis, setKpis] = useState<KPIDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiEndpoint}?merchantId=${merchantCardId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setKpis(data.kpis);
        } else {
          setError(data.error || "Failed to load KPIs");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [merchantCardId, apiEndpoint]);

  if (error) {
    return (
      <div className="px-6 py-2 border-b border-border">
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }

  const items = [
    {
      label: "Revenue (30d)",
      value: kpis ? `₹${formatCurrency(kpis.totalRevenue)}` : "—",
      icon: IndianRupee,
    },
    {
      label: "Receivables",
      value: kpis ? `₹${formatCurrency(kpis.outstandingReceivables)}` : "—",
      icon: AlertCircle,
    },
    {
      label: "Top Item",
      value: kpis ? (kpis.topSellingItem.length > 22 ? kpis.topSellingItem.slice(0, 20) + "…" : kpis.topSellingItem) : "—",
      icon: Package,
    },
    {
      label: "Gross Margin",
      value: kpis ? `${kpis.grossMarginPercent}%` : "—",
      icon: TrendingUp,
    },
    {
      label: "Cash in Hand",
      value: kpis ? `₹${formatCurrency(kpis.cashInHand)}` : "—",
      icon: Wallet,
      negative: kpis ? kpis.cashInHand < 0 : false,
    },
  ];

  return (
    <div className="px-4 py-2.5 border-b border-border bg-card/50">
      <div className="flex items-center gap-3 overflow-x-auto">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-secondary/50 min-w-fit"
          >
            <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium leading-none mb-0.5">
                {item.label}
              </div>
              <div className={`text-sm font-semibold leading-none ${loading ? "animate-pulse text-muted-foreground" : "negative" in item && item.negative ? "text-red-500" : "text-foreground"}`}>
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
