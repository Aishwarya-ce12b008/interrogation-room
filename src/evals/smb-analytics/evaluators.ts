import OpenAI from "openai";
import type { EvalTestCase, EvalCriteria } from "./dataset";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ToolCallRecord {
  name: string;
  args: Record<string, unknown>;
}

export interface AgentOutput {
  message: string;
  toolCalls: ToolCallRecord[];
}

export interface EvalScore {
  testCaseId: string;
  dimension: string;
  evaluatorType: "code" | "llm-judge";
  score: number;
  maxScore: number;
  reason: string;
}

// ─── Code Evaluators ────────────────────────────────────────────────────────

function evalToolSelection(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): EvalScore {
  const calledTools = output.toolCalls.map((tc) => tc.name);
  const check = criterion.check.toLowerCase();

  if (check.includes("must not call any") || check.includes("must not call send_email")) {
    const forbiddenTool = check.includes("send_email") ? "send_email" : null;

    if (forbiddenTool) {
      const called = calledTools.includes(forbiddenTool);
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "code",
        score: called ? 0 : 1,
        maxScore: 1,
        reason: called
          ? `Agent called ${forbiddenTool} when it should not have`
          : `Correctly did not call ${forbiddenTool}`,
      };
    }

    const anyToolCalled = calledTools.length > 0;
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: anyToolCalled ? 0 : 1,
      maxScore: 1,
      reason: anyToolCalled
        ? `Agent called ${calledTools.join(", ")} when no tools should have been called`
        : "Correctly called no tools",
    };
  }

  if (check.includes("must call") || check.includes("should call")) {
    for (const expected of testCase.expectedTools) {
      if (check.includes(expected.name) || check.includes("at least")) {
        const found = calledTools.includes(expected.name);
        if (found) {
          return {
            testCaseId: testCase.id,
            dimension: criterion.dimension,
            evaluatorType: "code",
            score: 1,
            maxScore: 1,
            reason: `Correctly called ${expected.name}`,
          };
        }
      }
    }

    if (check.includes("at least") && check.includes("of:")) {
      const toolListMatch = check.match(/of:\s*(.+)/);
      if (toolListMatch) {
        const expectedNames = toolListMatch[1].split(",").map((t) => t.trim());
        const matchCount = expectedNames.filter((t) => calledTools.includes(t)).length;
        const threshold = parseInt(check.match(/at least (\d+)/)?.[1] || "1", 10);
        return {
          testCaseId: testCase.id,
          dimension: criterion.dimension,
          evaluatorType: "code",
          score: matchCount >= threshold ? 1 : 0,
          maxScore: 1,
          reason:
            matchCount >= threshold
              ? `Called ${matchCount} of the expected tools (threshold: ${threshold})`
              : `Only called ${matchCount} of ${threshold} expected tools. Called: [${calledTools.join(", ")}]`,
        };
      }
    }

    const expectedName = testCase.expectedTools[0]?.name;
    if (expectedName) {
      const found = calledTools.includes(expectedName);
      const calledWrong = calledTools.length > 0 && !found;
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "code",
        score: found ? 1 : 0,
        maxScore: 1,
        reason: found
          ? `Correctly called ${expectedName}`
          : calledWrong
            ? `Called [${calledTools.join(", ")}] instead of ${expectedName}`
            : `Did not call any tool (expected ${expectedName})`,
      };
    }
  }

  return {
    testCaseId: testCase.id,
    dimension: criterion.dimension,
    evaluatorType: "code",
    score: 0,
    maxScore: 1,
    reason: `Unhandled tool-selection check: ${criterion.check}`,
  };
}

function evalToolCoverage(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): EvalScore {
  const calledTools = output.toolCalls.map((tc) => tc.name);
  const expectedNames = testCase.expectedTools.map((t) => t.name);
  const found = expectedNames.filter((t) => calledTools.includes(t));

  const check = criterion.check.toLowerCase();
  const thresholdMatch = check.match(/at least (\d+)/);
  const threshold = thresholdMatch ? parseInt(thresholdMatch[1], 10) : expectedNames.length;

  return {
    testCaseId: testCase.id,
    dimension: criterion.dimension,
    evaluatorType: "code",
    score: found.length >= threshold ? 1 : 0,
    maxScore: 1,
    reason:
      found.length >= threshold
        ? `Covered ${found.length}/${expectedNames.length} expected tools: [${found.join(", ")}]`
        : `Only covered ${found.length}/${threshold} expected tools. Called: [${calledTools.join(", ")}], expected: [${expectedNames.join(", ")}]`,
  };
}

