import { supabase } from "@/lib/supabase";
import { BABY_DOB, BABY_NAME, getAgeInWeeks, formatAge } from "./data";

// Tool definitions for OpenAI function calling

const getBabyInfo = {
  type: "function" as const,
  function: {
    name: "get_baby_info",
    description: `Get information about ${BABY_NAME} including his date of birth and current age`,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getMilestones = {
  type: "function" as const,
  function: {
    name: "get_milestones",
    description: `Get ${BABY_NAME}'s recorded milestones. Returns only entries that have actually been logged.`,
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["physical", "cognitive", "social", "language"],
          description: "Filter by milestone category",
        },
        status: {
          type: "string",
          enum: ["achieved", "pending", "skipped"],
          description: "Filter by status",
        },
      },
      required: [],
    },
  },
};

const recordMilestone = {
  type: "function" as const,
  function: {
    name: "record_milestone",
    description: `Record a NEW milestone for ${BABY_NAME}. Use this only for milestones that haven't been recorded yet. To correct or update an existing milestone, use update_milestone instead.`,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Specific, readable milestone title (e.g. 'First lower central incisors', 'Pulls to stand')",
        },
        category: {
          type: "string",
          enum: ["physical", "cognitive", "social", "language"],
          description: "Milestone category",
        },
        description: {
          type: "string",
          description: "One-line description of what happened",
        },
        status: {
          type: "string",
          enum: ["achieved", "pending", "skipped"],
          description: "Milestone status",
        },
        achieved_at: {
          type: "string",
          description: "Date achieved (ISO format, e.g. 2025-10-15). Defaults to today if not provided.",
        },
        notes: {
          type: "string",
          description: "Optional notes about the milestone",
        },
      },
      required: ["title", "category", "description", "status"],
    },
  },
};

const updateMilestone = {
  type: "function" as const,
  function: {
    name: "update_milestone",
    description: `Update an existing milestone for ${BABY_NAME}. Use the milestone ID from a previous get_milestones result. Only pass the fields you want to change.`,
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The milestone's database ID (UUID from get_milestones results)",
        },
        title: {
          type: "string",
          description: "Updated title",
        },
        category: {
          type: "string",
          enum: ["physical", "cognitive", "social", "language"],
          description: "Updated category",
        },
        description: {
          type: "string",
          description: "Updated description",
        },
        status: {
          type: "string",
          enum: ["achieved", "pending", "skipped"],
          description: "Updated status",
        },
        achieved_at: {
          type: "string",
          description: "Updated date (ISO format, e.g. 2025-10-15)",
        },
        notes: {
          type: "string",
          description: "Updated notes",
        },
      },
      required: ["id"],
    },
  },
};

const searchMilestones = {
  type: "function" as const,
  function: {
    name: "search_milestones",
    description: `Search ${BABY_NAME}'s recorded milestones by keyword.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find milestones",
        },
      },
      required: ["query"],
    },
  },
};

export const milestoneTrackerTools = [
  getBabyInfo,
  getMilestones,
  recordMilestone,
  updateMilestone,
  searchMilestones,
];

export function getToolsForAgent(): typeof milestoneTrackerTools {
  return milestoneTrackerTools;
}

// --- Tool implementations ---

async function executeGetBabyInfo(): Promise<string> {
  const weeks = getAgeInWeeks();
  const age = formatAge(weeks);

  return JSON.stringify({
    name: BABY_NAME,
    dob: BABY_DOB.toISOString().split("T")[0],
    age_weeks: weeks,
    age_formatted: age,
  });
}

async function executeGetMilestones(
  category?: string,
  status?: string
): Promise<string> {
  let query = supabase
    .from("milestone_entries")
    .select("*")
    .eq("baby_name", BABY_NAME)
    .order("achieved_at", { ascending: false, nullsFirst: false });

  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return JSON.stringify({ error: error.message, code: error.code });
  }

  return JSON.stringify({
    total: data?.length || 0,
    milestones: data || [],
  });
}

async function executeRecordMilestone(
  title: string,
  category: string,
  description: string,
  status: "achieved" | "pending" | "skipped",
  achievedAt?: string,
  notes?: string
): Promise<string> {
  const { data, error } = await supabase
    .from("milestone_entries")
    .insert({
      baby_name: BABY_NAME,
      title,
      description,
      category,
      status,
      achieved_at:
        status === "achieved"
          ? achievedAt || new Date().toISOString().split("T")[0]
          : null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return JSON.stringify({
        error: `A milestone titled "${title}" already exists for ${BABY_NAME}. Use update_milestone with the milestone's ID to modify it.`,
        code: error.code,
      });
    }
    return JSON.stringify({ error: error.message, code: error.code });
  }

  return JSON.stringify({
    success: true,
    milestone: data,
    message: `Recorded that ${BABY_NAME} achieved "${title}"!`,
  });
}

async function executeUpdateMilestone(
  id: string,
  fields: {
    title?: string;
    category?: string;
    description?: string;
    status?: string;
    achieved_at?: string;
    notes?: string;
  }
): Promise<string> {
  const updates: Record<string, unknown> = {};
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.category !== undefined) updates.category = fields.category;
  if (fields.description !== undefined) updates.description = fields.description;
  if (fields.status !== undefined) updates.status = fields.status;
  if (fields.achieved_at !== undefined) updates.achieved_at = fields.achieved_at;
  if (fields.notes !== undefined) updates.notes = fields.notes;

  if (Object.keys(updates).length === 0) {
    return JSON.stringify({ error: "No fields provided to update." });
  }

  const { data, error } = await supabase
    .from("milestone_entries")
    .update(updates)
    .eq("id", id)
    .eq("baby_name", BABY_NAME)
    .select()
    .single();

  if (error) {
    return JSON.stringify({ error: error.message, code: error.code });
  }

  if (!data) {
    return JSON.stringify({ error: `No milestone found with ID "${id}" for ${BABY_NAME}.` });
  }

  const changedFields = Object.keys(updates).join(", ");
  return JSON.stringify({
    success: true,
    milestone: data,
    message: `Updated ${changedFields} for "${data.title}".`,
  });
}

async function executeSearchMilestones(query: string): Promise<string> {
  const { data, error } = await supabase
    .from("milestone_entries")
    .select("*")
    .eq("baby_name", BABY_NAME)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) {
    return JSON.stringify({ error: error.message, code: error.code });
  }

  return JSON.stringify({
    query,
    total: data?.length || 0,
    milestones: data || [],
  });
}

// Execute a tool call
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "get_baby_info":
      return executeGetBabyInfo();
    case "get_milestones":
      return executeGetMilestones(
        args.category as string | undefined,
        args.status as string | undefined
      );
    case "record_milestone":
      return executeRecordMilestone(
        args.title as string,
        args.category as string,
        args.description as string,
        args.status as "achieved" | "pending" | "skipped",
        args.achieved_at as string | undefined,
        args.notes as string | undefined
      );
    case "update_milestone":
      return executeUpdateMilestone(args.id as string, {
        title: args.title as string | undefined,
        category: args.category as string | undefined,
        description: args.description as string | undefined,
        status: args.status as string | undefined,
        achieved_at: args.achieved_at as string | undefined,
        notes: args.notes as string | undefined,
      });
    case "search_milestones":
      return executeSearchMilestones(args.query as string);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
