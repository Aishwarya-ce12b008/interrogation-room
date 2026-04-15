import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Mock KPI data for the chargeback war room dashboard
  return NextResponse.json({
    success: true,
    kpis: [
      { label: "Win Rate", value: "68%", trend: "+4% vs last month" },
      { label: "Recovered", value: "₹4,25,000", trend: "₹12L this quarter" },
      { label: "Processed", value: "47", trend: "8 pending review" },
      { label: "Avg Confidence", value: "74%", trend: "Above threshold" },
      { label: "Avg Response", value: "4.2 hrs", trend: "Well within SLA" },
    ],
  });
}
