import type { AgentConfig } from "@/lib/agents/types";
import type { McpServerConfig } from "@/lib/mcp/client";

export interface SystemLanding {
  title: [string, string, string]; // e.g. ["THE", "INTERROGATION", "ROOM"]
  tagline: string;
  enterButton: string;
  caseLabel?: string;
  accentColor: "red" | "blue" | "green" | "purple" | "amber";
}

export interface SystemDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  landing: SystemLanding;

  // Agents — 1 or more
  agents: AgentConfig[];
  defaultAgent: string;
  multiAgent: boolean; // true = handoffs between agents (interrogation), false = single agent

  // Subject selection (optional)
  hasSubjects: boolean;
  subjectLabel?: string; // "suspect", "company", "case"
  getSubjectCards?: () => unknown[];
  getSubjectById?: (id: string) => unknown;

  // Tools & execution
  getTools: (agentId: string) => unknown[];
  executeTool: (name: string, args: Record<string, unknown>, context: unknown) => string | Promise<string>;
  generateContext: (subject: unknown) => string;

  // Transitions (only for multi-agent)
  generateTransition?: (exitingAgent: string, enteringAgent: string) => {
    exitMessage: string;
    entranceMessage: string;
  };

  // Subject card rendering
  subjectCardType?: "suspect" | "merchant" | "dispute";

  // Dashboard (KPI strip above chat)
  dashboard?: {
    apiEndpoint: string;
  };

  // Async subject resolver (for DB-backed subjects)
  getSubjectByIdAsync?: (id: string) => Promise<unknown>;

  // MCP servers this system connects to (tools are discovered at runtime)
  mcpServers?: Record<string, McpServerConfig>;
}

// Lazy-loaded system registry
const systemLoaders: Record<string, () => Promise<SystemDefinition>> = {
  interrogation: async () => {
    const sys = await import("./interrogation");
    return {
      id: "interrogation",
      name: "The Interrogation Room",
      description: "Good cop, bad cop. Two AI detectives, one suspect — you.",
      icon: "Fingerprint",
      landing: {
        title: ["THE", "INTERROGATION", "ROOM"],
        tagline: "Two AI detectives will interrogate you. How long can you keep your story straight?",
        enterButton: "Enter the room",
        caseLabel: "CASE #2024-0121 // ACTIVE",
        accentColor: "red",
      },
      agents: [sys.goodyConfig, sys.baddyConfig],
      defaultAgent: "goody",
      multiAgent: true,
      hasSubjects: true,
      subjectLabel: "suspect",
      getSubjectCards: () => sys.suspectCards,
      getSubjectById: (id: string) => sys.getSuspectById(id),
      getTools: (agentId: string) => sys.getToolsForAgent(agentId),
      executeTool: (name: string, args: Record<string, unknown>, context: unknown) =>
        sys.executeTool(name, args, context as Parameters<typeof sys.executeTool>[2]),
      generateContext: (subject: unknown) =>
        sys.generateBasicSuspectContext(subject as Parameters<typeof sys.generateBasicSuspectContext>[0]),
      generateTransition: (exitingAgent: string, enteringAgent: string) =>
        sys.generateTransition(exitingAgent as import("@/lib/agents/types").AgentId, enteringAgent as import("@/lib/agents/types").AgentId),
    };
  },
  "milestone-tracker": async () => {
    const sys = await import("./milestone-tracker");
    return {
      id: "milestone-tracker",
      name: "Miles — The Parenting Agent",
      description: "Track and celebrate your child's developmental milestones.",
      icon: "Sprout",
      landing: {
        title: ["MILES", "THE PARENTING", "AGENT"],
        tagline: "A parenting agent that tracks milestones, answers questions, and celebrates every achievement.",
        enterButton: "Start tracking",
        accentColor: "amber",
      },
      agents: [sys.aggyConfig],
      defaultAgent: "aggy",
      multiAgent: false,
      hasSubjects: false,
      getTools: () => sys.getToolsForAgent(),
      executeTool: (name: string, args: Record<string, unknown>) => sys.executeTool(name, args),
      generateContext: () => sys.generateDefaultContext(),
    };
  },
  "smb-analytics": async () => {
    const sys = await import("./smb-analytics");
    return {
      id: "smb-analytics",
      name: "Enterprise Intelligence",
      description: "AI-powered insights from real transaction data.",
      icon: "LineChart",
      landing: {
        title: ["ENTERPRISE", "INTELLIGENCE", ""],
        tagline: "An AI-powered intelligence agent that knows your books inside out. Pick a business to get started.",
        enterButton: "Choose business",
        accentColor: "green",
      },
      agents: [sys.advisorConfig],
      defaultAgent: "advisor",
      multiAgent: false,
      hasSubjects: true,
      subjectLabel: "business",
      subjectCardType: "merchant" as const,
      getSubjectCards: () => sys.merchantCards,
      getSubjectByIdAsync: async (id: string) => sys.getMerchantById(id),
      getTools: () => sys.getToolsForAgent(),
      executeTool: (name: string, args: Record<string, unknown>, context: unknown) =>
        sys.executeTool(name, args, context),
      generateContext: (subject: unknown) =>
        sys.generateMerchantContext(subject as import("./smb-analytics/types").Merchant),
      dashboard: {
        apiEndpoint: "/api/smb-analytics/dashboard",
      },
      mcpServers: {
        "google-sheets": {
          transport: "stdio" as const,
          command: process.env.MCP_GOOGLE_SHEETS_COMMAND || "uvx",
          args: ["mcp-google-sheets@latest"],
          env: {
            ...(process.env.GOOGLE_SERVICE_ACCOUNT_PATH
              ? { SERVICE_ACCOUNT_PATH: process.env.GOOGLE_SERVICE_ACCOUNT_PATH }
              : {}),
            ...(process.env.GOOGLE_DRIVE_FOLDER_ID
              ? { DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID }
              : {}),
          },
        },
        ...(process.env.NOTION_API_TOKEN ? {
          "notion": {
            transport: "stdio" as const,
            command: "npx",
            args: ["-y", "@notionhq/notion-mcp-server"],
            env: {
              OPENAPI_MCP_HEADERS: JSON.stringify({
                Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
                "Notion-Version": "2022-06-28",
              }),
            },
          },
        } : {}),
        ...(process.env.SLACK_BOT_TOKEN ? {
          "slack": {
            transport: "stdio" as const,
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-slack"],
            env: {
              SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
              SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || "",
            },
          },
        } : {}),
      },
    };
  },
};

