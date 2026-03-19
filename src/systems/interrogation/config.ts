import { AgentConfig } from "@/lib/agents/types";
import { GOODY_SYSTEM_PROMPT, BADDY_SYSTEM_PROMPT } from "./prompts";

export const goodyConfig: AgentConfig = {
  id: "goody",
  name: "Goody",
  systemPrompt: GOODY_SYSTEM_PROMPT,
  temperature: 0.5,
};

export const baddyConfig: AgentConfig = {
  id: "baddy",
  name: "Baddy",
  systemPrompt: BADDY_SYSTEM_PROMPT,
  temperature: 0.9,
};
