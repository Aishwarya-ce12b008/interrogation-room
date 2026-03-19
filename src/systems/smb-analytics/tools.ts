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
  months: { type: "number", description: "Number of months to look back. Either months OR start_date must be provided." },
  start_date: { type: "string", description: "Start date (YYYY-MM-DD). Either start_date OR months must be provided." },
  end_date: { type: "string", description: "End date (YYYY-MM-DD). Defaults to today if not provided." },
} as const;

// ─── Tool definitions (OpenAI function-calling format) ──────────────────────

export const analyticsTools = [
  {
    type: "function" as const,
    function: {
      name: "get_revenue_summary",
      description: "Get revenue summary including total sales, discount amounts, and invoice counts. Pass months or start_date/end_date for the desired range.",
      parameters: {
        type: "object",
        properties: {
          ...dateRangeParams,
          granularity: { type: "string", enum: ["daily", "weekly", "monthly"], description: "Time grouping. Auto-detected from date range if not specified." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_top_items",
      description: "Get top selling items ranked by revenue or quantity. Shows item name, category, revenue, quantity, and margin. Pass months or start_date/end_date for the desired range.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of items to return. Default 10." },
          sort_by: { type: "string", enum: ["revenue", "quantity"], description: "Sort by revenue or quantity. Default revenue." },
          ...dateRangeParams,
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_receivables_ageing",
      description: "Get outstanding receivables (unpaid sale invoices) bucketed by days overdue: 0-30, 30-60, 60-90, 90+ days. Also shows top debtors.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_payables_ageing",
      description: "Get outstanding payables (unpaid purchase invoices) bucketed by days overdue.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_expense_breakdown",
      description: "Get expenses broken down by category. Shows total per category and trend over time. Pass months or start_date/end_date for the desired range.",
      parameters: {
        type: "object",
        properties: {
          ...dateRangeParams,
          granularity: { type: "string", enum: ["daily", "weekly", "monthly"], description: "Time grouping. Auto-detected from date range if not specified." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_inventory_levels",
      description: "Get current inventory levels for all items. Shows quantity on hand, monthly sales velocity, days of stock remaining, and stock value in rupees.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_discount_trend",
      description: "Get trend of discounts as a percentage of revenue over time. Shows whether discounting is increasing or decreasing. Pass months or start_date/end_date for the desired range.",
      parameters: {
        type: "object",
        properties: {
          ...dateRangeParams,
          granularity: { type: "string", enum: ["daily", "weekly", "monthly"], description: "Time grouping. Auto-detected from date range if not specified." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_payment_timing",
      description: "Get payment timing analysis: DSO (days sales outstanding = how fast customers pay), DPO (days payable outstanding = how fast we pay suppliers), and per-supplier payment details vs credit terms.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_customer_activity",
      description: "Get customer purchase activity. Can look up a specific customer by name, or list customers filtered by status. Returns revenue, invoice count, last purchase date, outstanding amount, and activity status.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "Name (or partial name) of a specific customer to look up. Use this when discussing a particular customer." },
          status: { type: "string", enum: ["active", "slowing", "inactive"], description: "Filter by activity status. active = purchased in last 30 days, slowing = 30-60 days ago, inactive = 60+ days." },
          limit: { type: "number", description: "Max customers to return when browsing. Default 5. Ignored when customer_name is provided." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_party_ledger",
      description: "Get detailed transaction history for a specific customer or supplier. Returns their invoices with line items (what they bought/sold, quantities, amounts), payment status, and outstanding balance. Use this when the user asks about a specific party's purchases, orders, or history.",
      parameters: {
        type: "object",
        properties: {
          party_name: { type: "string", description: "Name (or partial name) of the customer or supplier." },
          type: { type: "string", enum: ["sale", "purchase"], description: "Invoice type: 'sale' for customer transactions, 'purchase' for supplier transactions. Default: sale." },
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
      description: "Get gross margin analysis by category and by individual item. Shows revenue, cost, and margin percentage. Pass months or start_date/end_date for the desired range.",
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
      description: "Get revenue and order patterns by day of week. Shows average daily revenue and order count for each day (Monday through Sunday). Pass months or start_date/end_date for the desired range.",
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
      description: "Get purchase price trends for key items. Shows how ingredient/procurement costs are changing and compares with current selling prices. Pass months or start_date/end_date for the desired range.",
      parameters: {
        type: "object",
        properties: {
          ...dateRangeParams,
          granularity: { type: "string", enum: ["daily", "weekly", "monthly"], description: "Time grouping. Auto-detected from date range if not specified." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_email",
      description: "Send an email to the merchant with insights, analysis, or action items. The merchant's email is already on file. Use markdown tables for comparisons and bullet points for insights.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Email subject line. Keep it short and specific, e.g. 'This week's margin alert' or 'Top 5 items — revenue breakdown'." },
          body: { type: "string", description: "Email body in markdown. Use '- ' bullets for insights, markdown tables (| col | col |) for comparisons/rankings, and **bold** for key numbers. Mix both for best readability." },
        },
        required: ["subject", "body"],
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
  if (!merchant?.id) return "Error: No merchant selected.";
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
      const subject = args.subject as string;
      const body = args.body as string;
      if (!subject || !body) return "Error: subject and body are required.";
      const result = await sendInsightEmail({
        to: merchant.email,
        merchantName: merchant.name,
        subject,
        body,
      });
      if (result.success) return "Email sent successfully.";
      return `Error sending email: ${result.error}`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
