import { supabase } from "@/lib/supabase";

// ─── Date range helper ──────────────────────────────────────────────────────

export interface DateRangeOpts {
  months?: number;
  startDate?: string;
  endDate?: string;
}

export function resolveDateRange(opts: DateRangeOpts): { startDate: string; endDate: string } | null {
  const endDate = opts.endDate || new Date().toISOString().split("T")[0];
  if (opts.startDate) return { startDate: opts.startDate, endDate };
  if (opts.months) {
    const start = new Date();
    start.setMonth(start.getMonth() - opts.months);
    return { startDate: start.toISOString().split("T")[0], endDate };
  }
  return null;
}

// ─── Time bucketing ─────────────────────────────────────────────────────────

export type Granularity = "daily" | "weekly" | "monthly";

export function resolveGranularity(startDate: string, endDate: string, override?: string): Granularity {
  if (override && ["daily", "weekly", "monthly"].includes(override)) return override as Granularity;
  const span = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (span < 14) return "daily";
  if (span <= 60) return "weekly";
  return "monthly";
}

function getISOWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

function formatWeekLabel(mondayStr: string): string {
  const mon = new Date(mondayStr + "T00:00:00");
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const fmt = (d: Date) => `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`;
  return `${fmt(mon)}-${fmt(sun)}`;
}

export function timeBucketKey(dateStr: string, granularity: Granularity): string {
  switch (granularity) {
    case "daily":
      return dateStr;
    case "weekly":
      return formatWeekLabel(getISOWeekStart(dateStr));
    case "monthly":
      return dateStr.substring(0, 7);
  }
}

// ─── Dashboard KPIs ─────────────────────────────────────────────────────────

export async function getDashboardKPIs(merchantId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

  // Total revenue (last 30 days)
  const { data: revenueData } = await supabase
    .from("invoices")
    .select("total_amount")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", cutoff);
  const totalRevenue = (revenueData || []).reduce((s, r) => s + parseFloat(r.total_amount), 0);

  // Outstanding receivables
  const { data: receivables } = await supabase
    .from("invoices")
    .select("total_amount")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .in("status", ["unpaid", "partial"]);
  const outstandingReceivables = (receivables || []).reduce((s, r) => s + parseFloat(r.total_amount), 0);

  // Top selling item (by total_amount in last 30 days)
  const { data: topItemData } = await supabase
    .from("invoices")
    .select("id")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", cutoff);
  const invoiceIds = (topItemData || []).map(i => i.id);

  let topSellingItem = "N/A";
  if (invoiceIds.length > 0) {
    const { data: itemSales } = await supabase
      .from("invoice_items")
      .select("item_id, total_amount")
      .in("invoice_id", invoiceIds);
    const itemTotals: Record<string, number> = {};
    for (const row of itemSales || []) {
      itemTotals[row.item_id] = (itemTotals[row.item_id] || 0) + parseFloat(row.total_amount);
    }
    const topItemId = Object.entries(itemTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topItemId) {
      const { data: item } = await supabase.from("items").select("name").eq("id", topItemId).single();
      topSellingItem = item?.name || "N/A";
    }
  }

  // Gross margin % (overall: (sale revenue - purchase cost) / sale revenue)
  const { data: purchaseData } = await supabase
    .from("invoices")
    .select("total_amount")
    .eq("merchant_id", merchantId)
    .eq("type", "purchase")
    .gte("invoice_date", cutoff);
  const totalPurchases = (purchaseData || []).reduce((s, r) => s + parseFloat(r.total_amount), 0);
  const grossMarginPercent = totalRevenue > 0 ? ((totalRevenue - totalPurchases) / totalRevenue) * 100 : 0;

  // Cash in hand (approx): total payments received - total payments made - total expenses
  const { data: paymentsIn } = await supabase
    .from("payments")
    .select("amount, party_id")
    .eq("merchant_id", merchantId);
  const { data: parties } = await supabase
    .from("parties")
    .select("id, type")
    .eq("merchant_id", merchantId);
  const partyTypeMap: Record<string, string> = {};
  for (const p of parties || []) partyTypeMap[p.id] = p.type;

  let cashIn = 0;
  let cashOut = 0;
  for (const p of paymentsIn || []) {
    if (partyTypeMap[p.party_id] === "customer") cashIn += parseFloat(p.amount);
    else cashOut += parseFloat(p.amount);
  }
  const { data: expensesData } = await supabase
    .from("expenses")
    .select("amount")
    .eq("merchant_id", merchantId);
  const totalExpenses = (expensesData || []).reduce((s, r) => s + parseFloat(r.amount), 0);
  const cashInHand = cashIn - cashOut - totalExpenses;

  return {
    totalRevenue: Math.round(totalRevenue),
    outstandingReceivables: Math.round(outstandingReceivables),
    topSellingItem,
    grossMarginPercent: parseFloat(grossMarginPercent.toFixed(1)),
    cashInHand: Math.round(cashInHand),
  };
}

