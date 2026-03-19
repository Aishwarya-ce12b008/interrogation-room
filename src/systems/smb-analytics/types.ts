export interface Merchant {
  id: string;
  name: string;
  business_type: string;
  business_vertical: string;
  city: string;
  gstin: string;
  email: string;
  created_at?: string;
}

export interface MerchantCardData {
  id: string;
  name: string;
  business_type: string;
  business_vertical: string;
  city: string;
  description: string;
  icon: string;
  color: string;
}

export interface KPIDashboard {
  totalRevenue: number;
  outstandingReceivables: number;
  topSellingItem: string;
  grossMarginPercent: number;
  cashInHand: number;
}
