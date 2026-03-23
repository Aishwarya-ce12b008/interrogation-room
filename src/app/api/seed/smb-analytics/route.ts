import { NextResponse } from "next/server";
import { seedAll } from "@/systems/smb-analytics/seed";

export async function POST() {
  try {
    const merchants = await seedAll();
    return NextResponse.json({
      success: true,
      message: `Seeded ${merchants.length} businesses with 6 months of data.`,
      merchants: merchants.map(m => ({ id: m.id, name: m.name, business_type: m.business_type, business_vertical: m.business_vertical, city: m.city })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
