import type { AgentConfig } from "@/lib/agents/types";
import { MILESTONE_TRACKER_SYSTEM_PROMPT } from "./prompts";

export const aggyConfig: AgentConfig = {
  id: "aggy",
  name: "Aggy's Miles",
  systemPrompt: MILESTONE_TRACKER_SYSTEM_PROMPT,
  temperature: 0.7,
};
