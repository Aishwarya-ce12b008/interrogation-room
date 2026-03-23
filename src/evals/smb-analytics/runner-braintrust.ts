/**
 * SMB Analytics Eval Runner — Braintrust
 *
 * Runs the same eval suite against the SMB Advisor and pushes results
 * to Braintrust for comparison and visualization.
 *
 * Usage:  npx tsx src/evals/smb-analytics/runner-braintrust.ts
 *         npx tsx src/evals/smb-analytics/runner-braintrust.ts --name "after prompt tweak"
 */

import { config as dotenvConfig } from "dotenv";
import path from "path";
dotenvConfig({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import OpenAI from "openai";
import { Eval } from "braintrust";

import { smbAnalyticsDataset, type EvalTestCase } from "./dataset";
import {
  runCodeEvaluator,
  runLlmJudge,
  type AgentOutput,
  type ToolCallRecord,
} from "./evaluators";

// ─── Config ─────────────────────────────────────────────────────────────────

const AGENT_MODEL = "gpt-4.1-mini";
const AGENT_TEMPERATURE = 0.7;
const MAX_TOOL_ROUNDS = 5;

// ─── Load system ────────────────────────────────────────────────────────────

async function loadSystem() {
  return await import("../../systems/smb-analytics/index.js");
}

type LoadedSystem = Awaited<ReturnType<typeof loadSystem>>;

let _sys: LoadedSystem | null = null;
async function getSys(): Promise<LoadedSystem> {
  if (!_sys) _sys = await loadSystem();
  return _sys;
}

// ─── Call agent (mirrors route.ts logic, without SSE) ───────────────────────

async function callAgent(
  testCase: EvalTestCase,
  sys: LoadedSystem,
): Promise<AgentOutput> {
  const merchant = await sys.getMerchantById(testCase.merchant);
  if (!merchant) throw new Error(`Merchant not found: ${testCase.merchant}`);

  const systemPrompt = sys.advisorConfig.systemPrompt + "\n\n" + sys.generateMerchantContext(merchant);
  const tools = sys.getToolsForAgent() as Parameters<typeof openai.chat.completions.create>[0]["tools"];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async function chatWithRetry(
    params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
    maxRetries = 5,
  ): Promise<OpenAI.Chat.ChatCompletion> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await openai.chat.completions.create(params);
      } catch (err: unknown) {
        const isRateLimit = err instanceof Error && "status" in err && (err as { status: number }).status === 429;
        if (!isRateLimit || attempt === maxRetries - 1) throw err;
        const delay = Math.min(2000 * Math.pow(2, attempt), 30000);
        console.log(`  ⏳ Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 2}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error("unreachable");
  }

  const messages: { role: "system" | "user" | "assistant" | "tool"; content: string | null; tool_calls?: unknown; tool_call_id?: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  if (testCase.conversationHistory) {
    for (const msg of testCase.conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: "user", content: testCase.input });

  const allToolCalls: ToolCallRecord[] = [];
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round++;
    const response = await chatWithRetry({
      model: AGENT_MODEL,
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      temperature: AGENT_TEMPERATURE,
      max_tokens: 2048,
      tools,
      response_format: { type: "json_object" },
    });

    const choice = response.choices[0].message;

    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      let agentMessage = choice.content || "";
      try {
        const parsed = JSON.parse(agentMessage) as { message?: string };
        if (parsed.message) agentMessage = parsed.message;
      } catch {
        // not JSON, use raw content
      }
      return { message: agentMessage, toolCalls: allToolCalls };
    }

    messages.push({
      role: "assistant",
      content: choice.content || null,
      tool_calls: choice.tool_calls,
    });

    for (const tc of choice.tool_calls) {
      const toolName = tc.function.name;
      const toolArgs = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      allToolCalls.push({ name: toolName, args: toolArgs });

      let toolResult: string;
      if (toolName === "send_email") {
        toolResult = "Email sent successfully. (eval mock)";
      } else {
        const result = sys.executeTool(toolName, toolArgs, merchant);
        toolResult = result instanceof Promise ? await result : result;
      }

      messages.push({ role: "tool", content: toolResult, tool_call_id: tc.id });
    }
  }

  return { message: "(max tool rounds exceeded)", toolCalls: allToolCalls };
}

// ─── Braintrust Eval ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const customName = args.includes("--name") ? args[args.indexOf("--name") + 1] : null;
const runName = customName || `smb-eval-${new Date().toISOString().slice(0, 16).replace("T", "-")}`;

const judgeOpenai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

Eval("SMB Analytics", {
  experimentName: runName,
  maxConcurrency: 5,
  metadata: {
    model: AGENT_MODEL,
    temperature: AGENT_TEMPERATURE,
    dataset: "smb-analytics-evals",
    testCaseCount: smbAnalyticsDataset.length,
  },

  data: () =>
    smbAnalyticsDataset.map((tc) => ({
      input: tc,
      expected: {
        expectedTools: tc.expectedTools,
        expectedNoTool: tc.expectedNoTool || false,
        referenceNotes: tc.referenceNotes,
        evalCriteria: tc.evalCriteria,
      },
    })),

  task: async (input) => {
    const testCase = input as EvalTestCase;
    const sys = await getSys();

    console.log(`  Running: ${testCase.id} [${testCase.category}]`);
    const output = await callAgent(testCase, sys);

    console.log(`    Tools: [${output.toolCalls.map((t) => t.name).join(", ") || "none"}]`);
    console.log(`    Response: "${output.message.slice(0, 100)}${output.message.length > 100 ? "..." : ""}"`);

    return output;
  },

  scores: [
    // Code evaluators — returns one score per code criterion
    async ({ input, output }) => {
      const testCase = input as EvalTestCase;
      const agentOutput = output as AgentOutput;
      const codeChecks = testCase.evalCriteria.filter((c) => c.type === "code");

      if (codeChecks.length === 0) return null;

      const results: { name: string; score: number; metadata: { reason: string } }[] = [];

      for (const criterion of codeChecks) {
        const s = runCodeEvaluator(testCase, agentOutput, criterion);
        const passed = s.score === s.maxScore;
        const icon = passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
        console.log(`    ${icon}  ${s.dimension}: ${s.reason}`);

        results.push({
          name: s.dimension,
          score: passed ? 1 : 0,
          metadata: { reason: s.reason },
        });
      }

      return results;
    },

    // LLM-judge evaluators — returns one score per judge criterion
    async ({ input, output }) => {
      const testCase = input as EvalTestCase;
      const agentOutput = output as AgentOutput;
      const llmChecks = testCase.evalCriteria.filter((c) => c.type === "llm-judge");

      if (llmChecks.length === 0) return null;

      const results: { name: string; score: number; metadata: { rawScore: string; reason: string } }[] = [];

      for (const criterion of llmChecks) {
        const s = await runLlmJudge(judgeOpenai, testCase, agentOutput, criterion);
        const color = s.score >= 4 ? "\x1b[32m" : s.score >= 3 ? "\x1b[33m" : "\x1b[31m";
        console.log(`    ${color}${s.score}/5\x1b[0m  ${s.dimension}: ${s.reason}`);

        results.push({
          name: s.dimension,
          score: s.score / 5,
          metadata: { rawScore: `${s.score}/5`, reason: s.reason },
        });
      }

      return results;
    },
  ],
});
