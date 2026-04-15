import type {
  Dispute,
  DisputeCardData,
  TransactionData,
  MerchantData,
  ShippingData,
  CustomerComms,
  RefundPolicy,
  DeviceFingerprint,
} from "./types";

// ─── Dispute Cards (shown in selection grid) ────────────────────────────────

export const disputeCards: DisputeCardData[] = ([
  // Visa 13.1 — Merchandise Not Received (4 disputes)
  {
    id: "disp-001",
    razorpay_dispute_id: "disp_RZP001A",
    merchant_name: "ShopEasy India",
    reason_code: "visa-13.1",
    reason_description: "Merchandise/Services Not Received",
    network: "visa",
    amount: 349900,
    currency: "INR",
    dispute_date: "2026-04-01",
    respond_by: "2026-04-15",
    status: "open",
    merchant_category: "ecommerce",
  },
  {
    id: "disp-002",
    razorpay_dispute_id: "disp_RZP002B",
    merchant_name: "TechBazaar",
    reason_code: "visa-13.1",
    reason_description: "Merchandise/Services Not Received",
    network: "visa",
    amount: 8999900,
    currency: "INR",
    dispute_date: "2026-04-03",
    respond_by: "2026-04-17",
    status: "open",
    merchant_category: "electronics",
  },
  {
    id: "disp-003",
    razorpay_dispute_id: "disp_RZP003C",
    merchant_name: "FreshCart",
    reason_code: "visa-13.1",
    reason_description: "Merchandise/Services Not Received",
    network: "visa",
    amount: 124500,
    currency: "INR",
    dispute_date: "2026-04-05",
    respond_by: "2026-04-19",
    status: "open",
    merchant_category: "grocery",
  },
  {
    id: "disp-004",
    razorpay_dispute_id: "disp_RZP004D",
    merchant_name: "UrbanWear",
    reason_code: "visa-13.1",
    reason_description: "Merchandise/Services Not Received",
    network: "visa",
    amount: 599900,
    currency: "INR",
    dispute_date: "2026-03-28",
    respond_by: "2026-04-11",
    status: "open",
    merchant_category: "fashion",
  },
  // Visa 13.3 — Not as Described (3 disputes)
  {
    id: "disp-005",
    razorpay_dispute_id: "disp_RZP005E",
    merchant_name: "GadgetWorld",
    reason_code: "visa-13.3",
    reason_description: "Not as Described or Defective",
    network: "visa",
    amount: 2499900,
    currency: "INR",
    dispute_date: "2026-04-02",
    respond_by: "2026-04-16",
    status: "open",
    merchant_category: "electronics",
  },
  {
    id: "disp-006",
    razorpay_dispute_id: "disp_RZP006F",
    merchant_name: "HomeDecor Hub",
    reason_code: "visa-13.3",
    reason_description: "Not as Described or Defective",
    network: "visa",
    amount: 789900,
    currency: "INR",
    dispute_date: "2026-04-04",
    respond_by: "2026-04-18",
    status: "open",
    merchant_category: "home_furnishing",
  },
  {
    id: "disp-007",
    razorpay_dispute_id: "disp_RZP007G",
    merchant_name: "FitGear Pro",
    reason_code: "visa-13.3",
    reason_description: "Not as Described or Defective",
    network: "visa",
    amount: 449900,
    currency: "INR",
    dispute_date: "2026-04-06",
    respond_by: "2026-04-20",
    status: "open",
    merchant_category: "sports",
  },
  // Visa 10.4 — Fraud Card Absent (3 disputes)
  {
    id: "disp-008",
    razorpay_dispute_id: "disp_RZP008H",
    merchant_name: "CloudSoft SaaS",
    reason_code: "visa-10.4",
    reason_description: "Other Fraud — Card-Absent Environment",
    network: "visa",
    amount: 4999900,
    currency: "INR",
    dispute_date: "2026-04-01",
    respond_by: "2026-04-15",
    status: "open",
    merchant_category: "saas",
  },
  {
    id: "disp-009",
    razorpay_dispute_id: "disp_RZP009I",
    merchant_name: "StreamFlix India",
    reason_code: "visa-10.4",
    reason_description: "Other Fraud — Card-Absent Environment",
    network: "visa",
    amount: 59900,
    currency: "INR",
    dispute_date: "2026-04-03",
    respond_by: "2026-04-17",
    status: "open",
    merchant_category: "digital_media",
  },
  {
    id: "disp-010",
    razorpay_dispute_id: "disp_RZP010J",
    merchant_name: "TravelEase",
    reason_code: "visa-10.4",
    reason_description: "Other Fraud — Card-Absent Environment",
    network: "visa",
    amount: 15499900,
    currency: "INR",
    dispute_date: "2026-04-05",
    respond_by: "2026-04-12",
    status: "open",
    merchant_category: "travel",
  },
  // Mastercard 4853 — Cardholder Dispute Goods/Services (4 disputes)
  {
    id: "disp-011",
    razorpay_dispute_id: "disp_RZP011K",
    merchant_name: "MegaMart Online",
    reason_code: "mc-4853",
    reason_description: "Cardholder Dispute — Goods/Services Not Provided",
    network: "mastercard",
    amount: 679900,
    currency: "INR",
    dispute_date: "2026-04-02",
    respond_by: "2026-04-16",
    status: "open",
    merchant_category: "ecommerce",
  },
  {
    id: "disp-012",
    razorpay_dispute_id: "disp_RZP012L",
    merchant_name: "BookMyStay",
    reason_code: "mc-4853",
    reason_description: "Cardholder Dispute — Goods/Services Not Provided",
    network: "mastercard",
    amount: 1299900,
    currency: "INR",
    dispute_date: "2026-04-04",
    respond_by: "2026-04-18",
    status: "open",
    merchant_category: "travel",
  },
  {
    id: "disp-013",
    razorpay_dispute_id: "disp_RZP013M",
    merchant_name: "QuickBite",
    reason_code: "mc-4853",
    reason_description: "Cardholder Dispute — Goods/Services Not Provided",
    network: "mastercard",
    amount: 84900,
    currency: "INR",
    dispute_date: "2026-04-06",
    respond_by: "2026-04-20",
    status: "open",
    merchant_category: "food_delivery",
  },
  {
    id: "disp-014",
    razorpay_dispute_id: "disp_RZP014N",
    merchant_name: "PharmaQuick",
    reason_code: "mc-4853",
    reason_description: "Cardholder Dispute — Goods/Services Not Provided",
    network: "mastercard",
    amount: 234500,
    currency: "INR",
    dispute_date: "2026-03-30",
    respond_by: "2026-04-13",
    status: "open",
    merchant_category: "healthcare",
  },
  // Mastercard 4837 — No Cardholder Authorization (3 disputes)
  {
    id: "disp-015",
    razorpay_dispute_id: "disp_RZP015O",
    merchant_name: "LuxeWatch Co",
    reason_code: "mc-4837",
    reason_description: "No Cardholder Authorization",
    network: "mastercard",
    amount: 7899900,
    currency: "INR",
    dispute_date: "2026-04-01",
    respond_by: "2026-04-15",
    status: "open",
    merchant_category: "luxury",
  },
  {
    id: "disp-016",
    razorpay_dispute_id: "disp_RZP016P",
    merchant_name: "EduLearn Plus",
    reason_code: "mc-4837",
    reason_description: "No Cardholder Authorization",
    network: "mastercard",
    amount: 999900,
    currency: "INR",
    dispute_date: "2026-04-03",
    respond_by: "2026-04-17",
    status: "open",
    merchant_category: "edtech",
  },
  {
    id: "disp-017",
    razorpay_dispute_id: "disp_RZP017Q",
    merchant_name: "GameZone Digital",
    reason_code: "mc-4837",
    reason_description: "No Cardholder Authorization",
    network: "mastercard",
    amount: 149900,
    currency: "INR",
    dispute_date: "2026-04-05",
    respond_by: "2026-04-19",
    status: "open",
    merchant_category: "gaming",
  },
  // Visa 13.7 — Cancelled Merchandise/Services (3 disputes)
  {
    id: "disp-018",
    razorpay_dispute_id: "disp_RZP018R",
    merchant_name: "FlyHigh Airlines",
    reason_code: "visa-13.7",
    reason_description: "Cancelled Merchandise/Services",
    network: "visa",
    amount: 1899900,
    currency: "INR",
    dispute_date: "2026-04-02",
    respond_by: "2026-04-16",
    status: "open",
    merchant_category: "travel",
  },
  {
    id: "disp-019",
    razorpay_dispute_id: "disp_RZP019S",
    merchant_name: "FitZone Gym",
    reason_code: "visa-13.7",
    reason_description: "Cancelled Merchandise/Services",
    network: "visa",
    amount: 499900,
    currency: "INR",
    dispute_date: "2026-04-04",
    respond_by: "2026-04-11",
    status: "open",
    merchant_category: "fitness",
  },
  {
    id: "disp-020",
    razorpay_dispute_id: "disp_RZP020T",
    merchant_name: "EventPro Tickets",
    reason_code: "visa-13.7",
    reason_description: "Cancelled Merchandise/Services",
    network: "visa",
    amount: 350000,
    currency: "INR",
    dispute_date: "2026-04-06",
    respond_by: "2026-04-20",
    status: "open",
    merchant_category: "entertainment",
  },
] as Omit<DisputeCardData, "name">[]).map(d => ({ ...d, name: d.merchant_name }));

