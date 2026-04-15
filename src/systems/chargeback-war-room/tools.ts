import {
  getTransactionData,
  getMerchantData,
  getShippingData,
  getCustomerComms,
  getRefundPolicyData,
  getDeviceFingerprintData,
  getDisputeById,
} from "./data";
import type { Dispute } from "./types";

// ─── Tool definitions (OpenAI function-calling format) ──────────────────────

export const chargebackTools = [
  {
    type: "function" as const,
    function: {
      name: "get_dispute",
      description: "Get full dispute details including reason code, amount, merchant, and response deadline.",
      parameters: {
        type: "object",
        properties: {
          dispute_id: { type: "string", description: "The dispute card ID (e.g., 'disp-001')." },
        },
        required: ["dispute_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_transaction",
      description: "Get original transaction details including amount, payment method, 3DS status, and AVS result.",
      parameters: {
        type: "object",
        properties: {
          payment_id: { type: "string", description: "The Razorpay payment ID." },
        },
        required: ["payment_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_merchant",
      description: "Get merchant profile including category, website, risk score, and support contact.",
      parameters: {
        type: "object",
        properties: {
          merchant_id: { type: "string", description: "The merchant ID." },
        },
        required: ["merchant_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_shipping_info",
      description: "Get shipping and delivery details including carrier, tracking ID, delivery proof, and address match. Only relevant for physical goods.",
      parameters: {
        type: "object",
        properties: {
          payment_id: { type: "string", description: "The Razorpay payment ID." },
        },
        required: ["payment_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_customer_comms",
      description: "Get communication history between the merchant and customer — emails, chats, and phone logs.",
      parameters: {
        type: "object",
        properties: {
          payment_id: { type: "string", description: "The Razorpay payment ID." },
        },
        required: ["payment_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_refund_policy",
      description: "Get the merchant's refund and cancellation policy including refund window, cancellation terms, and policy text.",
      parameters: {
        type: "object",
        properties: {
          merchant_id: { type: "string", description: "The merchant ID." },
        },
        required: ["merchant_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_device_fingerprint",
      description: "Get device and network forensics for a transaction — IP, geolocation, device ID, VPN/proxy detection, 3DS details, and prior transaction history from the same device.",
      parameters: {
        type: "object",
        properties: {
          payment_id: { type: "string", description: "The Razorpay payment ID." },
        },
        required: ["payment_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "load_skill",
      description: "Load the investigation playbook (SKILL.md) for a specific reason code. Returns the full playbook with investigation plan, evidence requirements, and representment template.",
      parameters: {
        type: "object",
        properties: {
          reason_code: { type: "string", description: "The dispute reason code (e.g., 'visa-13.1', 'mc-4853')." },
        },
        required: ["reason_code"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_past_wins",
      description: "Search the corpus of past winning representments for similar cases. Returns 2-3 examples to use as reference for tone and structure.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Brief description of the current dispute for similarity matching." },
          reason_code: { type: "string", description: "Filter by reason code (e.g., 'visa-13.1')." },
          merchant_category: { type: "string", description: "Filter by merchant category (e.g., 'ecommerce', 'travel')." },
          amount_band: { type: "string", enum: ["micro", "small", "medium", "large"], description: "Filter by amount band." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "submit_representment",
      description: "Submit the final representment response to the card network. ONLY call this after the user has explicitly approved the draft.",
      parameters: {
        type: "object",
        properties: {
          dispute_id: { type: "string", description: "The dispute ID." },
          representment_text: { type: "string", description: "The full representment letter text." },
          evidence_summary: { type: "string", description: "Summary of evidence attached." },
          confidence_score: { type: "number", description: "Confidence score (0-100)." },
        },
        required: ["dispute_id", "representment_text", "evidence_summary", "confidence_score"],
      },
    },
  },
];

export function getToolsForAgent(): typeof chargebackTools {
  return chargebackTools;
}

// ─── Tool execution ─────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: unknown,
): Promise<string> {
  const dispute = context as Dispute | null;

  switch (name) {
    case "get_dispute": {
      const disputeId = (args.dispute_id as string) || dispute?.id;
      if (!disputeId) return "Error: No dispute_id provided.";
      const d = getDisputeById(disputeId);
      if (!d) return `Error: Dispute "${disputeId}" not found.`;
      return JSON.stringify({
        dispute_id: d.id,
        razorpay_dispute_id: d.razorpay_dispute_id,
        razorpay_payment_id: d.razorpay_payment_id,
        reason_code: d.reason_code,
        reason_description: d.reason_description,
        network: d.network,
        amount_paise: d.amount,
        amount_inr: `₹${(d.amount / 100).toLocaleString("en-IN")}`,
        currency: d.currency,
        merchant_id: d.merchant_id,
        merchant_name: d.merchant_name,
        merchant_category: d.merchant_category,
        customer_email: d.customer_email,
        customer_id: d.customer_id,
        transaction_date: d.transaction_date,
        dispute_date: d.dispute_date,
        respond_by: d.respond_by,
        status: d.status,
        amount_band: d.amount_band,
      }, null, 2);
    }

    case "get_transaction": {
      const paymentId = args.payment_id as string;
      if (!paymentId) return "Error: No payment_id provided.";
      const txn = getTransactionData(paymentId);
      if (!txn) return `Error: Transaction "${paymentId}" not found.`;
      return JSON.stringify({
        ...txn,
        amount_inr: `₹${(txn.amount / 100).toLocaleString("en-IN")}`,
      }, null, 2);
    }

    case "get_merchant": {
      const merchantId = args.merchant_id as string;
      if (!merchantId) return "Error: No merchant_id provided.";
      const merchant = getMerchantData(merchantId);
      if (!merchant) return `Error: Merchant "${merchantId}" not found.`;
      return JSON.stringify(merchant, null, 2);
    }

    case "get_shipping_info": {
      const paymentId = args.payment_id as string;
      if (!paymentId) return "Error: No payment_id provided.";
      const shipping = getShippingData(paymentId);
      if (!shipping) return `No shipping information found for payment "${paymentId}". This may be a digital goods or services transaction with no physical delivery.`;
      return JSON.stringify(shipping, null, 2);
    }

    case "get_customer_comms": {
      const paymentId = args.payment_id as string;
      if (!paymentId) return "Error: No payment_id provided.";
      const comms = getCustomerComms(paymentId);
      if (!comms) return `No customer communications found for payment "${paymentId}".`;
      if (comms.messages.length === 0) return `No customer communications on file for payment "${paymentId}". The customer did not contact the merchant before filing the dispute.`;
      return JSON.stringify(comms, null, 2);
    }

    case "get_refund_policy": {
      const merchantId = args.merchant_id as string;
      if (!merchantId) return "Error: No merchant_id provided.";
      const policy = getRefundPolicyData(merchantId);
      if (!policy) return `No refund policy on file for merchant "${merchantId}".`;
      return JSON.stringify(policy, null, 2);
    }

    case "get_device_fingerprint": {
      const paymentId = args.payment_id as string;
      if (!paymentId) return "Error: No payment_id provided.";
      const fingerprint = getDeviceFingerprintData(paymentId);
      if (!fingerprint) return `No device fingerprint data available for payment "${paymentId}". Device forensics were not captured for this transaction.`;
      return JSON.stringify(fingerprint, null, 2);
    }

    case "load_skill": {
      const reasonCode = args.reason_code as string;
      if (!reasonCode) return "Error: No reason_code provided.";
      // Dynamic import keeps fs out of the client bundle — skill-loader.ts is only resolved server-side
      const { loadSkill } = await import("./skill-loader");
      return loadSkill(reasonCode);
    }

    case "search_past_wins": {
      const reasonCode = args.reason_code as string;
      const merchantCategory = args.merchant_category as string;
      const amountBand = args.amount_band as string;
      return searchPastWinsLocal(reasonCode, merchantCategory, amountBand);
    }

    case "submit_representment": {
      const disputeId = args.dispute_id as string;
      const confidence = args.confidence_score as number;
      const submissionId = `sub_${Date.now().toString(36).toUpperCase()}`;
      return JSON.stringify({
        submission_id: submissionId,
        dispute_id: disputeId,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        confidence_score: confidence,
        estimated_response_days: 15,
        message: `Representment successfully submitted to the card network. Submission ID: ${submissionId}. Expected response within 15 business days.`,
      }, null, 2);
    }

    default:
      return `Error: Unknown tool "${name}".`;
  }
}

// ─── Local past-wins search (keyword + metadata filter for v1) ──────────────

function searchPastWinsLocal(
  reasonCode?: string,
  merchantCategory?: string,
  amountBand?: string,
): string {
  // Import past wins data
  const pastWins = getPastWinsCorpus();

  let filtered = pastWins;

  if (reasonCode) {
    filtered = filtered.filter(w => w.reason_code === reasonCode);
  }
  if (merchantCategory) {
    filtered = filtered.filter(w => w.merchant_category === merchantCategory || w.merchant_category === "general");
  }
  if (amountBand) {
    filtered = filtered.filter(w => w.amount_band === amountBand || w.amount_band === "any");
  }

  // Take top 3
  const results = filtered.slice(0, 3);

  if (results.length === 0) {
    // Fallback: just filter by reason code
    const fallback = pastWins.filter(w => w.reason_code === reasonCode).slice(0, 2);
    if (fallback.length === 0) return "No similar past winning representments found for this dispute type.";
    return formatPastWins(fallback);
  }

  return formatPastWins(results);
}

function formatPastWins(wins: PastWin[]): string {
  return wins.map((w, i) => `--- Past Win ${i + 1} ---
Reason Code: ${w.reason_code}
Merchant Category: ${w.merchant_category}
Amount Band: ${w.amount_band}
Key Evidence Used: ${w.evidence_types.join(", ")}
Outcome: WON

${w.representment_text}
`).join("\n");
}

interface PastWin {
  id: string;
  reason_code: string;
  merchant_category: string;
  amount_band: string;
  evidence_types: string[];
  representment_text: string;
}

function getPastWinsCorpus(): PastWin[] {
  return [
    // ── Visa 13.1 — Merchandise Not Received ──
    {
      id: "pw-v131-001", reason_code: "visa-13.1", merchant_category: "ecommerce", amount_band: "small",
      evidence_types: ["delivery_proof", "tracking", "otp_verification", "customer_comms"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_001 — Reason Code 13.1

We respectfully submit this representment for the transaction of ₹2,499 dated 15 Feb 2026.

The cardholder purchased a pair of running shoes from our platform. The order was fulfilled via Delhivery (tracking ID: DLV20260215X001) and delivered on 18 Feb 2026 at 3:22 PM IST. Delivery was confirmed via OTP verification (code: 7291), and a delivery photo was captured at the doorstep.

The delivery PIN code (560038) matches the billing PIN code on file. Post-delivery, the cardholder contacted our support on 20 Feb 2026 asking about a size exchange — confirming receipt of the package.

We have fulfilled this order as described and have clear proof of delivery. We respectfully request reversal of this chargeback.`,
    },
    {
      id: "pw-v131-002", reason_code: "visa-13.1", merchant_category: "electronics", amount_band: "large",
      evidence_types: ["delivery_proof", "tracking", "signature", "3ds"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_002 — Reason Code 13.1

This representment concerns a transaction of ₹54,999 for a Samsung Galaxy S24 Ultra, dated 10 Mar 2026.

The transaction was authenticated via 3D Secure 2.2.0. The order was shipped via BlueDart (AWB: BD2026031078901) on 11 Mar 2026 and delivered on 13 Mar 2026. The delivery receipt bears the physical signature of the cardholder (name matching the card: "Amit Sharma").

The delivery address (15 Nehru Place, New Delhi 110019) exactly matches the billing address associated with the card. The device used for the purchase (Chrome on Windows 11, IP: 49.36.142.87, Delhi) has been used for 8 prior successful transactions with no disputes.

We request reversal of this chargeback based on confirmed delivery with signature and authenticated transaction.`,
    },
    {
      id: "pw-v131-003", reason_code: "visa-13.1", merchant_category: "fashion", amount_band: "medium",
      evidence_types: ["delivery_proof", "tracking", "customer_comms"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_003 — Reason Code 13.1

Transaction: ₹7,999 for designer kurta set, dated 5 Mar 2026.

Shipment via DTDC (tracking: DTDC2026030590AB), delivered 9 Mar 2026. OTP-verified delivery (code: 4562). The cardholder emailed our support on 12 Mar 2026 requesting care instructions for the fabric — this communication occurred 3 days after delivery, confirming the cardholder had the merchandise in possession.

Billing and delivery addresses match (HSR Layout, Bengaluru 560102). We respectfully request chargeback reversal.`,
    },
    {
      id: "pw-v131-004", reason_code: "visa-13.1", merchant_category: "general", amount_band: "any",
      evidence_types: ["delivery_proof", "tracking"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_004 — Reason Code 13.1

We submit proof of delivery for this transaction. The item was shipped via [Carrier] on [Date] with tracking ID [ID]. Delivery was confirmed on [Date] at [Time] IST via [OTP/Signature/Photo]. The delivery address matches the cardholder's billing address.

Based on this clear evidence of successful delivery, we request reversal of the chargeback.`,
    },
    // ── Visa 13.3 — Not as Described ──
    {
      id: "pw-v133-001", reason_code: "visa-13.3", merchant_category: "electronics", amount_band: "large",
      evidence_types: ["serial_verification", "customer_comms", "return_offer", "delivery_proof"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_005 — Reason Code 13.3

Transaction: ₹24,999 for Sony WH-1000XM5 headphones, dated 12 Mar 2026.

The cardholder claims the product received was counterfeit. We respectfully disagree and present the following evidence:

1. The product serial number (SN-WH1000XM5-2026-IND-4521) was verified directly with Sony India's authorized distributor database and confirmed authentic.
2. Our purchase invoice from Sony India (Invoice #SI-2026-03-00891) confirms the specific unit was part of an authorized batch.
3. On 15 Mar 2026, our support team informed the cardholder of the serial number verification and offered a full return within 10 days. The cardholder did not respond to this offer.
4. The cardholder has not returned the merchandise as of the dispute date.

The product delivered is genuine, verified by the manufacturer. The merchant offered a resolution per policy, which was not accepted. We request reversal of this chargeback.`,
    },
    {
      id: "pw-v133-002", reason_code: "visa-13.3", merchant_category: "home_furnishing", amount_band: "medium",
      evidence_types: ["product_listing", "customer_comms", "return_offer"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_006 — Reason Code 13.3

Transaction: ₹12,499 for handcrafted wooden dining table, dated 20 Feb 2026.

The cardholder claims the wood grain pattern differs from the listing photo. We note that our product listing clearly states: "Natural wood grain varies between pieces. Each table is unique. Photos are representative." This disclaimer was visible on the product page at the time of purchase.

On 25 Feb 2026, we offered the cardholder a free replacement or full store credit. The cardholder responded demanding a refund, which our return policy allows within 15 days of delivery if the item is returned in original condition. We sent a prepaid return label on 26 Feb 2026. The cardholder has not returned the item as of the dispute date.

We disclosed the natural variation, offered multiple resolutions, and facilitated a return. We request chargeback reversal.`,
    },
    {
      id: "pw-v133-003", reason_code: "visa-13.3", merchant_category: "general", amount_band: "any",
      evidence_types: ["product_verification", "customer_comms", "return_offer"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_007 — Reason Code 13.3

The merchant verified the product matches the listing description via [verification method]. The merchant contacted the cardholder on [date] and offered [return/replacement/credit]. The cardholder [did not respond / refused to return the item / did not follow the return process].

The merchant acted in good faith, delivered as described, and offered resolution per policy. We request reversal.`,
    },
    // ── Visa 10.4 — Fraud Card Absent ──
    {
      id: "pw-v104-001", reason_code: "visa-10.4", merchant_category: "saas", amount_band: "large",
      evidence_types: ["3ds_auth", "device_fingerprint", "avs_match", "prior_transactions"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_008 — Reason Code 10.4

Transaction: ₹49,999 for annual SaaS subscription, dated 1 Mar 2026.

This transaction was authenticated via 3D Secure 2.2.0. Under Visa's liability shift rules, successful 3DS authentication transfers fraud liability to the issuing bank.

Additionally, we present supporting evidence:
- Device ID dev_a1b2c3d4e5 has been used for 12 prior transactions over the last 8 months with zero disputes
- IP address 103.21.58.193 geolocates to Gurugram, India — matching the cardholder's billing address
- AVS result: MATCH
- No VPN or proxy detected
- Browser: Chrome 122.0 on Windows 11 — consistent with prior transactions

The transaction was properly authenticated via 3DS, and all device/network signals indicate the legitimate cardholder. We request reversal based on 3DS liability shift.`,
    },
    {
      id: "pw-v104-002", reason_code: "visa-10.4", merchant_category: "digital_media", amount_band: "micro",
      evidence_types: ["device_fingerprint", "avs_match", "usage_logs"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_009 — Reason Code 10.4

Transaction: ₹599 for monthly streaming subscription, dated 5 Mar 2026.

While 3DS was not used for this low-value recurring transaction, we present the following evidence:
- The account (registered email matching cardholder) was created 14 months ago
- The cardholder has been billed monthly for 14 consecutive months with no prior disputes
- The account was actively used (3 hours of streaming) on the same day as the disputed transaction
- IP address for account activity matches the billing address city (Mumbai)
- Account login continued for 12 days AFTER the dispute was filed

The usage pattern strongly indicates the legitimate cardholder. We request reversal.`,
    },
    {
      id: "pw-v104-003", reason_code: "visa-10.4", merchant_category: "travel", amount_band: "large",
      evidence_types: ["3ds_auth", "device_fingerprint", "delivery_to_cardholder"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_010 — Reason Code 10.4

Transaction: ₹1,24,999 for round-trip flights, dated 28 Feb 2026.

The transaction was authenticated via 3D Secure 2.2.0 (liability shift applies). The boarding passes were issued in the cardholder's name, and the cardholder checked in and boarded both flights (DEL→GOA on 10 Mar, GOA→DEL on 14 Mar). Check-in records confirm passport/ID verification matching the card name.

We request reversal based on 3DS authentication and confirmed service utilization.`,
    },
    // ── Mastercard 4853 — Goods/Services Not Provided ──
    {
      id: "pw-mc4853-001", reason_code: "mc-4853", merchant_category: "ecommerce", amount_band: "medium",
      evidence_types: ["delivery_proof", "tracking", "otp_verification"],
      representment_text: `To: Mastercard Dispute Resolution
Re: Dispute disp_EXAMPLE_011 — Reason Code 4853

Transaction: ₹6,799 for a Samsung 43-inch Smart TV, dated 19 Mar 2026.

The order was shipped via BlueDart (AWB: BD2026031934IJ) on 20 Mar 2026 and delivered on 23 Mar 2026 at 11:15 AM IST. Delivery was confirmed via OTP verification (code: 8847) and a digital signature was captured.

The delivery PIN code (600002) matches the billing PIN code. The transaction was authenticated via 3D Secure.

We have clear proof of delivery for this physical goods order. We request chargeback reversal.`,
    },
    {
      id: "pw-mc4853-002", reason_code: "mc-4853", merchant_category: "travel", amount_band: "large",
      evidence_types: ["booking_confirmation", "check_in_records", "terms_accepted"],
      representment_text: `To: Mastercard Dispute Resolution
Re: Dispute disp_EXAMPLE_012 — Reason Code 4853

Transaction: ₹15,999 for a 3-night hotel stay in Goa, dated 10 Mar 2026.

The cardholder checked in on 15 Mar 2026 at 2:30 PM and checked out on 18 Mar 2026 at 11:00 AM. Check-in records show ID verification matching the cardholder's name. Room key card logs confirm room access throughout the stay. The hotel's restaurant records show two room-service charges signed by the guest.

The booking confirmation email sent on 10 Mar included the terms and conditions, which the cardholder accepted at the time of booking (click-through acceptance logged).

The service was fully rendered. We request chargeback reversal.`,
    },
    {
      id: "pw-mc4853-003", reason_code: "mc-4853", merchant_category: "food_delivery", amount_band: "micro",
      evidence_types: ["delivery_proof", "refund_already_issued"],
      representment_text: `To: Mastercard Dispute Resolution
Re: Dispute disp_EXAMPLE_013 — Reason Code 4853

Transaction: ₹849 for a food delivery order, dated 23 Mar 2026.

We note that the merchant already issued a full refund of ₹849 on 23 Mar 2026 (refund ID: rfnd_EXAMPLE_013) after the cardholder complained about food quality. The refund was processed to the same card ending in 5578. This is a case of double recovery — the cardholder has received both the refund and the chargeback credit.

We request reversal to prevent double recovery.`,
    },
    // ── Mastercard 4837 — No Cardholder Authorization ──
    {
      id: "pw-mc4837-001", reason_code: "mc-4837", merchant_category: "edtech", amount_band: "medium",
      evidence_types: ["3ds_auth", "device_fingerprint", "account_history"],
      representment_text: `To: Mastercard Dispute Resolution
Re: Dispute disp_EXAMPLE_014 — Reason Code 4837

Transaction: ₹9,999 for a 6-month Data Science Bootcamp access, dated 20 Mar 2026.

The transaction was authenticated via Mastercard SecureCode (3D Secure 2.1.0). Under Mastercard's dispute rules, successful SecureCode authentication provides liability protection.

Supporting evidence:
- Device ID dev_w3x4y5z6a7 has 8 prior transactions from the same account over 11 months
- IP: 103.40.56.78, Ahmedabad, India — matches billing address
- AVS: MATCH
- No VPN/proxy detected
- The account has logged 47 hours of course content access since purchase, including 3 hours after the dispute was filed

3DS authenticated + consistent device + active usage. We request reversal.`,
    },
    {
      id: "pw-mc4837-002", reason_code: "mc-4837", merchant_category: "luxury", amount_band: "large",
      evidence_types: ["3ds_auth", "delivery_to_cardholder", "avs_match"],
      representment_text: `To: Mastercard Dispute Resolution
Re: Dispute disp_EXAMPLE_015 — Reason Code 4837

Transaction: ₹89,999 for a luxury timepiece, dated 25 Feb 2026.

The transaction was authenticated via Mastercard SecureCode. The watch was delivered to the cardholder's billing address on 28 Feb 2026 with signed delivery confirmation.

However, we note risk signals: IP from Netherlands via VPN, new device, AVS mismatch. Despite 3DS authentication, the risk profile warrants caution. The merchant is cooperating fully with the investigation.

Based on successful 3DS authentication and delivery to the billing address, we request reversal, but acknowledge the risk signals for the network's consideration.`,
    },
    {
      id: "pw-mc4837-003", reason_code: "mc-4837", merchant_category: "gaming", amount_band: "small",
      evidence_types: ["device_fingerprint", "account_history", "usage_logs"],
      representment_text: `To: Mastercard Dispute Resolution
Re: Dispute disp_EXAMPLE_016 — Reason Code 4837

Transaction: ₹1,499 for in-game purchases, dated 22 Mar 2026.

While 3DS was not used, the device (dev_b8c9d0e1f2, Android 13) has 3 prior purchases on this account with no disputes. The game account was created 7 months ago and shows 200+ hours of gameplay. The in-game items purchased were used within 2 hours of purchase and continue to be active in the account.

IP: 49.36.88.112 (Kolkata, India) — matches billing address. No VPN/proxy detected.

The transaction is consistent with the account's history and the items are in active use. We request reversal.`,
    },
    // ── Visa 13.7 — Cancelled Merchandise/Services ──
    {
      id: "pw-v137-001", reason_code: "visa-13.7", merchant_category: "travel", amount_band: "large",
      evidence_types: ["refund_policy", "terms_accepted", "customer_comms", "service_rendered"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_017 — Reason Code 13.7

Transaction: ₹18,999 for round-trip Delhi-Goa flights, dated 19 Mar 2026.

The cardholder purchased non-refundable fare tickets. The fare rules were displayed during booking and accepted via click-through confirmation (timestamp: 19 Mar 2026, 14:00:05 IST). The booking confirmation email sent immediately after purchase included: "This is a non-refundable fare. Date changes permitted for a fee of ₹2,500 per passenger."

The cardholder requested cancellation on 25 Mar 2026. Our support team responded within 1 hour, explaining the non-refundable fare rules and offering a date change as an alternative. The cardholder declined.

The cancellation request was made 6 days after purchase for a non-refundable ticket. The policy was clearly disclosed. An alternative was offered and declined. We request reversal.`,
    },
    {
      id: "pw-v137-002", reason_code: "visa-13.7", merchant_category: "fitness", amount_band: "medium",
      evidence_types: ["refund_policy", "terms_accepted", "customer_comms", "usage_logs"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_018 — Reason Code 13.7

Transaction: ₹4,999 for a 6-month gym membership, dated 21 Mar 2026.

The membership terms clearly state a 3-month minimum commitment, with a 7-day cooling-off period for cancellation. These terms were presented during sign-up and accepted digitally (timestamp logged).

The cardholder requested cancellation on 28 Mar 2026 — 7 days after purchase, exactly at the end of the cooling-off period. However, the cardholder's gym access logs show 3 visits during the first week (22, 24, and 26 Mar), indicating the service was used.

Our team offered a 2-month membership freeze as a goodwill gesture. The cardholder declined and filed a dispute instead.

Policy was disclosed, service was used, and an alternative was offered. We request reversal.`,
    },
    {
      id: "pw-v137-003", reason_code: "visa-13.7", merchant_category: "entertainment", amount_band: "small",
      evidence_types: ["refund_policy", "event_rescheduled", "customer_comms"],
      representment_text: `To: Visa Dispute Resolution
Re: Dispute disp_EXAMPLE_019 — Reason Code 13.7

Transaction: ₹3,500 for 2 concert tickets, dated 23 Mar 2026.

The cardholder requests a refund because the event was rescheduled from 10 Apr to 24 Apr. Our terms of sale (accepted at checkout, timestamp logged) state: "For rescheduled events, tickets are valid for the new date. No refund offered for rescheduled events."

The event has NOT been cancelled — it has been rescheduled. The cardholder's tickets remain valid for 24 Apr. The terms were clear and accepted. No refund is warranted.

We communicated the rescheduled date to the cardholder on 30 Mar 2026 and confirmed their tickets are valid.

We request chargeback reversal as the service (event access) remains available to the cardholder.`,
    },
  ];
}