// ─── Tool Query Functions ───────────────────────────────────────────────────

export async function queryRevenueSummary(merchantId: string, range: { startDate: string; endDate: string }, granularityOverride?: string) {
  const { startDate, endDate } = range;
  const granularity = resolveGranularity(startDate, endDate, granularityOverride);

  const { data } = await supabase
    .from("invoices")
    .select("invoice_date, total_amount, discount_amount")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate)
    .order("invoice_date");

  const buckets: Record<string, { revenue: number; discount: number; count: number }> = {};
  for (const inv of data || []) {
    const key = timeBucketKey(inv.invoice_date, granularity);
    if (!buckets[key]) buckets[key] = { revenue: 0, discount: 0, count: 0 };
    buckets[key].revenue += parseFloat(inv.total_amount);
    buckets[key].discount += parseFloat(inv.discount_amount || "0");
    buckets[key].count++;
  }
  return { granularity, periods: buckets };
}

export async function queryTopItems(merchantId: string, limit: number = 10, sortBy: "revenue" | "quantity" = "revenue", range: { startDate: string; endDate: string }) {
  const { startDate, endDate } = range;

  const { data: invoiceIds } = await supabase
    .from("invoices")
    .select("id")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  if (!invoiceIds?.length) return [];

  const { data: lineItems } = await supabase
    .from("invoice_items")
    .select("item_id, quantity, total_amount")
    .in("invoice_id", invoiceIds.map(i => i.id));

  const agg: Record<string, { revenue: number; quantity: number }> = {};
  for (const li of lineItems || []) {
    if (!agg[li.item_id]) agg[li.item_id] = { revenue: 0, quantity: 0 };
    agg[li.item_id].revenue += parseFloat(li.total_amount);
    agg[li.item_id].quantity += parseFloat(li.quantity);
  }

  const sorted = Object.entries(agg)
    .sort((a, b) => sortBy === "revenue" ? b[1].revenue - a[1].revenue : b[1].quantity - a[1].quantity)
    .slice(0, limit);

  const itemIds = sorted.map(([id]) => id);
  const { data: items } = await supabase.from("items").select("id, name, category, purchase_price, selling_price").in("id", itemIds);
  const itemMap: Record<string, typeof items extends (infer T)[] | null ? T : never> = {};
  for (const item of items || []) itemMap[item.id] = item;

  return sorted.map(([id, stats]) => ({
    name: itemMap[id]?.name || "Unknown",
    category: itemMap[id]?.category || "Unknown",
    purchasePrice: parseFloat(itemMap[id]?.purchase_price || "0"),
    sellingPrice: parseFloat(itemMap[id]?.selling_price || "0"),
    revenue: Math.round(stats.revenue),
    quantity: Math.round(stats.quantity),
    margin: itemMap[id] ? ((parseFloat(itemMap[id]!.selling_price) - parseFloat(itemMap[id]!.purchase_price)) / parseFloat(itemMap[id]!.selling_price) * 100).toFixed(1) + "%" : "N/A",
  }));
}

export async function queryReceivablesAgeing(merchantId: string) {
  const { data } = await supabase
    .from("invoices")
    .select("id, party_id, invoice_date, due_date, total_amount, status")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .in("status", ["unpaid", "partial"]);

  const today = new Date();
  const buckets = { "0-30": 0, "30-60": 0, "60-90": 0, "90+": 0 };
  const partyTotals: Record<string, number> = {};
  const details: { partyId: string; amount: number; daysOverdue: number; invoiceDate: string }[] = [];

  for (const inv of data || []) {
    const dueDate = new Date(inv.due_date || inv.invoice_date);
    const days = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const amount = parseFloat(inv.total_amount);

    if (days <= 30) buckets["0-30"] += amount;
    else if (days <= 60) buckets["30-60"] += amount;
    else if (days <= 90) buckets["60-90"] += amount;
    else buckets["90+"] += amount;

    partyTotals[inv.party_id] = (partyTotals[inv.party_id] || 0) + amount;
    details.push({ partyId: inv.party_id, amount, daysOverdue: Math.max(0, days), invoiceDate: inv.invoice_date });
  }

  // Resolve party names for top debtors
  const topDebtorIds = Object.entries(partyTotals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
  const { data: partyNames } = await supabase.from("parties").select("id, name, city, business_type, business_vertical").in("id", topDebtorIds);
  const partyInfoMap: Record<string, { name: string; city: string; businessType: string; businessVertical: string }> = {};
  for (const p of partyNames || []) partyInfoMap[p.id] = { name: p.name, city: p.city || "", businessType: p.business_type || "", businessVertical: p.business_vertical || "" };

  const topDebtors = topDebtorIds.map(id => ({
    name: partyInfoMap[id]?.name || "Unknown",
    city: partyInfoMap[id]?.city || "",
    businessVertical: partyInfoMap[id]?.businessVertical || "",
    amount: Math.round(partyTotals[id]),
  }));

  return {
    buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, Math.round(v)])),
    total: Math.round(Object.values(buckets).reduce((s, v) => s + v, 0)),
    topDebtors,
  };
}