// ─── Full dispute data (keyed by card ID) ───────────────────────────────────

const disputes: Record<string, Dispute> = {};
for (const card of disputeCards) {
  disputes[card.id] = {
    id: card.id,
    razorpay_payment_id: `pay_${card.id.replace("disp-", "RZP")}`,
    razorpay_dispute_id: card.razorpay_dispute_id,
    reason_code: card.reason_code,
    reason_description: card.reason_description,
    network: card.network,
    amount: card.amount,
    currency: card.currency,
    merchant_id: `merch_${card.merchant_name.toLowerCase().replace(/\s+/g, "_")}`,
    merchant_name: card.merchant_name,
    merchant_category: card.merchant_category,
    customer_email: `customer_${card.id.replace("disp-", "")}@gmail.com`,
    customer_id: `cust_${card.id.replace("disp-", "")}`,
    transaction_date: new Date(new Date(card.dispute_date).getTime() - 14 * 86400000).toISOString().split("T")[0],
    dispute_date: card.dispute_date,
    respond_by: card.respond_by,
    status: card.status as Dispute["status"],
    amount_band: card.amount < 100000 ? "micro" : card.amount < 500000 ? "small" : card.amount < 2000000 ? "medium" : "large",
  };
}

export function getDisputeById(cardId: string): Dispute | null {
  return disputes[cardId] || null;
}

// ─── Mock transaction data ──────────────────────────────────────────────────

