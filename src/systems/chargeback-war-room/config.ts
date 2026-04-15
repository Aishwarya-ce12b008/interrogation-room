import type { AgentConfig } from "@/lib/agents/types";
import { CHARGEBACK_SYSTEM_PROMPT } from "./prompts";

export const resolverConfig: AgentConfig = {
  id: "resolver",
  name: "Chargeback Resolver",
  systemPrompt: CHARGEBACK_SYSTEM_PROMPT,
  temperature: 0.4,
};
