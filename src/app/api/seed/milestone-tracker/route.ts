import { NextResponse } from "next/server";
import { BABY_NAME, BABY_DOB } from "@/systems/milestone-tracker";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Milestone tracker ready. No seeding needed — entries are created as you go.",
    data: {
      baby: { name: BABY_NAME, dob: BABY_DOB.toISOString().split("T")[0] },
    },
  });
}
