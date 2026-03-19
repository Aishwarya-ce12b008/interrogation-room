import type { AgentConfig } from "@/lib/agents/types";
import { SMB_ANALYTICS_SYSTEM_PROMPT } from "./prompts";

export const advisorConfig: AgentConfig = {
  id: "advisor",
  name: "Business Advisor",
  systemPrompt: SMB_ANALYTICS_SYSTEM_PROMPT,
  temperature: 0.7,
};
