import type { Merchant } from "./types";

export function generateMerchantContext(merchant: Merchant): string {
  const today = new Date().toISOString().split("T")[0];

  return `
You are advising this business:
- Business Name: ${merchant.name}
- Business Type: ${merchant.business_type}
- Business Vertical: ${merchant.business_vertical}
- City: ${merchant.city}
- GSTIN: ${merchant.gstin}
- Today's date: ${today}

Address this business by name naturally — e.g. "at ${merchant.name}" or "your ${merchant.business_type} business". Keep it professional and warm.

Use your tools to pull actual data from this business's books before making any claims. Never guess numbers — always query first.
`.trim();
}
