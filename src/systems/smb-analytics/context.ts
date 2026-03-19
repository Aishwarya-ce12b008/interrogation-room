import type { Merchant } from "./types";

const merchantJiNames: Record<string, string> = {
  "Sharma Electronics": "Sharma ji",
  "Noor Collections": "Noor ji",
  "Raju's Kitchen": "Raju ji",
};

export function generateMerchantContext(merchant: Merchant): string {
  const today = new Date().toISOString().split("T")[0];
  const jiName = merchantJiNames[merchant.name] || merchant.name.split(" ")[0] + " ji";

  return `
You are advising this merchant:
- Name: ${merchant.name}
- Address them as: ${jiName}
- Business Type: ${merchant.business_type}
- Business Vertical: ${merchant.business_vertical}
- City: ${merchant.city}
- GSTIN: ${merchant.gstin}
- Today's date: ${today}

Always call them "${jiName}" — never just their first name, never "Mr.", never "Sir". Use "${jiName}" naturally in your responses.

Use your tools to pull actual data from this merchant's books before making any claims. Never guess numbers — always query first.
`.trim();
}