const transactions: Record<string, TransactionData> = {
  pay_RZP001: { payment_id: "pay_RZP001", amount: 349900, currency: "INR", method: "card", card_last4: "4242", card_network: "visa", timestamp: "2026-03-18T14:23:00+05:30", ip_address: "103.21.58.193", billing_address: "42 MG Road, Indiranagar, Bengaluru 560038", shipping_address: "42 MG Road, Indiranagar, Bengaluru 560038", description: "Nike Air Max 270 - Size 10", auth_type: "3ds", avs_result: "match" },
  pay_RZP002: { payment_id: "pay_RZP002", amount: 8999900, currency: "INR", method: "card", card_last4: "8891", card_network: "visa", timestamp: "2026-03-20T10:45:00+05:30", ip_address: "49.36.142.87", billing_address: "15 Nehru Place, New Delhi 110019", shipping_address: "15 Nehru Place, New Delhi 110019", description: "MacBook Air M3 - Space Grey", auth_type: "3ds", avs_result: "match" },
  pay_RZP003: { payment_id: "pay_RZP003", amount: 124500, currency: "INR", method: "card", card_last4: "3156", card_network: "visa", timestamp: "2026-03-22T18:30:00+05:30", ip_address: "106.51.77.234", billing_address: "78 Park Street, Kolkata 700016", shipping_address: "78 Park Street, Kolkata 700016", description: "Weekly grocery order - fruits, vegetables, dairy", auth_type: "non_3ds", avs_result: "match" },
  pay_RZP004: { payment_id: "pay_RZP004", amount: 599900, currency: "INR", method: "card", card_last4: "7023", card_network: "visa", timestamp: "2026-03-14T20:15:00+05:30", ip_address: "122.161.52.143", billing_address: "23 FC Road, Pune 411004", shipping_address: "99 Viman Nagar, Pune 411014", description: "Levi's Denim Jacket + 2 T-shirts", auth_type: "3ds", avs_result: "match" },
  pay_RZP005: { payment_id: "pay_RZP005", amount: 2499900, currency: "INR", method: "card", card_last4: "5567", card_network: "visa", timestamp: "2026-03-19T11:00:00+05:30", ip_address: "157.49.183.22", billing_address: "Block C, Sector 62, Noida 201301", shipping_address: "Block C, Sector 62, Noida 201301", description: "Sony WH-1000XM5 Headphones + Samsung Galaxy Watch 6", auth_type: "3ds", avs_result: "match" },
  pay_RZP006: { payment_id: "pay_RZP006", amount: 789900, currency: "INR", method: "card", card_last4: "9234", card_network: "visa", timestamp: "2026-03-21T09:30:00+05:30", ip_address: "203.122.45.67", billing_address: "14 Boat Club Road, Chennai 600028", shipping_address: "14 Boat Club Road, Chennai 600028", description: "Italian Marble Coffee Table - White", auth_type: "non_3ds", avs_result: "match" },
  pay_RZP007: { payment_id: "pay_RZP007", amount: 449900, currency: "INR", method: "card", card_last4: "1178", card_network: "visa", timestamp: "2026-03-23T16:45:00+05:30", ip_address: "182.73.26.98", billing_address: "55 Jubilee Hills, Hyderabad 500033", shipping_address: "55 Jubilee Hills, Hyderabad 500033", description: "Fitbit Sense 2 + Yoga Mat + Resistance Bands", auth_type: "3ds", avs_result: "match" },
  pay_RZP008: { payment_id: "pay_RZP008", amount: 4999900, currency: "INR", method: "card", card_last4: "6643", card_network: "visa", timestamp: "2026-03-18T08:00:00+05:30", ip_address: "103.21.58.193", billing_address: "Tower B, Cyber City, Gurugram 122002", shipping_address: "Tower B, Cyber City, Gurugram 122002", description: "CloudSoft Enterprise Plan - Annual Subscription", auth_type: "3ds", avs_result: "match" },
  pay_RZP009: { payment_id: "pay_RZP009", amount: 59900, currency: "INR", method: "card", card_last4: "2290", card_network: "visa", timestamp: "2026-03-20T22:10:00+05:30", ip_address: "45.127.89.12", billing_address: "301 Palm Beach, Mumbai 400064", shipping_address: "301 Palm Beach, Mumbai 400064", description: "StreamFlix Premium - Monthly", auth_type: "non_3ds", avs_result: "unavailable" },
  pay_RZP010: { payment_id: "pay_RZP010", amount: 15499900, currency: "INR", method: "card", card_last4: "4455", card_network: "visa", timestamp: "2026-03-22T13:20:00+05:30", ip_address: "89.47.162.33", billing_address: "12 Residency Road, Bengaluru 560025", shipping_address: "12 Residency Road, Bengaluru 560025", description: "Mumbai-London Round Trip - 2 Adults, Business Class", auth_type: "3ds", avs_result: "match" },
  pay_RZP011: { payment_id: "pay_RZP011", amount: 679900, currency: "INR", method: "card", card_last4: "8812", card_network: "mastercard", timestamp: "2026-03-19T15:00:00+05:30", ip_address: "117.200.44.56", billing_address: "88 Anna Salai, Chennai 600002", shipping_address: "88 Anna Salai, Chennai 600002", description: "Samsung 43-inch Smart TV", auth_type: "3ds", avs_result: "match" },
  pay_RZP012: { payment_id: "pay_RZP012", amount: 1299900, currency: "INR", method: "card", card_last4: "3347", card_network: "mastercard", timestamp: "2026-03-21T10:00:00+05:30", ip_address: "106.51.23.89", billing_address: "45 Civil Lines, Jaipur 302006", shipping_address: "45 Civil Lines, Jaipur 302006", description: "Hotel booking - Goa, 3 nights, Deluxe Room", auth_type: "3ds", avs_result: "match" },
  pay_RZP013: { payment_id: "pay_RZP013", amount: 84900, currency: "INR", method: "card", card_last4: "5578", card_network: "mastercard", timestamp: "2026-03-23T19:45:00+05:30", ip_address: "223.186.12.34", billing_address: "22 Koramangala, Bengaluru 560034", shipping_address: "22 Koramangala, Bengaluru 560034", description: "Food order - 2x Biryani, 1x Dal Makhani, Naan", auth_type: "non_3ds", avs_result: "match" },
  pay_RZP014: { payment_id: "pay_RZP014", amount: 234500, currency: "INR", method: "card", card_last4: "6691", card_network: "mastercard", timestamp: "2026-03-16T12:30:00+05:30", ip_address: "59.95.178.45", billing_address: "10 Banjara Hills, Hyderabad 500034", shipping_address: "10 Banjara Hills, Hyderabad 500034", description: "Prescription medicines - monthly supply", auth_type: "non_3ds", avs_result: "match" },
  pay_RZP015: { payment_id: "pay_RZP015", amount: 7899900, currency: "INR", method: "card", card_last4: "1199", card_network: "mastercard", timestamp: "2026-03-18T11:30:00+05:30", ip_address: "185.220.101.42", billing_address: "Apt 1201, Powai, Mumbai 400076", shipping_address: "Apt 1201, Powai, Mumbai 400076", description: "Omega Seamaster Aqua Terra - Blue Dial", auth_type: "non_3ds", avs_result: "mismatch" },
  pay_RZP016: { payment_id: "pay_RZP016", amount: 999900, currency: "INR", method: "card", card_last4: "7734", card_network: "mastercard", timestamp: "2026-03-20T09:00:00+05:30", ip_address: "103.40.56.78", billing_address: "67 Ashram Road, Ahmedabad 380009", shipping_address: "67 Ashram Road, Ahmedabad 380009", description: "Data Science Bootcamp - 6 month access", auth_type: "3ds", avs_result: "match" },
  pay_RZP017: { payment_id: "pay_RZP017", amount: 149900, currency: "INR", method: "card", card_last4: "4401", card_network: "mastercard", timestamp: "2026-03-22T21:00:00+05:30", ip_address: "49.36.88.112", billing_address: "33 Salt Lake, Kolkata 700091", shipping_address: "33 Salt Lake, Kolkata 700091", description: "In-game purchase - Premium Battle Pass + V-Bucks", auth_type: "non_3ds", avs_result: "unavailable" },
  pay_RZP018: { payment_id: "pay_RZP018", amount: 1899900, currency: "INR", method: "card", card_last4: "5523", card_network: "visa", timestamp: "2026-03-19T14:00:00+05:30", ip_address: "122.161.73.45", billing_address: "9 Linking Road, Mumbai 400050", shipping_address: "9 Linking Road, Mumbai 400050", description: "Delhi-Goa Flight - 2 passengers, return trip", auth_type: "3ds", avs_result: "match" },
  pay_RZP019: { payment_id: "pay_RZP019", amount: 499900, currency: "INR", method: "card", card_last4: "8867", card_network: "visa", timestamp: "2026-03-21T07:30:00+05:30", ip_address: "157.49.56.78", billing_address: "12 MG Road, Kochi 682016", shipping_address: "12 MG Road, Kochi 682016", description: "Gym membership - 6 months, premium plan", auth_type: "3ds", avs_result: "match" },
  pay_RZP020: { payment_id: "pay_RZP020", amount: 350000, currency: "INR", method: "card", card_last4: "2256", card_network: "visa", timestamp: "2026-03-23T12:00:00+05:30", ip_address: "203.122.88.91", billing_address: "45 Connaught Place, New Delhi 110001", shipping_address: "45 Connaught Place, New Delhi 110001", description: "Concert tickets - Arijit Singh Live, 2 VIP passes", auth_type: "3ds", avs_result: "match" },
};

