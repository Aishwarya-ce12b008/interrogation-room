import { NextRequest, NextResponse } from "next/server";
import { getDashboardKPIs } from "@/systems/smb-analytics/queries";
import { getMerchantById } from "@/systems/smb-analytics/data";

export async function GET(request: NextRequest) {
  const merchantCardId = request.nextUrl.searchParams.get("merchantId");

  if (!merchantCardId) {
    return NextResponse.json({ error: "merchantId query param required" }, { status: 400 });
  }

  try {
    const merchant = await getMerchantById(merchantCardId);
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found. Have you run the seed?" }, { status: 404 });
    }

    const kpis = await getDashboardKPIs(merchant.id);
    return NextResponse.json({ success: true, merchantName: merchant.name, kpis });
  } catch (error) {
    console.error("Dashboard KPI error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