export async function queryPayablesAgeing(merchantId: string) {
  const { data } = await supabase
    .from("invoices")
    .select("id, party_id, invoice_date, due_date, total_amount, status")
    .eq("merchant_id", merchantId)
    .eq("type", "purchase")
    .in("status", ["unpaid", "partial"]);

  const today = new Date();
  const buckets = { "0-30": 0, "30-60": 0, "60-90": 0, "90+": 0 };

  for (const inv of data || []) {
    const dueDate = new Date(inv.due_date || inv.invoice_date);
    const days = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const amount = parseFloat(inv.total_amount);
    if (days <= 30) buckets["0-30"] += amount;
    else if (days <= 60) buckets["30-60"] += amount;
    else if (days <= 90) buckets["60-90"] += amount;
    else buckets["90+"] += amount;
  }

  return {
    buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, Math.round(v)])),
    total: Math.round(Object.values(buckets).reduce((s, v) => s + v, 0)),
  };
}

export async function queryExpenseBreakdown(merchantId: string, range: { startDate: string; endDate: string }, granularityOverride?: string) {
  const { startDate, endDate } = range;
  const granularity = resolveGranularity(startDate, endDate, granularityOverride);

  const { data } = await supabase
    .from("expenses")
    .select("category, amount, expense_date")
    .eq("merchant_id", merchantId)
    .gte("expense_date", startDate)
    .lte("expense_date", endDate)
    .order("expense_date");

  const byCategory: Record<string, number> = {};
  const byPeriod: Record<string, Record<string, number>> = {};

  for (const exp of data || []) {
    const amount = parseFloat(exp.amount);
    byCategory[exp.category] = (byCategory[exp.category] || 0) + amount;
    const periodKey = timeBucketKey(exp.expense_date, granularity);
    if (!byPeriod[periodKey]) byPeriod[periodKey] = {};
    byPeriod[periodKey][exp.category] = (byPeriod[periodKey][exp.category] || 0) + amount;
  }

  return {
    granularity,
    byCategory: Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, Math.round(v)]).sort((a, b) => (b[1] as number) - (a[1] as number))),
    byPeriod,
    total: Math.round(Object.values(byCategory).reduce((s, v) => s + v, 0)),
  };
}

export async function queryInventoryLevels(merchantId: string) {
  // Get latest snapshot date
  const { data: latestSnap } = await supabase
    .from("inventory_snapshots")
    .select("snapshot_date")
    .eq("merchant_id", merchantId)
    .order("snapshot_date", { ascending: false })
    .limit(1);

  if (!latestSnap?.length) return { items: [], snapshotDate: null };
  const latestDate = latestSnap[0].snapshot_date;

  const { data: snapshots } = await supabase
    .from("inventory_snapshots")
    .select("item_id, quantity_on_hand")
    .eq("merchant_id", merchantId)
    .eq("snapshot_date", latestDate);

  // Get item details
  const itemIds = (snapshots || []).map(s => s.item_id);
  if (itemIds.length === 0) return { items: [], snapshotDate: latestDate };

  const { data: items } = await supabase.from("items").select("id, name, category, selling_price, purchase_price, variant_type, variant_value").in("id", itemIds);
  const itemMap: Record<string, (typeof items extends (infer T)[] | null ? T : never)> = {};
  for (const item of items || []) itemMap[item.id] = item;

  // Calculate velocity (sales in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", thirtyDaysAgo.toISOString().split("T")[0]);

  const salesByItem: Record<string, number> = {};
  if (recentInvoices?.length) {
    const { data: lineItems } = await supabase
      .from("invoice_items")
      .select("item_id, quantity")
      .in("invoice_id", recentInvoices.map(i => i.id));
    for (const li of lineItems || []) {
      salesByItem[li.item_id] = (salesByItem[li.item_id] || 0) + parseFloat(li.quantity);
    }
  }

  const result = (snapshots || []).map(snap => {
    const item = itemMap[snap.item_id];
    const qty = parseFloat(snap.quantity_on_hand);
    const velocity = salesByItem[snap.item_id] || 0;
    const daysOfStock = velocity > 0 ? Math.round((qty / velocity) * 30) : qty > 0 ? 999 : 0;
    const stockValue = qty * parseFloat(item?.purchase_price || "0");

    return {
      name: item?.name || "Unknown",
      category: item?.category || "Unknown",
      quantityOnHand: qty,
      monthlySalesVelocity: Math.round(velocity),
      daysOfStock,
      stockValue: Math.round(stockValue),
      variant: item?.variant_type ? `${item.variant_type}: ${item.variant_value}` : null,
    };
  }).sort((a, b) => b.stockValue - a.stockValue);

  return { items: result, snapshotDate: latestDate };
}