// ─── Mock merchant data ─────────────────────────────────────────────────────

const merchants: Record<string, MerchantData> = {
  merch_shopeasy_india: { merchant_id: "merch_shopeasy_india", name: "ShopEasy India", category: "ecommerce", mcc_code: "5411", website: "https://shopeasy.in", refund_policy_url: "https://shopeasy.in/refund-policy", risk_score: 12, registered_address: "HSR Layout, Bengaluru", support_email: "support@shopeasy.in", support_phone: "+91-80-4567-8901" },
  merch_techbazaar: { merchant_id: "merch_techbazaar", name: "TechBazaar", category: "electronics", mcc_code: "5732", website: "https://techbazaar.in", refund_policy_url: "https://techbazaar.in/returns", risk_score: 8, registered_address: "Nehru Place, New Delhi", support_email: "help@techbazaar.in", support_phone: "+91-11-2345-6789" },
  merch_freshcart: { merchant_id: "merch_freshcart", name: "FreshCart", category: "grocery", mcc_code: "5411", website: "https://freshcart.in", refund_policy_url: "https://freshcart.in/refunds", risk_score: 5, registered_address: "Park Street, Kolkata", support_email: "support@freshcart.in", support_phone: "+91-33-4567-1234" },
  merch_urbanwear: { merchant_id: "merch_urbanwear", name: "UrbanWear", category: "fashion", mcc_code: "5651", website: "https://urbanwear.in", refund_policy_url: "https://urbanwear.in/return-policy", risk_score: 15, registered_address: "FC Road, Pune", support_email: "returns@urbanwear.in", support_phone: "+91-20-6789-0123" },
  merch_gadgetworld: { merchant_id: "merch_gadgetworld", name: "GadgetWorld", category: "electronics", mcc_code: "5732", website: "https://gadgetworld.in", refund_policy_url: "https://gadgetworld.in/warranty", risk_score: 10, registered_address: "Sector 62, Noida", support_email: "support@gadgetworld.in", support_phone: "+91-120-456-7890" },
  merch_homedecor_hub: { merchant_id: "merch_homedecor_hub", name: "HomeDecor Hub", category: "home_furnishing", mcc_code: "5712", website: "https://homedecorhub.in", refund_policy_url: "https://homedecorhub.in/returns", risk_score: 7, registered_address: "Boat Club Road, Chennai", support_email: "care@homedecorhub.in", support_phone: "+91-44-5678-9012" },
  merch_fitgear_pro: { merchant_id: "merch_fitgear_pro", name: "FitGear Pro", category: "sports", mcc_code: "5941", website: "https://fitgearpro.in", refund_policy_url: "https://fitgearpro.in/refund", risk_score: 6, registered_address: "Jubilee Hills, Hyderabad", support_email: "support@fitgearpro.in", support_phone: "+91-40-6789-3456" },
  merch_cloudsoft_saas: { merchant_id: "merch_cloudsoft_saas", name: "CloudSoft SaaS", category: "saas", mcc_code: "5817", website: "https://cloudsoft.io", refund_policy_url: "https://cloudsoft.io/terms#refund", risk_score: 3, registered_address: "Cyber City, Gurugram", support_email: "billing@cloudsoft.io", support_phone: "+91-124-456-7890" },
  merch_streamflix_india: { merchant_id: "merch_streamflix_india", name: "StreamFlix India", category: "digital_media", mcc_code: "5815", website: "https://streamflix.in", refund_policy_url: "https://streamflix.in/refund", risk_score: 4, registered_address: "Palm Beach, Mumbai", support_email: "support@streamflix.in", support_phone: "+91-22-3456-7890" },
  merch_travelease: { merchant_id: "merch_travelease", name: "TravelEase", category: "travel", mcc_code: "4722", website: "https://travelease.in", refund_policy_url: "https://travelease.in/cancellation", risk_score: 18, registered_address: "Residency Road, Bengaluru", support_email: "support@travelease.in", support_phone: "+91-80-5678-1234" },
  merch_megamart_online: { merchant_id: "merch_megamart_online", name: "MegaMart Online", category: "ecommerce", mcc_code: "5311", website: "https://megamart.in", refund_policy_url: "https://megamart.in/returns", risk_score: 9, registered_address: "Anna Salai, Chennai", support_email: "help@megamart.in", support_phone: "+91-44-4567-8901" },
  merch_bookmystay: { merchant_id: "merch_bookmystay", name: "BookMyStay", category: "travel", mcc_code: "7011", website: "https://bookmystay.in", refund_policy_url: "https://bookmystay.in/cancellation-policy", risk_score: 11, registered_address: "Civil Lines, Jaipur", support_email: "support@bookmystay.in", support_phone: "+91-141-456-7890" },
  merch_quickbite: { merchant_id: "merch_quickbite", name: "QuickBite", category: "food_delivery", mcc_code: "5812", website: "https://quickbite.in", refund_policy_url: "https://quickbite.in/refund", risk_score: 6, registered_address: "Koramangala, Bengaluru", support_email: "help@quickbite.in", support_phone: "+91-80-6789-0123" },
  merch_pharmaquick: { merchant_id: "merch_pharmaquick", name: "PharmaQuick", category: "healthcare", mcc_code: "5912", website: "https://pharmaquick.in", refund_policy_url: "https://pharmaquick.in/return-policy", risk_score: 4, registered_address: "Banjara Hills, Hyderabad", support_email: "support@pharmaquick.in", support_phone: "+91-40-5678-9012" },
  merch_luxewatch_co: { merchant_id: "merch_luxewatch_co", name: "LuxeWatch Co", category: "luxury", mcc_code: "5944", website: "https://luxewatch.co.in", refund_policy_url: "https://luxewatch.co.in/returns", risk_score: 22, registered_address: "Powai, Mumbai", support_email: "concierge@luxewatch.co.in", support_phone: "+91-22-6789-0123" },
  merch_edulearn_plus: { merchant_id: "merch_edulearn_plus", name: "EduLearn Plus", category: "edtech", mcc_code: "8299", website: "https://edulearn.plus", refund_policy_url: "https://edulearn.plus/refund", risk_score: 5, registered_address: "Ashram Road, Ahmedabad", support_email: "support@edulearn.plus", support_phone: "+91-79-4567-8901" },
  merch_gamezone_digital: { merchant_id: "merch_gamezone_digital", name: "GameZone Digital", category: "gaming", mcc_code: "5816", website: "https://gamezone.in", refund_policy_url: "https://gamezone.in/refund-policy", risk_score: 14, registered_address: "Salt Lake, Kolkata", support_email: "support@gamezone.in", support_phone: "+91-33-6789-0123" },
  merch_flyhigh_airlines: { merchant_id: "merch_flyhigh_airlines", name: "FlyHigh Airlines", category: "travel", mcc_code: "3000", website: "https://flyhigh.in", refund_policy_url: "https://flyhigh.in/fare-rules", risk_score: 8, registered_address: "Linking Road, Mumbai", support_email: "support@flyhigh.in", support_phone: "+91-22-4567-8901" },
  merch_fitzone_gym: { merchant_id: "merch_fitzone_gym", name: "FitZone Gym", category: "fitness", mcc_code: "7941", website: "https://fitzone.in", refund_policy_url: "https://fitzone.in/membership-terms", risk_score: 7, registered_address: "MG Road, Kochi", support_email: "members@fitzone.in", support_phone: "+91-484-567-8901" },
  merch_eventpro_tickets: { merchant_id: "merch_eventpro_tickets", name: "EventPro Tickets", category: "entertainment", mcc_code: "7922", website: "https://eventpro.in", refund_policy_url: "https://eventpro.in/refund-policy", risk_score: 10, registered_address: "Connaught Place, New Delhi", support_email: "help@eventpro.in", support_phone: "+91-11-5678-9012" },
};