// Cache loaded systems
const loadedSystems: Record<string, SystemDefinition> = {};

export async function getSystem(id: string): Promise<SystemDefinition | undefined> {
  if (loadedSystems[id]) return loadedSystems[id];
  const loader = systemLoaders[id];
  if (!loader) return undefined;
  const sys = await loader();
  loadedSystems[id] = sys;
  return sys;
}

// Static metadata for the selector (no async needed)
export const systemCatalog: { id: string; name: string; description: string; icon: string; landing: SystemLanding }[] = [
  {
    id: "interrogation",
    name: "The Interrogation Room",
    description: "Good cop, bad cop. Two AI detectives, one suspect — you.",
    icon: "Fingerprint",
    landing: {
      title: ["THE", "INTERROGATION", "ROOM"],
      tagline: "Two AI detectives will interrogate you. How long can you keep your story straight?",
      enterButton: "Enter the room",
      caseLabel: "CASE #2024-0121 // ACTIVE",
      accentColor: "red",
    },
  },
  {
    id: "milestone-tracker",
    name: "Miles — The Parenting Agent",
    description: "Track and celebrate your child's developmental milestones.",
    icon: "Sprout",
    landing: {
      title: ["MILES", "THE PARENTING", "AGENT"],
      tagline: "A parenting agent that tracks milestones, answers questions, and celebrates every achievement.",
      enterButton: "Start tracking",
      accentColor: "amber",
    },
  },
  {
    id: "smb-analytics",
    name: "Enterprise Intelligence",
    description: "AI-powered insights from real transaction data.",
    icon: "LineChart",
    landing: {
      title: ["ENTERPRISE", "INTELLIGENCE", ""],
      tagline: "An AI-powered intelligence agent that knows your books inside out. Pick a business to get started.",
      enterButton: "Choose business",
      accentColor: "green",
    },
  },
];
