-- SMB Analytics Agent — Supabase Schema
-- Run this in the Supabase SQL editor to create all tables.

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,       -- 'electronics', 'apparel', 'FMCG', 'food_service', etc.
  business_vertical TEXT NOT NULL,   -- 'retailer', 'distributor', 'manufacturer', 'restaurant', etc.
  city TEXT NOT NULL,
  gstin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- 'customer' or 'supplier'
  business_type TEXT,              -- 'electronics', 'textiles', 'grocery', 'dairy', etc.
  business_vertical TEXT,          -- 'retailer', 'distributor', 'manufacturer', 'wholesaler', 'consumer', etc.
  phone TEXT,
  city TEXT,
  credit_terms_days INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parties_merchant ON parties(merchant_id);
CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(merchant_id, type);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,         -- 'pcs', 'kg', 'plate', 'box', etc.
  purchase_price NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  hsn_code TEXT,
  variant_type TEXT,          -- nullable: 'size', 'color', etc.
  variant_value TEXT,         -- nullable: 'M', 'Red', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_items_merchant ON items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(merchant_id, category);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,          -- 'sale' or 'purchase'
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  total_amount NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',  -- 'paid', 'unpaid', 'partial'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_merchant ON invoices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(merchant_id, type);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(merchant_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(merchant_id, status);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_item ON invoice_items(item_id);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  mode TEXT NOT NULL DEFAULT 'cash',  -- 'cash', 'upi', 'bank'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(merchant_id, payment_date);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_merchant ON expenses(merchant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(merchant_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(merchant_id, category);

CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity_on_hand NUMERIC(10,2) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_merchant ON inventory_snapshots(merchant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory_snapshots(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_date ON inventory_snapshots(merchant_id, snapshot_date);