// ─── Mock shipping data ─────────────────────────────────────────────────────

const shippingData: Record<string, ShippingData> = {
  pay_RZP001: { payment_id: "pay_RZP001", carrier: "Delhivery", tracking_id: "DLV2026031801234", status: "delivered", shipped_date: "2026-03-19", estimated_delivery: "2026-03-23", actual_delivery: "2026-03-22", delivery_proof: "OTP verified (4821)", delivery_signature: "Digital signature captured", delivery_photo_url: "https://proof.delhivery.com/DLV2026031801234.jpg", delivery_pin_code: "560038", billing_pin_code: "560038" },
  pay_RZP002: { payment_id: "pay_RZP002", carrier: "BlueDart", tracking_id: "BD2026032045678", status: "delivered", shipped_date: "2026-03-21", estimated_delivery: "2026-03-25", actual_delivery: "2026-03-24", delivery_proof: "Signed by: Rahul S.", delivery_signature: "Physical signature on file", delivery_photo_url: "https://proof.bluedart.com/BD2026032045678.jpg", delivery_pin_code: "110019", billing_pin_code: "110019" },
  pay_RZP003: { payment_id: "pay_RZP003", carrier: "Dunzo", tracking_id: "DNZ20260322X789", status: "delivered", shipped_date: "2026-03-22", estimated_delivery: "2026-03-22", actual_delivery: "2026-03-22", delivery_proof: "Delivered at doorstep", delivery_pin_code: "700016", billing_pin_code: "700016" },
  pay_RZP004: { payment_id: "pay_RZP004", carrier: "DTDC", tracking_id: "DTDC2026031490AB", status: "delivered", shipped_date: "2026-03-15", estimated_delivery: "2026-03-19", actual_delivery: "2026-03-20", delivery_proof: "Left at reception", delivery_pin_code: "411014", billing_pin_code: "411004" },
  pay_RZP005: { payment_id: "pay_RZP005", carrier: "Delhivery", tracking_id: "DLV2026031956CD", status: "delivered", shipped_date: "2026-03-20", estimated_delivery: "2026-03-24", actual_delivery: "2026-03-23", delivery_proof: "OTP verified (7392)", delivery_signature: "Digital signature captured", delivery_photo_url: "https://proof.delhivery.com/DLV2026031956CD.jpg", delivery_pin_code: "201301", billing_pin_code: "201301" },
  pay_RZP006: { payment_id: "pay_RZP006", carrier: "Professional Couriers", tracking_id: "PC2026032178EF", status: "delivered", shipped_date: "2026-03-22", estimated_delivery: "2026-03-27", actual_delivery: "2026-03-28", delivery_proof: "Signed by: Priya M.", delivery_signature: "Physical signature", delivery_pin_code: "600028", billing_pin_code: "600028" },
  pay_RZP007: { payment_id: "pay_RZP007", carrier: "Ecom Express", tracking_id: "ECM20260323GH12", status: "delivered", shipped_date: "2026-03-24", estimated_delivery: "2026-03-28", actual_delivery: "2026-03-27", delivery_proof: "OTP verified (5614)", delivery_pin_code: "500033", billing_pin_code: "500033" },
  pay_RZP011: { payment_id: "pay_RZP011", carrier: "BlueDart", tracking_id: "BD2026031934IJ", status: "delivered", shipped_date: "2026-03-20", estimated_delivery: "2026-03-24", actual_delivery: "2026-03-23", delivery_proof: "OTP verified (8847)", delivery_signature: "Digital signature captured", delivery_pin_code: "600002", billing_pin_code: "600002" },
  pay_RZP012: { payment_id: "pay_RZP012", carrier: "N/A", tracking_id: "N/A", status: "not_applicable", shipped_date: "N/A", estimated_delivery: "N/A", delivery_pin_code: "302006", billing_pin_code: "302006" },
  pay_RZP013: { payment_id: "pay_RZP013", carrier: "Dunzo", tracking_id: "DNZ20260323KL45", status: "delivered", shipped_date: "2026-03-23", estimated_delivery: "2026-03-23", actual_delivery: "2026-03-23", delivery_proof: "Delivered to customer", delivery_pin_code: "560034", billing_pin_code: "560034" },
  pay_RZP014: { payment_id: "pay_RZP014", carrier: "Delhivery", tracking_id: "DLV2026031690MN", status: "delivered", shipped_date: "2026-03-17", estimated_delivery: "2026-03-20", actual_delivery: "2026-03-19", delivery_proof: "OTP verified (3356)", delivery_pin_code: "500034", billing_pin_code: "500034" },
};

