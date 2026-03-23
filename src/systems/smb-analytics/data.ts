import { supabase } from "@/lib/supabase";
import type { Merchant, MerchantCardData } from "./types";

export const merchantCards: MerchantCardData[] = [
  {
    id: "apex-electronics",
    name: "Apex Electronics",
    business_type: "electronics",
    business_vertical: "retailer",
    city: "Delhi",
    description: "Electronics retailer with retail and B2B credit sales. 80-120 SKUs across TVs, fans, lighting, and appliances.",
    icon: "⚡",
    color: "blue",
  },
  {
    id: "luxe-apparel",
    name: "Luxe Apparel Co.",
    business_type: "apparel",
    business_vertical: "retailer",
    city: "Surat",
    description: "Apparel brand with size and color variants. Wholesale and retail, with festive season patterns.",
    icon: "👗",
    color: "purple",
  },
  {
    id: "urban-plate",
    name: "Urban Plate",
    business_type: "food_service",
    business_vertical: "restaurant",
    city: "Bengaluru",
    description: "Restaurant with daily orders, menu items with cost tracking, and hourly sales patterns.",
    icon: "🍛",
    color: "amber",
  },
];

export async function getMerchantById(cardId: string): Promise<Merchant | null> {
  const card = merchantCards.find(c => c.id === cardId);
  if (!card) return null;

  const { data } = await supabase
    .from("merchants")
    .select("*")
    .eq("name", card.name)
    .limit(1)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    business_type: data.business_type,
    business_vertical: data.business_vertical,
    city: data.city,
    gstin: data.gstin,
    email: "aishy.savi@gmail.com",
    created_at: data.created_at,
  };
}