export async function queryDiscountTrend(merchantId: string, range: { startDate: string; endDate: string }, granularityOverride?: string) {
  const { startDate, endDate } = range;
  const granularity = resolveGranularity(startDate, endDate, granularityOverride);

  const { data } = await supabase
    .from("invoices")
    .select("invoice_date, total_amount, discount_amount")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate)
    .order("invoice_date");

  const buckets: Record<string, { revenue: number; discount: number }> = {};
  for (const inv of data || []) {
    const key = timeBucketKey(inv.invoice_date, granularity);
    if (!buckets[key]) buckets[key] = { revenue: 0, discount: 0 };
    buckets[key].revenue += parseFloat(inv.total_amount);
    buckets[key].discount += parseFloat(inv.discount_amount || "0");
  }

  return Object.entries(buckets).map(([period, vals]) => ({
    period,
    revenue: Math.round(vals.revenue),
    discount: Math.round(vals.discount),
    discountPercent: vals.revenue > 0 ? parseFloat((vals.discount / vals.revenue * 100).toFixed(1)) : 0,
  }));
}

export async function queryPaymentTiming(merchantId: string) {
  // Compare actual payment dates with invoice dates and credit terms
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, party_id, type, invoice_date, due_date, total_amount, status")
    .eq("merchant_id", merchantId)
    .eq("status", "paid");

  const { data: paymentsData } = await supabase
    .from("payments")
    .select("invoice_id, payment_date, amount")
    .eq("merchant_id", merchantId);

  const paymentMap: Record<string, { date: string; amount: number }[]> = {};
  for (const p of paymentsData || []) {
    if (!p.invoice_id) continue;
    if (!paymentMap[p.invoice_id]) paymentMap[p.invoice_id] = [];
    paymentMap[p.invoice_id].push({ date: p.payment_date, amount: parseFloat(p.amount) });
  }

  // Get party credit terms
  const { data: parties } = await supabase
    .from("parties")
    .select("id, name, type, credit_terms_days, business_vertical")
    .eq("merchant_id", merchantId);
  const partyMap: Record<string, { name: string; type: string; creditDays: number; businessVertical: string }> = {};
  for (const p of parties || []) partyMap[p.id] = { name: p.name, type: p.type, creditDays: p.credit_terms_days, businessVertical: p.business_vertical || "" };

  // Calculate DSO and DPO
  let saleDaysSum = 0, saleCount = 0;
  let purchaseDaysSum = 0, purchaseCount = 0;
  const supplierPaymentDetails: { supplier: string; creditTerms: number; avgPaymentDays: number; earlyByDays: number }[] = [];
  const supplierPayments: Record<string, { totalDays: number; count: number; creditTerms: number; name: string }> = {};

  for (const inv of invoices || []) {
    const payments = paymentMap[inv.id];
    if (!payments?.length) continue;

    const invDate = new Date(inv.invoice_date);
    const payDate = new Date(payments[0].date);
    const daysDiff = Math.floor((payDate.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));

    if (inv.type === "sale") {
      saleDaysSum += daysDiff;
      saleCount++;
    } else {
      purchaseDaysSum += daysDiff;
      purchaseCount++;
      const party = partyMap[inv.party_id];
      if (party) {
        if (!supplierPayments[inv.party_id]) {
          supplierPayments[inv.party_id] = { totalDays: 0, count: 0, creditTerms: party.creditDays, name: party.name };
        }
        supplierPayments[inv.party_id].totalDays += daysDiff;
        supplierPayments[inv.party_id].count++;
      }
    }
  }

  for (const [, sp] of Object.entries(supplierPayments)) {
    const avg = Math.round(sp.totalDays / sp.count);
    supplierPaymentDetails.push({
      supplier: sp.name,
      creditTerms: sp.creditTerms,
      avgPaymentDays: avg,
      earlyByDays: sp.creditTerms - avg,
    });
  }

  return {
    dso: saleCount > 0 ? Math.round(saleDaysSum / saleCount) : 0,
    dpo: purchaseCount > 0 ? Math.round(purchaseDaysSum / purchaseCount) : 0,
    supplierPaymentDetails: supplierPaymentDetails.sort((a, b) => b.earlyByDays - a.earlyByDays),
  };
}