// ─── Mock customer communications ───────────────────────────────────────────

const customerComms: Record<string, CustomerComms> = {
  pay_RZP001: { payment_id: "pay_RZP001", messages: [
    { timestamp: "2026-03-23T10:00:00+05:30", channel: "email", direction: "inbound", subject: "Where is my order?", body: "Hi, I ordered shoes 5 days ago and haven't received them yet. My order number is ORD-001. Can you check?" },
    { timestamp: "2026-03-23T11:30:00+05:30", channel: "email", direction: "outbound", subject: "Re: Where is my order?", body: "Hi, your order was delivered on March 22 at 2:45 PM. Delivery was confirmed via OTP (4821). Please check with family members or building security." },
    { timestamp: "2026-03-24T09:00:00+05:30", channel: "email", direction: "inbound", subject: "Re: Where is my order?", body: "I checked everywhere, I did not receive any package. Please refund." },
  ]},
  pay_RZP005: { payment_id: "pay_RZP005", messages: [
    { timestamp: "2026-03-25T14:00:00+05:30", channel: "chat", direction: "inbound", body: "The headphones I received are not the XM5 model. The box says XM5 but inside are cheap knockoffs. The watch is fine." },
    { timestamp: "2026-03-25T14:15:00+05:30", channel: "chat", direction: "outbound", body: "We're sorry to hear that. Could you share photos of the product and the packaging?" },
    { timestamp: "2026-03-25T14:30:00+05:30", channel: "chat", direction: "inbound", body: "Sent photos on email. The serial number doesn't match Sony's database." },
    { timestamp: "2026-03-25T15:00:00+05:30", channel: "chat", direction: "outbound", body: "We've verified the serial number and it does match our records from the Sony authorized distributor. The serial SN-WH1000XM5-2026-IND-4521 is valid." },
  ]},
  pay_RZP006: { payment_id: "pay_RZP006", messages: [
    { timestamp: "2026-03-30T10:00:00+05:30", channel: "email", direction: "inbound", subject: "Product not matching listing", body: "The coffee table I received has visible scratches and the marble pattern doesn't match the listing photo at all. This is unacceptable for a ₹7,899 item." },
    { timestamp: "2026-03-30T12:00:00+05:30", channel: "email", direction: "outbound", subject: "Re: Product not matching listing", body: "We apologize for the inconvenience. Natural marble has variations in pattern. However, we'd like to offer a replacement or store credit. Could you share photos?" },
    { timestamp: "2026-03-31T09:00:00+05:30", channel: "email", direction: "inbound", subject: "Re: Product not matching listing", body: "Photos attached. I want a refund, not a replacement." },
  ]},
  pay_RZP007: { payment_id: "pay_RZP007", messages: [] },
  pay_RZP013: { payment_id: "pay_RZP013", messages: [
    { timestamp: "2026-03-23T20:30:00+05:30", channel: "chat", direction: "inbound", body: "My food order arrived cold and the dal makhani was spoiled. Very unhygienic." },
    { timestamp: "2026-03-23T20:45:00+05:30", channel: "chat", direction: "outbound", body: "We're sorry about your experience. We've initiated a refund of ₹849 to your account. It should reflect in 5-7 business days." },
  ]},
  pay_RZP018: { payment_id: "pay_RZP018", messages: [
    { timestamp: "2026-03-25T10:00:00+05:30", channel: "email", direction: "inbound", subject: "Flight cancellation", body: "I need to cancel my Delhi-Goa flight for April 5 due to a family emergency. Please process a full refund." },
    { timestamp: "2026-03-25T11:00:00+05:30", channel: "email", direction: "outbound", subject: "Re: Flight cancellation", body: "We understand your situation. As per our fare rules, this ticket is non-refundable but we can offer a date change for ₹2,500 per passenger." },
    { timestamp: "2026-03-25T12:00:00+05:30", channel: "email", direction: "inbound", subject: "Re: Flight cancellation", body: "That's not acceptable. I want a full refund. I'll dispute this with my bank." },
  ]},
  pay_RZP019: { payment_id: "pay_RZP019", messages: [
    { timestamp: "2026-03-28T08:00:00+05:30", channel: "email", direction: "inbound", subject: "Cancel membership", body: "I want to cancel my gym membership effective immediately. I haven't used the gym in 2 months and was told I could cancel anytime." },
    { timestamp: "2026-03-28T10:00:00+05:30", channel: "email", direction: "outbound", subject: "Re: Cancel membership", body: "Thank you for contacting us. Your 6-month plan has a minimum commitment of 3 months. You've completed 1 month. We can freeze your membership for up to 2 months free of charge." },
    { timestamp: "2026-03-28T11:00:00+05:30", channel: "email", direction: "inbound", subject: "Re: Cancel membership", body: "I was never told about the 3-month minimum. This is misleading. I'm disputing the charge." },
  ]},
  pay_RZP020: { payment_id: "pay_RZP020", messages: [
    { timestamp: "2026-03-30T10:00:00+05:30", channel: "email", direction: "inbound", subject: "Concert cancelled", body: "The Arijit Singh concert on April 10 has been cancelled. I need a refund for my 2 VIP tickets." },
    { timestamp: "2026-03-30T14:00:00+05:30", channel: "email", direction: "outbound", subject: "Re: Concert cancelled", body: "The concert has been rescheduled to April 24. Your tickets are valid for the new date. Refunds are not offered for rescheduled events per our terms." },
  ]},
};

