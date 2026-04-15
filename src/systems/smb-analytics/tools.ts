import {
  queryRevenueSummary,
  queryTopItems,
  queryReceivablesAgeing,
  queryPayablesAgeing,
  queryExpenseBreakdown,
  queryInventoryLevels,
  queryDiscountTrend,
  queryPaymentTiming,
  queryCustomerActivity,
  queryPartyLedger,
  queryMarginAnalysis,
  queryDailyPatterns,
  queryPriceTrends,
  resolveDateRange,
  type DateRangeOpts,
} from "./queries";
import { sendInsightEmail } from "./email";
import type { Merchant } from "./types";

// ─── Shared date-range params for tool definitions ──────────────────────────

const dateRangeParams = {
  months: { type: "number", description: "Months to look back (alternative to start_date)." },
  start_date: { type: "string", description: "YYYY-MM-DD (alternative to months)." },
  end_date: { type: "string", description: "YYYY-MM-DD. Defaults to today." },
} as const;

// ─── Tool definitions (OpenAI function-calling format) ──────────────────────

const granularityParam = { type: "string", enum: ["daily", "weekly", "monthly"], description: "Time grouping. Auto-detected if omitted." } as const;

export const analyticsTools = [
  {
    type: "function" as const,
    function: {
      name: "get_revenue_summary",
      description: "Revenue totals, discounts, and invoice counts for a period.",
      parameters: {
        type: "object",
        properties: { ...dateRangeParams, granularity: granularityParam },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_top_items",
      description: "Top selling items with revenue, quantity, and margin.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Items to return. Default 10." },
          sort_by: { type: "string", enum: ["revenue", "quantity"], description: "Default revenue." },
          ...dateRangeParams,
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_receivables_ageing",
      description: "Unpaid sale invoices bucketed by days overdue, with top debtors.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_payables_ageing",
      description: "Unpaid purchase invoices bucketed by days overdue.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_expense_breakdown",
      description: "Expenses by category with trends over time.",
      parameters: {
        type: "object",
        properties: { ...dateRangeParams, granularity: granularityParam },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_inventory_levels",
      description: "Current stock levels, sales velocity, days remaining, and value.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_discount_trend",
      description: "Discount as % of revenue over time — trending up or down.",
      parameters: {
        type: "object",
        properties: { ...dateRangeParams, granularity: granularityParam },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_payment_timing",
      description: "DSO, DPO, and per-supplier payment timing vs credit terms.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_customer_activity",
      description: "Customer purchase activity — lookup by name or filter by status.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "Name or partial name of a customer." },
          status: { type: "string", enum: ["active", "slowing", "inactive"], description: "active=30d, slowing=30-60d, inactive=60d+." },
          limit: { type: "number", description: "Max results. Default 5." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_party_ledger",
      description: "Transaction history for a customer/supplier with line items and payment status.",
      parameters: {
        type: "object",
        properties: {
          party_name: { type: "string", description: "Customer or supplier name." },
          type: { type: "string", enum: ["sale", "purchase"], description: "Default: sale." },
          ...dateRangeParams,
        },
        required: ["party_name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_margin_analysis",
      description: "Gross margins by category and item — revenue, cost, margin %.",
      parameters: {
        type: "object",
        properties: { ...dateRangeParams },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_daily_patterns",
      description: "Revenue and order count patterns by day of week.",
      parameters: {
        type: "object",
        properties: { ...dateRangeParams },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_price_trends",
      description: "Purchase/procurement price trends vs current selling prices.",
      parameters: {
        type: "object",
        properties: { ...dateRangeParams, granularity: granularityParam },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_email",
      description: "Email insights. Defaults to the business owner; pass 'to' to override.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email. Optional — defaults to the business owner. Use when the user specifies a different email." },
          subject: { type: "string", description: "Short, specific subject line." },
          body: { type: "string", description: "Markdown body — bullets for insights, tables for comparisons." },
        },
        required: ["subject", "body"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "book_calendar_event",
      description: "Create a Google Calendar event and send invites. Use when the user asks to schedule/book a meeting, call, or discussion.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title." },
          start_datetime: { type: "string", description: "ISO 8601 start time, e.g. 2025-03-25T15:00:00+05:30. Use Today's date from context to resolve relative dates like 'tomorrow'." },
          duration_minutes: { type: "number", description: "Duration in minutes. Default 30." },
          attendees: {
            type: "array",
            items: { type: "string" },
            description: "Email addresses of attendees. Ask the user if not provided.",
          },
          description: { type: "string", description: "Event description — include relevant context from the conversation." },
          location: { type: "string", description: "Optional meeting location or video call link." },
        },
        required: ["title", "start_datetime", "attendees"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_knowledge_base",
      description: "Search the business knowledge base for policies, store info, owner details, return/cancellation/warranty terms, and other non-numerical business information.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "What to look up — e.g. 'return policy', 'who is the owner', 'delivery terms', 'warranty'." },
        },
        required: ["query"],
      },
    },
  },
];

export function getToolsForAgent(): typeof analyticsTools {
  return analyticsTools;
}

// ─── Tool executor ──────────────────────────────────────────────────────────

function fmt(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

const DATE_RANGE_ERROR = "Error: No time period specified. You must pass start_date/end_date or months. Ask the user what time period they want to look at.";

function resolveOrError(args: Record<string, unknown>): { startDate: string; endDate: string } | null {
  const opts: DateRangeOpts = {
    months: args.months as number | undefined,
    startDate: args.start_date as string | undefined,
    endDate: args.end_date as string | undefined,
  };
  return resolveDateRange(opts);
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: unknown
): Promise<string> {
  const merchant = context as Merchant | undefined;
  if (!merchant?.id) return "Error: No business selected.";
  const merchantId = merchant.id;

  switch (name) {
    case "get_revenue_summary": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      return fmt(await queryRevenueSummary(merchantId, range, args.granularity as string | undefined));
    }
    case "get_top_items": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      const limit = (args.limit as number) || 10;
      const sortBy = (args.sort_by as "revenue" | "quantity") || "revenue";
      return fmt(await queryTopItems(merchantId, limit, sortBy, range));
    }
    case "get_receivables_ageing": {
      return fmt(await queryReceivablesAgeing(merchantId));
    }
    case "get_payables_ageing": {
      return fmt(await queryPayablesAgeing(merchantId));
    }
    case "get_expense_breakdown": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      return fmt(await queryExpenseBreakdown(merchantId, range, args.granularity as string | undefined));
    }
    case "get_inventory_levels": {
      return fmt(await queryInventoryLevels(merchantId));
    }
    case "get_discount_trend": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      return fmt(await queryDiscountTrend(merchantId, range, args.granularity as string | undefined));
    }
    case "get_payment_timing": {
      return fmt(await queryPaymentTiming(merchantId));
    }
    case "get_customer_activity": {
      return fmt(await queryCustomerActivity(merchantId, {
        customerName: args.customer_name as string | undefined,
        status: args.status as "active" | "slowing" | "inactive" | undefined,
        limit: (args.limit as number) || 5,
      }));
    }
    case "get_party_ledger": {
      const partyName = args.party_name as string;
      if (!partyName) return "Error: party_name is required.";
      const range = resolveOrError(args);
      const invoiceType = (args.type as "sale" | "purchase") || "sale";
      return fmt(await queryPartyLedger(merchantId, partyName, invoiceType, range));
    }
    case "get_margin_analysis": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      return fmt(await queryMarginAnalysis(merchantId, range));
    }
    case "get_daily_patterns": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      return fmt(await queryDailyPatterns(merchantId, range));
    }
    case "get_price_trends": {
      const range = resolveOrError(args);
      if (!range) return DATE_RANGE_ERROR;
      return fmt(await queryPriceTrends(merchantId, range, args.granularity as string | undefined));
    }
    case "send_email": {
      const to = (args.to as string) || merchant.email;
      const subject = args.subject as string;
      const body = args.body as string;
      if (!subject || !body) return "Error: subject and body are required.";
      const result = await sendInsightEmail({
        to,
        merchantName: merchant.name,
        subject,
        body,
        fallbackTo: merchant.email,
      });
      if (result.success) {
        if (result.sentTo !== to) {
          return `Email sent successfully to ${result.sentTo} (redirected from ${to} due to email provider restrictions).`;
        }
        return `Email sent successfully to ${result.sentTo}.`;
      }
      return `Error sending email: ${result.error}`;
    }
    case "book_calendar_event": {
      const title = args.title as string;
      const startDatetime = args.start_datetime as string;
      const durationMinutes = (args.duration_minutes as number) || 30;
      const attendees = args.attendees as string[];
      const description = (args.description as string) || "";
      const location = (args.location as string) || "";

      if (!title || !startDatetime || !attendees?.length) {
        return "Error: title, start_datetime, and at least one attendee email are required.";
      }

      const start = new Date(startDatetime);
      if (isNaN(start.getTime())) {
        return "Error: Invalid start_datetime format. Use ISO 8601, e.g. 2025-03-25T15:00:00+05:30.";
      }

      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      const fmtCal = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(title)}` +
        `&dates=${fmtCal(start)}/${fmtCal(end)}` +
        `&details=${encodeURIComponent(description)}` +
        (location ? `&location=${encodeURIComponent(location)}` : "") +
        `&add=${attendees.map(e => encodeURIComponent(e)).join(",")}`;

      const dayStr = start.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
      const timeStr = start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

      return fmt({
        success: true,
        event: { title, date: dayStr, time: timeStr, duration_minutes: durationMinutes, attendees, description, location },
        calendar_url: calUrl,
        message: `Calendar event "${title}" ready for ${dayStr} at ${timeStr} (${durationMinutes} min). Attendees: ${attendees.join(", ")}.`,
      });
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
