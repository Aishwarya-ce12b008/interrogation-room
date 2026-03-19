-- Milestone Tracker Database Schema
-- Run this in Supabase SQL Editor before using the milestone tracker

-- Drop old tables (if migrating from the 3-table schema)
DROP TRIGGER IF EXISTS update_baby_milestones_updated_at ON baby_milestones;
DROP TABLE IF EXISTS baby_milestones;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS babies;

-- Single flat table for all milestone entries
CREATE TABLE IF NOT EXISTS milestone_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('physical', 'cognitive', 'social', 'language')),
  status TEXT NOT NULL DEFAULT 'achieved' CHECK (status IN ('achieved', 'pending', 'skipped')),
  achieved_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_name, title)
);

-- Enable Row Level Security (RLS)
ALTER TABLE milestone_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for MVP - in production you'd add auth)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on milestone_entries') THEN
    CREATE POLICY "Allow all operations on milestone_entries" ON milestone_entries FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_milestone_entries_updated_at ON milestone_entries;
CREATE TRIGGER update_milestone_entries_updated_at
  BEFORE UPDATE ON milestone_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