// ─── Mock refund policies ───────────────────────────────────────────────────

const refundPolicies: Record<string, RefundPolicy> = {
  merch_shopeasy_india: { merchant_id: "merch_shopeasy_india", refund_window_days: 15, cancellation_allowed: true, cancellation_window_hours: 24, restocking_fee_percent: 0, digital_goods_refundable: false, policy_text: "Full refund within 15 days of delivery for unused items in original packaging. Free returns on all orders above ₹500. Refund processed within 5-7 business days.", policy_url: "https://shopeasy.in/refund-policy", last_updated: "2026-01-15" },
  merch_techbazaar: { merchant_id: "merch_techbazaar", refund_window_days: 10, cancellation_allowed: true, cancellation_window_hours: 12, restocking_fee_percent: 10, digital_goods_refundable: false, policy_text: "10-day return policy for electronics. Items must be in original packaging with all accessories. 10% restocking fee applies. Damaged items replaced under warranty.", policy_url: "https://techbazaar.in/returns", last_updated: "2026-02-01" },
  merch_urbanwear: { merchant_id: "merch_urbanwear", refund_window_days: 30, cancellation_allowed: true, cancellation_window_hours: 48, restocking_fee_percent: 0, digital_goods_refundable: false, policy_text: "30-day hassle-free returns. Items must be unworn with tags attached. Exchange or full refund available. Free return shipping.", policy_url: "https://urbanwear.in/return-policy", last_updated: "2025-12-01" },
  merch_flyhigh_airlines: { merchant_id: "merch_flyhigh_airlines", refund_window_days: 0, cancellation_allowed: false, cancellation_window_hours: 0, restocking_fee_percent: 100, digital_goods_refundable: false, policy_text: "Non-refundable fares cannot be refunded. Date changes permitted for a fee of ₹2,500 per passenger. Refundable fares can be cancelled up to 24 hours before departure with full refund minus convenience fee.", policy_url: "https://flyhigh.in/fare-rules", last_updated: "2026-03-01" },
  merch_fitzone_gym: { merchant_id: "merch_fitzone_gym", refund_window_days: 7, cancellation_allowed: true, cancellation_window_hours: 168, restocking_fee_percent: 0, digital_goods_refundable: false, policy_text: "7-day cooling off period for new memberships. After cooling off, 6-month plans have a 3-month minimum commitment. Early termination fee of 50% of remaining months applies. Membership freeze available for up to 2 months.", policy_url: "https://fitzone.in/membership-terms", last_updated: "2026-01-01" },
  merch_eventpro_tickets: { merchant_id: "merch_eventpro_tickets", refund_window_days: 0, cancellation_allowed: false, cancellation_window_hours: 0, restocking_fee_percent: 100, digital_goods_refundable: false, policy_text: "All ticket sales are final. No refunds or exchanges. For cancelled events, full refund processed automatically. For rescheduled events, tickets are valid for the new date; no refund offered.", policy_url: "https://eventpro.in/refund-policy", last_updated: "2026-02-15" },
  merch_cloudsoft_saas: { merchant_id: "merch_cloudsoft_saas", refund_window_days: 30, cancellation_allowed: true, cancellation_window_hours: 720, restocking_fee_percent: 0, digital_goods_refundable: true, policy_text: "30-day money back guarantee on annual plans. Monthly plans can be cancelled anytime with no refund for the current month. Pro-rata refund for annual plans cancelled after 30 days.", policy_url: "https://cloudsoft.io/terms#refund", last_updated: "2026-01-10" },
  merch_quickbite: { merchant_id: "merch_quickbite", refund_window_days: 0, cancellation_allowed: true, cancellation_window_hours: 0, restocking_fee_percent: 0, digital_goods_refundable: false, policy_text: "Refunds for food quality issues within 2 hours of delivery. Photo evidence required. Full refund for undelivered orders. Partial refund for missing items.", policy_url: "https://quickbite.in/refund", last_updated: "2026-03-01" },
};