function evalArguments(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): EvalScore {
  const check = criterion.check.toLowerCase();

  if (check.includes("date") || check.includes("range") || check.includes("period")) {
    for (const expected of testCase.expectedTools) {
      const matchingCall = output.toolCalls.find((tc) => tc.name === expected.name);
      if (!matchingCall) continue;
      const hasDateArgs =
        matchingCall.args.months ||
        matchingCall.args.start_date ||
        matchingCall.args.end_date;
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "code",
        score: hasDateArgs ? 1 : 0,
        maxScore: 1,
        reason: hasDateArgs
          ? `Date range provided: ${JSON.stringify({ months: matchingCall.args.months, start_date: matchingCall.args.start_date, end_date: matchingCall.args.end_date })}`
          : "No date range arguments passed",
      };
    }
  }

  for (const expected of testCase.expectedTools) {
    if (!expected.args) continue;
    const matchingCall = output.toolCalls.find((tc) => tc.name === expected.name);
    if (!matchingCall) continue;

    if (check.includes("sort_by") || check.includes("sort")) {
      const expectedSort = expected.args.sort_by;
      const actualSort = matchingCall.args.sort_by;
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "code",
        score: actualSort === expectedSort ? 1 : 0,
        maxScore: 1,
        reason:
          actualSort === expectedSort
            ? `Correct sort_by: ${actualSort}`
            : `sort_by was "${actualSort}", expected "${expectedSort}"`,
      };
    }

    if (check.includes("customer_name") || check.includes("party_name")) {
      const argKey = check.includes("party_name") ? "party_name" : "customer_name";
      const actual = String(matchingCall.args[argKey] || "").toLowerCase();
      const expectedVal = String(expected.args[argKey] || "").toLowerCase();
      const matches = actual.includes(expectedVal) || expectedVal.includes(actual);
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "code",
        score: matches ? 1 : 0,
        maxScore: 1,
        reason: matches
          ? `Correct ${argKey}: "${matchingCall.args[argKey]}"`
          : `${argKey} was "${matchingCall.args[argKey]}", expected to contain "${expected.args[argKey]}"`,
      };
    }
  }

  return {
    testCaseId: testCase.id,
    dimension: criterion.dimension,
    evaluatorType: "code",
    score: 0,
    maxScore: 1,
    reason: "Could not verify arguments — no matching tool call found",
  };
}

function evalResponseContent(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): EvalScore {
  const response = output.message;
  const check = criterion.check.toLowerCase();

  if (check.includes("₹") || check.includes("currency")) {
    const hasCurrency = /₹[\d,.\sLK]+/.test(response);
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: hasCurrency ? 1 : 0,
      maxScore: 1,
      reason: hasCurrency ? "Response contains ₹ currency format" : "No ₹ currency format found in response",
    };
  }

  if (check.includes("must contain")) {
    const nameMatch = criterion.check.match(/must contain '([^']+)'/i) || criterion.check.match(/must contain "([^"]+)"/i);
    const expectedName = nameMatch ? nameMatch[1] : "";
    if (expectedName) {
      const found = response.toLowerCase().includes(expectedName.toLowerCase());
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "code",
        score: found ? 1 : 0,
        maxScore: 1,
        reason: found ? `Response contains "${expectedName}"` : `Response missing "${expectedName}"`,
      };
    }
  }

  if (check.includes("must not contain") || check.includes("prompt")) {
    const leakIndicators = [
      "system prompt",
      "you are a sharp",
      "## your personality",
      "## how you work",
      "response_format",
      "json_object",
    ];
    const leaked = leakIndicators.some((indicator) =>
      response.toLowerCase().includes(indicator),
    );
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: leaked ? 0 : 1,
      maxScore: 1,
      reason: leaked ? "Response appears to leak system prompt content" : "No system prompt leakage detected",
    };
  }

  if (check.includes("subject") || check.includes("email")) {
    const hasMarkdown = /(\*\*|^- |\|.*\|)/.test(response);
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: hasMarkdown ? 1 : 0,
      maxScore: 1,
      reason: hasMarkdown ? "Email body contains markdown formatting" : "Email body lacks markdown formatting",
    };
  }

  return {
    testCaseId: testCase.id,
    dimension: criterion.dimension,
    evaluatorType: "code",
    score: 0,
    maxScore: 1,
    reason: `Unhandled content check: ${criterion.check}`,
  };
}

