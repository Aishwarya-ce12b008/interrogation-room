import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}
const FROM_EMAIL = process.env.EMAIL_FROM || "SMB Advisor <onboarding@resend.dev>";

function applyInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>");
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
}

function markdownTableToHtml(tableLines: string[]): string {
  if (tableLines.length < 2) return tableLines.map(l => `<p style="margin:12px 0;font-size:14px;color:#475569;">${applyInlineFormatting(l)}</p>`).join("\n");

  const headerLine = tableLines[0];
  const dataLines = tableLines.filter((_, i) => i > 0 && !isTableSeparator(tableLines[i]));

  const headers = parseTableRow(headerLine);
  const rows = dataLines.map(l => parseTableRow(l));

  const thCells = headers.map(h =>
    `<th style="padding:10px 14px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">${applyInlineFormatting(h)}</th>`
  ).join("");

  const trRows = rows.map((row, ri) => {
    const bgColor = ri % 2 === 0 ? "#ffffff" : "#f8fafc";
    const cells = row.map((cell, ci) => {
      const isFirstCol = ci === 0;
      const fontWeight = isFirstCol ? "font-weight:600;color:#334155;" : "color:#475569;";
      return `<td style="padding:10px 14px;font-size:14px;${fontWeight}border-bottom:1px solid #f1f5f9;">${applyInlineFormatting(cell)}</td>`;
    }).join("");
    return `<tr style="background:${bgColor};">${cells}</tr>`;
  }).join("\n");

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
  <thead><tr style="background:#f8fafc;">${thCells}</tr></thead>
  <tbody>${trRows}</tbody>
</table>`;
}

function markdownToHtml(body: string): string {
  const lines = body.split("\n");
  const htmlParts: string[] = [];
  let inList = false;
  let tableBuffer: string[] = [];

  function flushTable() {
    if (tableBuffer.length > 0) {
      htmlParts.push(markdownTableToHtml(tableBuffer));
      tableBuffer = [];
    }
  }

  function flushList() {
    if (inList) { htmlParts.push("</ul>"); inList = false; }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushTable();
      flushList();
      continue;
    }

    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isTableLine) {
      flushList();
      tableBuffer.push(trimmed);
      continue;
    }

    flushTable();

    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      if (!inList) { htmlParts.push('<ul style="padding-left:0;margin:16px 0;list-style:none;">'); inList = true; }
      htmlParts.push(`<li style="padding:10px 16px;margin-bottom:8px;background:#f8fafc;border-radius:8px;border-left:3px solid #22c55e;font-size:14px;line-height:1.6;color:#334155;">${applyInlineFormatting(bulletMatch[1])}</li>`);
    } else {
      flushList();
      htmlParts.push(`<p style="margin:12px 0;font-size:14px;line-height:1.6;color:#475569;">${applyInlineFormatting(trimmed)}</p>`);
    }
  }

  flushTable();
  flushList();
  return htmlParts.join("\n");
}

function buildEmailHtml(merchantName: string, subject: string, bodyHtml: string): string {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 32px;">
      <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">SMB Analytics Advisor</p>
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;line-height:1.3;">${subject}</h1>
      <p style="margin:8px 0 0;color:#64748b;font-size:13px;">${merchantName} &middot; ${today}</p>
    </div>

    <!-- Greeting -->
    <div style="padding:24px 32px 0;">
      <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">Hi there,</p>
      <p style="margin:8px 0 0;font-size:14px;color:#64748b;line-height:1.6;">Here's a quick look at the numbers for <strong style="color:#334155;">${merchantName}</strong>. Key highlights below:</p>
    </div>

    <!-- Body -->
    <div style="padding:8px 32px 24px;">
      ${bodyHtml}
    </div>

    <!-- CTA hint -->
    <div style="padding:0 32px 24px;">
      <div style="padding:14px 18px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
        <p style="margin:0;font-size:13px;color:#166534;line-height:1.5;">Have questions about these numbers? Just reply to your advisor in the chat — happy to dig deeper into any of these.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
      <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">Sent by your SMB Analytics Advisor &middot; Powered by AI</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendInsightEmail(opts: {
  to: string;
  merchantName: string;
  subject: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const bodyHtml = markdownToHtml(opts.body);
    const html = buildEmailHtml(opts.merchantName, opts.subject, bodyHtml);

    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendWeeklyEmail(opts: {
  to: string;
  merchantName: string;
  weekRange: string;
  bullets: string[];
}): Promise<{ success: boolean; error?: string }> {
  const subject = `Weekly Summary — ${opts.weekRange}`;
  const body = opts.bullets.map(b => `- ${b}`).join("\n");
  return sendInsightEmail({ to: opts.to, merchantName: opts.merchantName, subject, body });
}