// ─── Mock device fingerprints ───────────────────────────────────────────────

const deviceFingerprints: Record<string, DeviceFingerprint> = {
  pay_RZP008: { payment_id: "pay_RZP008", device_id: "dev_a1b2c3d4e5", ip_address: "103.21.58.193", ip_country: "India", ip_city: "Gurugram", browser: "Chrome 122.0", os: "Windows 11", is_vpn: false, is_proxy: false, three_ds_authenticated: true, three_ds_version: "2.2.0", prior_transactions_from_device: 12, prior_transactions_from_ip: 15, risk_signals: [] },
  pay_RZP009: { payment_id: "pay_RZP009", device_id: "dev_x9y8z7w6v5", ip_address: "45.127.89.12", ip_country: "India", ip_city: "Mumbai", browser: "Safari 17.3", os: "macOS 14.3", is_vpn: true, is_proxy: false, three_ds_authenticated: false, prior_transactions_from_device: 1, prior_transactions_from_ip: 1, risk_signals: ["vpn_detected", "new_device", "no_3ds"] },
  pay_RZP010: { payment_id: "pay_RZP010", device_id: "dev_m3n4o5p6q7", ip_address: "89.47.162.33", ip_country: "Romania", ip_city: "Bucharest", browser: "Firefox 123.0", os: "Linux", is_vpn: true, is_proxy: true, three_ds_authenticated: true, three_ds_version: "2.2.0", prior_transactions_from_device: 0, prior_transactions_from_ip: 0, risk_signals: ["foreign_ip", "vpn_detected", "proxy_detected", "new_device", "ip_country_mismatch"] },
  pay_RZP015: { payment_id: "pay_RZP015", device_id: "dev_r8s9t0u1v2", ip_address: "185.220.101.42", ip_country: "Netherlands", ip_city: "Amsterdam", browser: "Chrome 121.0", os: "Android 14", is_vpn: true, is_proxy: false, three_ds_authenticated: false, prior_transactions_from_device: 0, prior_transactions_from_ip: 0, risk_signals: ["foreign_ip", "vpn_detected", "no_3ds", "new_device", "avs_mismatch", "high_value_first_transaction"] },
  pay_RZP016: { payment_id: "pay_RZP016", device_id: "dev_w3x4y5z6a7", ip_address: "103.40.56.78", ip_country: "India", ip_city: "Ahmedabad", browser: "Chrome 122.0", os: "Windows 11", is_vpn: false, is_proxy: false, three_ds_authenticated: true, three_ds_version: "2.1.0", prior_transactions_from_device: 8, prior_transactions_from_ip: 10, risk_signals: [] },
  pay_RZP017: { payment_id: "pay_RZP017", device_id: "dev_b8c9d0e1f2", ip_address: "49.36.88.112", ip_country: "India", ip_city: "Kolkata", browser: "Chrome 122.0", os: "Android 13", is_vpn: false, is_proxy: false, three_ds_authenticated: false, prior_transactions_from_device: 3, prior_transactions_from_ip: 5, risk_signals: ["no_3ds"] },
};

// ─── Data accessor functions (used by tools) ────────────────────────────────

export function getTransactionData(paymentId: string): TransactionData | null {
  return transactions[paymentId] || null;
}

export function getMerchantData(merchantId: string): MerchantData | null {
  return merchants[merchantId] || null;
}

export function getShippingData(paymentId: string): ShippingData | null {
  return shippingData[paymentId] || null;
}

export function getCustomerComms(paymentId: string): CustomerComms | null {
  return customerComms[paymentId] || null;
}

export function getRefundPolicyData(merchantId: string): RefundPolicy | null {
  return refundPolicies[merchantId] || null;
}

export function getDeviceFingerprintData(paymentId: string): DeviceFingerprint | null {
  return deviceFingerprints[paymentId] || null;
}