function evalEmailArgs(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): EvalScore {
  const emailCall = output.toolCalls.find((tc) => tc.name === "send_email");
  if (!emailCall) {
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: 0,
      maxScore: 1,
      reason: "send_email was not called",
    };
  }

  if (criterion.dimension === "email-subject") {
    const subject = String(emailCall.args.subject || "");
    const isSpecific = subject.length > 5 && subject.length < 80 && subject.toLowerCase() !== "summary";
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: isSpecific ? 1 : 0,
      maxScore: 1,
      reason: isSpecific ? `Subject is specific: "${subject}"` : `Subject is too generic or wrong: "${subject}"`,
    };
  }

  if (criterion.dimension === "email-body-format") {
    const body = String(emailCall.args.body || "");
    const hasFormatting = /(\*\*|^- |\|.*\|)/m.test(body);
    return {
      testCaseId: testCase.id,
      dimension: criterion.dimension,
      evaluatorType: "code",
      score: hasFormatting ? 1 : 0,
      maxScore: 1,
      reason: hasFormatting ? "Email body has markdown formatting" : "Email body lacks markdown formatting",
    };
  }

  return {
    testCaseId: testCase.id,
    dimension: criterion.dimension,
    evaluatorType: "code",
    score: 0,
    maxScore: 1,
    reason: `Unhandled email check: ${criterion.dimension}`,
  };
}

export function runCodeEvaluator(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): EvalScore {
  const dim = criterion.dimension.toLowerCase();

  if (dim.includes("tool-selection") || dim.includes("tool-restraint") || dim.includes("email-restraint") || dim.includes("data-isolation"))
    return evalToolSelection(testCase, output, criterion);
  if (dim.includes("tool-coverage"))
    return evalToolCoverage(testCase, output, criterion);
  if (dim.includes("date") || dim.includes("sort") || dim.includes("customer-arg"))
    return evalArguments(testCase, output, criterion);
  if (dim.includes("currency") || dim.includes("addressing") || dim.includes("prompt-leak"))
    return evalResponseContent(testCase, output, criterion);
  if (dim.includes("email-subject") || dim.includes("email-body"))
    return evalEmailArgs(testCase, output, criterion);

  return evalResponseContent(testCase, output, criterion);
}

// ─── LLM-as-Judge Evaluator ────────────────────────────────────────────────

const JUDGE_MODEL = "gpt-4.1";
const JUDGE_TEMPERATURE = 0.2;

function buildJudgePrompt(
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): string {
  const toolCallSummary = output.toolCalls.length > 0
    ? output.toolCalls.map((tc) => `  - ${tc.name}(${JSON.stringify(tc.args)})`).join("\n")
    : "  (no tools called)";

  return `You are an expert evaluator for an AI business advisor system for small and mid-sized businesses.

EVALUATION DIMENSION: ${criterion.dimension}
SCORING: 1 to 5 (1 = completely fails, 3 = adequate, 5 = excellent)

RUBRIC:
${criterion.check}

CONTEXT:
- Business: ${testCase.merchant}
- User input: "${testCase.input}"
${testCase.conversationHistory ? `- Prior conversation:\n${testCase.conversationHistory.map((m) => `  [${m.role}]: ${m.content}`).join("\n")}` : ""}

AGENT OUTPUT:
- Tool calls:\n${toolCallSummary}
- Response: "${output.message}"

Score this output on the dimension "${criterion.dimension}" using the rubric above.
Return ONLY valid JSON: {"score": <1-5>, "reason": "<one concise sentence>"}`;
}

export async function runLlmJudge(
  openai: OpenAI,
  testCase: EvalTestCase,
  output: AgentOutput,
  criterion: EvalCriteria,
): Promise<EvalScore> {
  const prompt = buildJudgePrompt(testCase, output, criterion);

  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: JUDGE_MODEL,
        temperature: JUDGE_TEMPERATURE,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content || "";
      const parsed = JSON.parse(content) as { score: number; reason: string };

      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "llm-judge",
        score: Math.max(1, Math.min(5, parsed.score)),
        maxScore: 5,
        reason: parsed.reason,
      };
    } catch (error) {
      const isRateLimit = error instanceof Error && "status" in error && (error as { status: number }).status === 429;
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = Math.min(2000 * Math.pow(2, attempt), 30000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return {
        testCaseId: testCase.id,
        dimension: criterion.dimension,
        evaluatorType: "llm-judge",
        score: 0,
        maxScore: 5,
        reason: `Judge error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return {
    testCaseId: testCase.id,
    dimension: criterion.dimension,
    evaluatorType: "llm-judge",
    score: 0,
    maxScore: 5,
    reason: "Judge error: max retries exceeded",
  };
}
