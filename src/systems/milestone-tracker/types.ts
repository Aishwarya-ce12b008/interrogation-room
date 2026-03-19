export type MilestoneCategory = "physical" | "cognitive" | "social" | "language";

export type MilestoneStatus = "achieved" | "pending" | "skipped";

export interface MilestoneEntry {
  id: string;
  baby_name: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  achieved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
