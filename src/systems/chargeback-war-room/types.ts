export interface Dispute {
  id: string;
  razorpay_payment_id: string;
  razorpay_dispute_id: string;
  reason_code: string;
  reason_description: string;
  network: "visa" | "mastercard";
  amount: number; // in paise
  currency: string;
  merchant_id: string;
  merchant_name: string;
  merchant_category: string;
  customer_email: string;
  customer_id: string;
  transaction_date: string;
  dispute_date: string;
  respond_by: string;
  status: "open" | "under_review" | "won" | "lost";
  amount_band: "micro" | "small" | "medium" | "large";
}

export interface DisputeCardData {
  id: string;
  name: string; // alias for merchant_name, for UI compatibility
  razorpay_dispute_id: string;
  merchant_name: string;
  reason_code: string;
  reason_description: string;
  network: "visa" | "mastercard";
  amount: number; // in paise
  currency: string;
  dispute_date: string;
  respond_by: string;
  status: string;
  merchant_category: string;
}

export interface TransactionData {
  payment_id: string;
  amount: number;
  currency: string;
  method: "card" | "upi" | "netbanking";
  card_last4?: string;
  card_network?: string;
  timestamp: string;
  ip_address: string;
  billing_address: string;
  shipping_address: string;
  description: string;
  auth_type?: "3ds" | "non_3ds";
  avs_result?: "match" | "mismatch" | "unavailable";
}

export interface MerchantData {
  merchant_id: string;
  name: string;
  category: string;
  mcc_code: string;
  website: string;
  refund_policy_url: string;
  risk_score: number;
  registered_address: string;
  support_email: string;
  support_phone: string;
}

export interface ShippingData {
  payment_id: string;
  carrier: string;
  tracking_id: string;
  status: "shipped" | "in_transit" | "delivered" | "returned" | "not_applicable";
  shipped_date: string;
  estimated_delivery: string;
  actual_delivery?: string;
  delivery_proof?: string;
  delivery_signature?: string;
  delivery_photo_url?: string;
  delivery_pin_code: string;
  billing_pin_code: string;
}

export interface CustomerComms {
  payment_id: string;
  messages: {
    timestamp: string;
    channel: "email" | "chat" | "phone";
    direction: "inbound" | "outbound";
    subject?: string;
    body: string;
  }[];
}

export interface RefundPolicy {
  merchant_id: string;
  refund_window_days: number;
  cancellation_allowed: boolean;
  cancellation_window_hours: number;
  restocking_fee_percent: number;
  digital_goods_refundable: boolean;
  policy_text: string;
  policy_url: string;
  last_updated: string;
}

export interface DeviceFingerprint {
  payment_id: string;
  device_id: string;
  ip_address: string;
  ip_country: string;
  ip_city: string;
  browser: string;
  os: string;
  is_vpn: boolean;
  is_proxy: boolean;
  three_ds_authenticated: boolean;
  three_ds_version?: string;
  prior_transactions_from_device: number;
  prior_transactions_from_ip: number;
  risk_signals: string[];
}

export interface PastWinChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    category: string;
    reason_code: string;
    merchant_category: string;
    amount_band: string;
    evidence_types: string[];
    system: "chargeback-war-room";
  };
}

export interface ChargebackKPI {
  winRate: number;
  totalRecovered: number; // in paise
  disputesProcessed: number;
  avgConfidence: number;
  avgResponseTime: number; // hours
  pendingReview: number;
}