export async function queryCustomerActivity(
  merchantId: string,
  opts: { customerName?: string; status?: "active" | "slowing" | "inactive"; limit?: number } = {}
) {
  const { customerName, status, limit = 5 } = opts;

  // If looking up a specific customer, resolve their party_id first
  let targetPartyIds: string[] | null = null;
  if (customerName) {
    const { data: matchedParties } = await supabase
      .from("parties")
      .select("id, name, city, credit_terms_days, business_type, business_vertical")
      .eq("merchant_id", merchantId)
      .eq("type", "customer")
      .ilike("name", `%${customerName}%`);
    if (!matchedParties?.length) return { customers: [], message: `No customer found matching "${customerName}"` };
    targetPartyIds = matchedParties.map(p => p.id);
  }

  // Get sale invoices (optionally filtered to target parties)
  let invoiceQuery = supabase
    .from("invoices")
    .select("id, party_id, invoice_date, total_amount, status")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .order("invoice_date", { ascending: false });
  if (targetPartyIds) invoiceQuery = invoiceQuery.in("party_id", targetPartyIds);
  const { data: invoices } = await invoiceQuery;

  const customerStats: Record<string, { totalRevenue: number; invoiceCount: number; lastPurchase: string; firstPurchase: string; outstanding: number }> = {};
  for (const inv of invoices || []) {
    if (!customerStats[inv.party_id]) {
      customerStats[inv.party_id] = { totalRevenue: 0, invoiceCount: 0, lastPurchase: inv.invoice_date, firstPurchase: inv.invoice_date, outstanding: 0 };
    }
    customerStats[inv.party_id].totalRevenue += parseFloat(inv.total_amount);
    customerStats[inv.party_id].invoiceCount++;
    if (inv.status === "unpaid" || inv.status === "partial") {
      customerStats[inv.party_id].outstanding += parseFloat(inv.total_amount);
    }
    if (inv.invoice_date < customerStats[inv.party_id].firstPurchase) {
      customerStats[inv.party_id].firstPurchase = inv.invoice_date;
    }
  }

  const today = new Date();

  // Resolve party names
  const allPartyIds = Object.keys(customerStats);
  if (allPartyIds.length === 0) return { customers: [] };
  const { data: parties } = await supabase.from("parties").select("id, name, city, credit_terms_days, business_type, business_vertical").in("id", allPartyIds);
  const partyMap: Record<string, { name: string; city: string; creditDays: number; businessType: string; businessVertical: string }> = {};
  for (const p of parties || []) partyMap[p.id] = { name: p.name, city: p.city || "", creditDays: p.credit_terms_days, businessType: p.business_type || "", businessVertical: p.business_vertical || "" };

  let results = Object.entries(customerStats).map(([id, stats]) => {
    const daysSinceLastPurchase = Math.floor((today.getTime() - new Date(stats.lastPurchase).getTime()) / (1000 * 60 * 60 * 24));
    const activityStatus = daysSinceLastPurchase > 60 ? "inactive" as const : daysSinceLastPurchase > 30 ? "slowing" as const : "active" as const;
    return {
      name: partyMap[id]?.name || "Unknown",
      city: partyMap[id]?.city || "",
      businessType: partyMap[id]?.businessType || "",
      businessVertical: partyMap[id]?.businessVertical || "",
      creditTermsDays: partyMap[id]?.creditDays || 0,
      totalRevenue: Math.round(stats.totalRevenue),
      outstanding: Math.round(stats.outstanding),
      invoiceCount: stats.invoiceCount,
      firstPurchase: stats.firstPurchase,
      lastPurchase: stats.lastPurchase,
      daysSinceLastPurchase,
      status: activityStatus,
    };
  });

  if (status) results = results.filter(r => r.status === status);

  results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  if (!customerName) results = results.slice(0, limit);

  return { customers: results };
}

