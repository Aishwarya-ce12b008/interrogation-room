import type { Dispute } from "./types";

export function generateDisputeContext(dispute: Dispute): string {
  const daysLeft = Math.ceil(
    (new Date(dispute.respond_by).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const deadlineStr = daysLeft <= 3
    ? `${dispute.respond_by} (⚠ ${daysLeft} days remaining — urgent)`
    : `${dispute.respond_by} (${daysLeft} days remaining)`;

  const amountInr = (dispute.amount / 100).toLocaleString("en-IN");

  return `
You are resolving this chargeback dispute:
- Dispute ID: ${dispute.razorpay_dispute_id}
- Payment ID: ${dispute.razorpay_payment_id}
- Network: ${dispute.network.toUpperCase()}
- Reason Code: ${dispute.reason_code} — ${dispute.reason_description}
- Merchant: ${dispute.merchant_name} (${dispute.merchant_category})
- Merchant ID: ${dispute.merchant_id}
- Amount: ₹${amountInr}
- Amount Band: ${dispute.amount_band}
- Transaction Date: ${dispute.transaction_date}
- Dispute Filed: ${dispute.dispute_date}
- Response Deadline: ${deadlineStr}
- Status: ${dispute.status}
`.trim();
}
