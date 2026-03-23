/**
 * SMB Analytics Eval Runner (Langfuse Datasets + Experiments)
 *
 * Runs experiments against the Langfuse-hosted dataset so results
 * appear in the Datasets tab with full comparison UI.
 *
 * First-time setup:  npx tsx src/evals/smb-analytics/setup-dataset.ts
 *
 * Usage:  npx tsx src/evals/smb-analytics/runner.ts
 *         npx tsx src/evals/smb-analytics/runner.ts --name "after prompt tweak"
 */

import { config as dotenvConfig } from "dotenv";
import path from "path";
dotenvConfig({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import OpenAI from "openai";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { LangfuseClient } from "@langfuse/client";
import { observeOpenAI } from "@langfuse/openai";

import { smbAnalyticsDataset, type EvalTestCase } from "./dataset";
import {
  runCodeEvaluator,
  runLlmJudge,
  type AgentOutput,
  type ToolCallRecord,
} from "./evaluators";

// ─── OpenTelemetry setup (required for Langfuse experiment tracing) ─────────

const otelSdk = new NodeSDK({ spanProcessors: [new LangfuseSpanProcessor()] });
otelSdk.start();

// ─── Config ─────────────────────────────────────────────────────────────────

const AGENT_MODEL = "gpt-4.1-mini";
const AGENT_TEMPERATURE = 0.7;
const MAX_TOOL_ROUNDS = 5;
const DATASET_NAME = "smb-analytics-evals";

// ─── Load system ────────────────────────────────────────────────────────────

async function loadSystem() {
  return await import("../../systems/smb-analytics/index.js");
}

// ─── Call agent (mirrors route.ts logic, without SSE) ───────────────────────

async function callAgent(
  testCase: EvalTestCase,
  sys: Awaited<ReturnType<typeof loadSystem>>,
): Promise<AgentOutput> {
  const merchant = await sys.getMerchantById(testCase.merchant);
  if (!merchant) throw new Error(`Business not found: ${testCase.merchant}`);

  const systemPrompt = sys.advisorConfig.systemPrompt + "\n\n" + sys.generateMerchantContext(merchant);
  const tools = sys.getToolsForAgent() as Parameters<typeof openai.chat.completions.create>[0]["tools"];

  const openai = observeOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

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
    const response = await openai.chat.completions.create({
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

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const customName = args.includes("--name") ? args[args.indexOf("--name") + 1] : null;

  const runName = customName || `smb-eval-${new Date().toISOString().slice(0, 16).replace("T", "-")}`;
  console.log(`\nSMB Analytics Eval Runner`);
  console.log(`Dataset: "${DATASET_NAME}"`);
  console.log(`Experiment: "${runName}"\n`);

  const sys = await loadSystem();
  const judgeOpenai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const langfuse = new LangfuseClient();

  // Build a lookup from testCaseId → local EvalTestCase (for evaluators)
  const testCaseMap = new Map(smbAnalyticsDataset.map((tc) => [tc.id, tc]));

  // Fetch the dataset from Langfuse (must be uploaded first via setup-dataset.ts)
  const dataset = await langfuse.dataset.get(DATASET_NAME);

  console.log(`Loaded ${dataset.items?.length ?? "?"} items from Langfuse dataset\n`);

  const result = await dataset.runExperiment({
    name: runName,
    description: `SMB Analytics eval run`,

    task: async (item) => {
      const input = item.input as { testCaseId: string; category: string; merchant: string; userInput: string; conversationHistory: { role: "user" | "assistant"; content: string }[] | null };
      const testCase = testCaseMap.get(input.testCaseId);
      if (!testCase) throw new Error(`Test case not found: ${input.testCaseId}`);

      console.log(`  Running: ${testCase.id} [${testCase.category}]`);

      const output = await callAgent(testCase, sys);

      console.log(`    Tools: [${output.toolCalls.map((t) => t.name).join(", ") || "none"}]`);
      console.log(`    Response: "${output.message.slice(0, 100)}${output.message.length > 100 ? "..." : ""}"`);

      return {
        message: output.message,
        toolCalls: output.toolCalls,
      };
    },

    evaluators: [
      // Code evaluators — one score per dimension (binary 0/1)
      async ({ input, output }) => {
        const inp = input as { testCaseId: string };
        const testCase = testCaseMap.get(inp.testCaseId);
        if (!testCase) return { name: "error", value: 0, comment: "Test case not found" };

        const agentOutput = output as AgentOutput;
        const codeChecks = testCase.evalCriteria.filter((c) => c.type === "code");

        if (codeChecks.length === 0) return [];

        const results: { name: string; value: number; comment: string }[] = [];

        for (const criterion of codeChecks) {
          const s = runCodeEvaluator(testCase, agentOutput, criterion);
          const passed = s.score === s.maxScore;
          const icon = passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
          console.log(`    ${icon}  ${s.dimension}: ${s.reason}`);

          results.push({
            name: s.dimension,
            value: passed ? 1 : 0,
            comment: s.reason,
          });
        }

        return results;
      },

      // LLM-judge evaluators — one score per dimension (0-1 scale, mapped from 1-5)
      async ({ input, output }) => {
        const inp = input as { testCaseId: string };
        const testCase = testCaseMap.get(inp.testCaseId);
        if (!testCase) return { name: "error", value: 0, comment: "Test case not found" };

        const agentOutput = output as AgentOutput;
        const llmChecks = testCase.evalCriteria.filter((c) => c.type === "llm-judge");

        if (llmChecks.length === 0) return [];

        const results: { name: string; value: number; comment: string }[] = [];

        for (const criterion of llmChecks) {
          const s = await runLlmJudge(judgeOpenai, testCase, agentOutput, criterion);
          const color = s.score >= 4 ? "\x1b[32m" : s.score >= 3 ? "\x1b[33m" : "\x1b[31m";
          console.log(`    ${color}${s.score}/5\x1b[0m  ${s.dimension}: ${s.reason}`);

          results.push({
            name: s.dimension,
            value: s.score / 5,
            comment: `${s.score}/5 — ${s.reason}`,
          });
        }

        return results;
      },
    ],
  });

  console.log("\n" + await result.format());

  await otelSdk.shutdown();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