export async function queryPartyLedger(
  merchantId: string,
  partyName: string,
  invoiceType: "sale" | "purchase" = "sale",
  range: { startDate: string; endDate: string } | null = null
) {
  // Find the party by name
  const { data: matchedParties } = await supabase
    .from("parties")
    .select("id, name, city, type, credit_terms_days, business_type, business_vertical")
    .eq("merchant_id", merchantId)
    .ilike("name", `%${partyName}%`);

  if (!matchedParties?.length) return { error: `No party found matching "${partyName}"` };

  const party = matchedParties[0];

  // Get their invoices
  let invoiceQuery = supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, due_date, total_amount, discount_amount, status")
    .eq("merchant_id", merchantId)
    .eq("party_id", party.id)
    .eq("type", invoiceType)
    .order("invoice_date", { ascending: false });

  if (range) {
    invoiceQuery = invoiceQuery.gte("invoice_date", range.startDate).lte("invoice_date", range.endDate);
  }

  const { data: invoices } = await invoiceQuery;
  if (!invoices?.length) return { party: { name: party.name, city: party.city, type: party.type, businessType: party.business_type, businessVertical: party.business_vertical }, invoices: [], message: "No invoices found" };

  // Get line items for these invoices
  const invoiceIds = invoices.map(i => i.id);
  const { data: lineItems } = await supabase
    .from("invoice_items")
    .select("invoice_id, item_id, quantity, unit_price, discount_percent, total_amount")
    .in("invoice_id", invoiceIds);

  // Get item names
  const itemIds = Array.from(new Set((lineItems || []).map(li => li.item_id)));
  const { data: items } = await supabase.from("items").select("id, name, category").in("id", itemIds);
  const itemMap: Record<string, { name: string; category: string }> = {};
  for (const item of items || []) itemMap[item.id] = { name: item.name, category: item.category };

  // Group line items by invoice
  const lineItemsByInvoice: Record<string, { item: string; category: string; qty: number; unitPrice: number; amount: number }[]> = {};
  for (const li of lineItems || []) {
    if (!lineItemsByInvoice[li.invoice_id]) lineItemsByInvoice[li.invoice_id] = [];
    lineItemsByInvoice[li.invoice_id].push({
      item: itemMap[li.item_id]?.name || "Unknown",
      category: itemMap[li.item_id]?.category || "Unknown",
      qty: parseFloat(li.quantity),
      unitPrice: parseFloat(li.unit_price),
      amount: parseFloat(li.total_amount),
    });
  }

  // Aggregate item-level summary across all invoices
  const itemSummary: Record<string, { totalQty: number; totalAmount: number; category: string }> = {};
  for (const li of lineItems || []) {
    const name = itemMap[li.item_id]?.name || "Unknown";
    if (!itemSummary[name]) itemSummary[name] = { totalQty: 0, totalAmount: 0, category: itemMap[li.item_id]?.category || "" };
    itemSummary[name].totalQty += parseFloat(li.quantity);
    itemSummary[name].totalAmount += parseFloat(li.total_amount);
  }

  const totalAmount = invoices.reduce((s, inv) => s + parseFloat(inv.total_amount), 0);
  const outstanding = invoices.filter(inv => inv.status === "unpaid" || inv.status === "partial").reduce((s, inv) => s + parseFloat(inv.total_amount), 0);

  return {
    party: { name: party.name, city: party.city, type: party.type, businessType: party.business_type, businessVertical: party.business_vertical, creditTermsDays: party.credit_terms_days },
    summary: {
      totalInvoices: invoices.length,
      totalAmount: Math.round(totalAmount),
      outstanding: Math.round(outstanding),
    },
    topItems: Object.entries(itemSummary)
      .map(([name, s]) => ({ name, category: s.category, totalQty: Math.round(s.totalQty), totalAmount: Math.round(s.totalAmount) }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10),
    recentInvoices: invoices.slice(0, 10).map(inv => ({
      invoiceNumber: inv.invoice_number,
      date: inv.invoice_date,
      amount: Math.round(parseFloat(inv.total_amount)),
      status: inv.status,
      items: (lineItemsByInvoice[inv.id] || []).map(li => `${li.item} x${li.qty}`),
    })),
  };
}

export async function queryMarginAnalysis(merchantId: string, range: { startDate: string; endDate: string }) {
  const { startDate, endDate } = range;

  const { data: saleInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  if (!saleInvoices?.length) return { byCategory: [], byItem: [] };

  const { data: lineItems } = await supabase
    .from("invoice_items")
    .select("item_id, quantity, unit_price, total_amount")
    .in("invoice_id", saleInvoices.map(i => i.id));

  const { data: items } = await supabase
    .from("items")
    .select("id, name, category, purchase_price, selling_price")
    .eq("merchant_id", merchantId);

  const itemMap: Record<string, { name: string; category: string; pp: number; sp: number }> = {};
  for (const item of items || []) {
    itemMap[item.id] = { name: item.name, category: item.category, pp: parseFloat(item.purchase_price), sp: parseFloat(item.selling_price) };
  }

  const catStats: Record<string, { revenue: number; cost: number }> = {};
  const itemStats: Record<string, { revenue: number; cost: number; quantity: number }> = {};

  for (const li of lineItems || []) {
    const item = itemMap[li.item_id];
    if (!item) continue;
    const revenue = parseFloat(li.total_amount);
    const cost = parseFloat(li.quantity) * item.pp;

    if (!catStats[item.category]) catStats[item.category] = { revenue: 0, cost: 0 };
    catStats[item.category].revenue += revenue;
    catStats[item.category].cost += cost;

    if (!itemStats[li.item_id]) itemStats[li.item_id] = { revenue: 0, cost: 0, quantity: 0 };
    itemStats[li.item_id].revenue += revenue;
    itemStats[li.item_id].cost += cost;
    itemStats[li.item_id].quantity += parseFloat(li.quantity);
  }

  const byCategory = Object.entries(catStats).map(([cat, s]) => ({
    category: cat,
    revenue: Math.round(s.revenue),
    cost: Math.round(s.cost),
    margin: s.revenue > 0 ? parseFloat(((s.revenue - s.cost) / s.revenue * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  const byItem = Object.entries(itemStats).map(([id, s]) => ({
    name: itemMap[id]?.name || "Unknown",
    category: itemMap[id]?.category || "Unknown",
    revenue: Math.round(s.revenue),
    cost: Math.round(s.cost),
    quantity: Math.round(s.quantity),
    margin: s.revenue > 0 ? parseFloat(((s.revenue - s.cost) / s.revenue * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 15);

  return { byCategory, byItem };
}

export async function queryDailyPatterns(merchantId: string, range: { startDate: string; endDate: string }) {
  const { startDate, endDate } = range;

  const { data } = await supabase
    .from("invoices")
    .select("invoice_date, total_amount")
    .eq("merchant_id", merchantId)
    .eq("type", "sale")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const byDay: Record<string, { revenue: number; count: number; days: number }> = {};
  const datesSeen: Record<string, Set<string>> = {};

  for (const inv of data || []) {
    const d = new Date(inv.invoice_date);
    const dayName = dayNames[d.getDay()];
    if (!byDay[dayName]) byDay[dayName] = { revenue: 0, count: 0, days: 0 };
    byDay[dayName].revenue += parseFloat(inv.total_amount);
    byDay[dayName].count++;
    if (!datesSeen[dayName]) datesSeen[dayName] = new Set();
    datesSeen[dayName].add(inv.invoice_date);
  }

  for (const [day, seen] of Object.entries(datesSeen)) {
    if (byDay[day]) byDay[day].days = seen.size;
  }

  return dayNames.map(day => ({
    day,
    totalRevenue: Math.round(byDay[day]?.revenue || 0),
    avgDailyRevenue: byDay[day]?.days ? Math.round(byDay[day].revenue / byDay[day].days) : 0,
    totalOrders: byDay[day]?.count || 0,
    avgDailyOrders: byDay[day]?.days ? Math.round(byDay[day].count / byDay[day].days) : 0,
  }));
}

export async function queryPriceTrends(merchantId: string, range: { startDate: string; endDate: string }, granularityOverride?: string) {
  const { startDate, endDate } = range;
  const granularity = resolveGranularity(startDate, endDate, granularityOverride);

  const { data: purchaseInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_date")
    .eq("merchant_id", merchantId)
    .eq("type", "purchase")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate)
    .order("invoice_date");

  if (!purchaseInvoices?.length) return [];

  const { data: lineItems } = await supabase
    .from("invoice_items")
    .select("invoice_id, item_id, unit_price, quantity")
    .in("invoice_id", purchaseInvoices.map(i => i.id));

  const invoiceDateMap: Record<string, string> = {};
  for (const inv of purchaseInvoices) invoiceDateMap[inv.id] = inv.invoice_date;

  // Group by item + time period
  const itemPeriods: Record<string, Record<string, { totalCost: number; totalQty: number }>> = {};
  for (const li of lineItems || []) {
    const dateStr = invoiceDateMap[li.invoice_id];
    if (!dateStr) continue;
    const periodKey = timeBucketKey(dateStr, granularity);
    if (!itemPeriods[li.item_id]) itemPeriods[li.item_id] = {};
    if (!itemPeriods[li.item_id][periodKey]) itemPeriods[li.item_id][periodKey] = { totalCost: 0, totalQty: 0 };
    itemPeriods[li.item_id][periodKey].totalCost += parseFloat(li.unit_price) * parseFloat(li.quantity);
    itemPeriods[li.item_id][periodKey].totalQty += parseFloat(li.quantity);
  }

  // Get item names and selling prices
  const allItemIds = Object.keys(itemPeriods);
  const { data: items } = await supabase.from("items").select("id, name, selling_price").in("id", allItemIds);
  const itemNameMap: Record<string, { name: string; sp: number }> = {};
  for (const item of items || []) itemNameMap[item.id] = { name: item.name, sp: parseFloat(item.selling_price) };

  // Find items with significant price changes
  return allItemIds.map(itemId => {
    const periods = Object.entries(itemPeriods[itemId]).sort().map(([period, s]) => ({
      period,
      avgPurchasePrice: parseFloat((s.totalCost / s.totalQty).toFixed(2)),
    }));
    if (periods.length < 2) return null;
    const firstPrice = periods[0].avgPurchasePrice;
    const lastPrice = periods[periods.length - 1].avgPurchasePrice;
    const changePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice * 100) : 0;

    return {
      name: itemNameMap[itemId]?.name || "Unknown",
      sellingPrice: itemNameMap[itemId]?.sp || 0,
      periods,
      changePercent: parseFloat(changePercent.toFixed(1)),
    };
  }).filter((x): x is { name: string; sellingPrice: number; periods: { period: string; avgPurchasePrice: number }[]; changePercent: number } => x !== null)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 10);
}

// ─── Weekly Comparison (for cron email) ──────────────────────────────────────

export interface WeeklyComparison {
  thisWeek: { startDate: string; endDate: string };
  lastWeek: { startDate: string; endDate: string };
  revenue: { thisWeek: number; lastWeek: number; changePercent: number };
  invoiceCount: { thisWeek: number; lastWeek: number };
  topItems: { name: string; revenue: number; quantity: number }[];
  margins: { thisWeek: number; lastWeek: number; changePoints: number };
  expenses: { thisWeek: number; lastWeek: number; changePercent: number };
  receivables: { total: number; overdue90Plus: number; topDebtor: { name: string; amount: number } | null };
}

function getWeekRange(weeksAgo: number): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - mondayOffset);

  const targetMonday = new Date(thisMonday);
  targetMonday.setDate(thisMonday.getDate() - weeksAgo * 7);

  const targetSunday = new Date(targetMonday);
  targetSunday.setDate(targetMonday.getDate() + 6);

  return {
    startDate: targetMonday.toISOString().split("T")[0],
    endDate: targetSunday.toISOString().split("T")[0],
  };
}

export async function generateWeeklyComparison(merchantId: string): Promise<WeeklyComparison> {
  const thisWeekRange = getWeekRange(1); // last completed week
  const lastWeekRange = getWeekRange(2); // the week before that

  const [revThis, revLast, marginsThis, marginsLast, expThis, expLast, receivables, topItemsData] =
    await Promise.all([
      queryRevenueSummary(merchantId, thisWeekRange),
      queryRevenueSummary(merchantId, lastWeekRange),
      queryMarginAnalysis(merchantId, thisWeekRange),
      queryMarginAnalysis(merchantId, lastWeekRange),
      queryExpenseBreakdown(merchantId, thisWeekRange),
      queryExpenseBreakdown(merchantId, lastWeekRange),
      queryReceivablesAgeing(merchantId),
      queryTopItems(merchantId, 5, "revenue", thisWeekRange),
    ]);

  // Revenue aggregation
  const revenueThisWeek = Object.values(revThis.periods).reduce((s, m) => s + m.revenue, 0);
  const revenueLastWeek = Object.values(revLast.periods).reduce((s, m) => s + m.revenue, 0);
  const invoiceCountThisWeek = Object.values(revThis.periods).reduce((s, m) => s + m.count, 0);
  const invoiceCountLastWeek = Object.values(revLast.periods).reduce((s, m) => s + m.count, 0);

  // Margins
  const totalRevThis = (marginsThis.byCategory || []).reduce((s: number, c: { revenue: number }) => s + c.revenue, 0);
  const totalCostThis = (marginsThis.byCategory || []).reduce((s: number, c: { cost: number }) => s + c.cost, 0);
  const marginThis = totalRevThis > 0 ? ((totalRevThis - totalCostThis) / totalRevThis) * 100 : 0;
  const totalRevLast = (marginsLast.byCategory || []).reduce((s: number, c: { revenue: number }) => s + c.revenue, 0);
  const totalCostLast = (marginsLast.byCategory || []).reduce((s: number, c: { cost: number }) => s + c.cost, 0);
  const marginLast = totalRevLast > 0 ? ((totalRevLast - totalCostLast) / totalRevLast) * 100 : 0;

  // Receivables
  const topDebtor = receivables.topDebtors?.[0] || null;

  const revenueChange = revenueLastWeek > 0
    ? ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100
    : 0;
  const expenseChange = (expLast.total || 0) > 0
    ? (((expThis.total || 0) - (expLast.total || 0)) / (expLast.total || 1)) * 100
    : 0;

  return {
    thisWeek: thisWeekRange,
    lastWeek: lastWeekRange,
    revenue: {
      thisWeek: Math.round(revenueThisWeek),
      lastWeek: Math.round(revenueLastWeek),
      changePercent: parseFloat(revenueChange.toFixed(1)),
    },
    invoiceCount: { thisWeek: invoiceCountThisWeek, lastWeek: invoiceCountLastWeek },
    topItems: (topItemsData as { name: string; revenue: number; quantity: number }[]).map(i => ({
      name: i.name,
      revenue: i.revenue,
      quantity: i.quantity,
    })),
    margins: {
      thisWeek: parseFloat(marginThis.toFixed(1)),
      lastWeek: parseFloat(marginLast.toFixed(1)),
      changePoints: parseFloat((marginThis - marginLast).toFixed(1)),
    },
    expenses: {
      thisWeek: expThis.total || 0,
      lastWeek: expLast.total || 0,
      changePercent: parseFloat(expenseChange.toFixed(1)),
    },
    receivables: {
      total: receivables.total,
      overdue90Plus: receivables.buckets?.["90+"] || 0,
      topDebtor: topDebtor ? { name: topDebtor.name, amount: topDebtor.amount } : null,
    },
  };
}
