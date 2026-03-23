import { NextRequest } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { generateWeeklyComparison, type WeeklyComparison } from "@/systems/smb-analytics/queries";
import { sendWeeklyEmail } from "@/systems/smb-analytics/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUSINESS_EMAIL = "aishy.savi@gmail.com";

function buildSummaryPrompt(businessName: string, businessType: string, comparison: WeeklyComparison): string {
  const weekLabel = `${comparison.thisWeek.startDate} to ${comparison.thisWeek.endDate}`;

  return `You're writing a weekly email for ${businessName}, a ${businessType} business.
This covers the week of ${weekLabel}, compared to the previous week.

Here's the data:
${JSON.stringify(comparison, null, 2)}

Write exactly 5-7 bullet points. Each bullet must:
- Start with a specific metric or finding (₹ amounts, percentages, item names)
- Be 1-2 lines max
- Be actionable where possible — tell them what to do or what to watch

Tone: direct, warm, professional. No jargon. Use ₹ with lakhs (L) and thousands (K).

Return ONLY the bullet points, one per line, each starting with "- ". No greeting, no sign-off, no extra text.`;
}

async function generateEmailBullets(
  openai: OpenAI,
  merchantName: string,
  businessType: string,
  comparison: WeeklyComparison
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You write concise, actionable business insight bullets for small and mid-sized businesses. Output only bullet points." },
      { role: "user", content: buildSummaryPrompt(merchantName, businessType, comparison) },
    ],
    max_tokens: 512,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "";
  return content
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("- "))
    .map(line => line.slice(2).trim());
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const { data: businesses, error: dbError } = await supabase
    .from("merchants")
    .select("id, name, business_type, business_vertical");

  if (dbError || !businesses?.length) {
    return Response.json({ error: "No businesses found", detail: dbError?.message }, { status: 500 });
  }

  const results: { business: string; status: string; error?: string }[] = [];

  for (const biz of businesses) {
    try {
      const comparison = await generateWeeklyComparison(biz.id);

      if (comparison.revenue.thisWeek === 0 && comparison.revenue.lastWeek === 0) {
        results.push({ business: biz.name, status: "skipped", error: "No revenue data" });
        continue;
      }

      const bullets = await generateEmailBullets(openai, biz.name, biz.business_type, comparison);

      if (bullets.length === 0) {
        results.push({ business: biz.name, status: "skipped", error: "LLM returned no bullets" });
        continue;
      }

      const weekLabel = `${comparison.thisWeek.startDate} to ${comparison.thisWeek.endDate}`;
      const result = await sendWeeklyEmail({
        to: BUSINESS_EMAIL,
        merchantName: biz.name,
        weekRange: weekLabel,
        bullets,
      });

      results.push({
        business: biz.name,
        status: result.success ? "sent" : "failed",
        error: result.error,
      });
    } catch (err) {
      results.push({
        business: biz.name,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return Response.json({ results, timestamp: new Date().toISOString() });
}
