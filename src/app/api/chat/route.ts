import { NextRequest } from "next/server";
import { config as dotenvConfig } from "dotenv";
import path from "path";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

// Force .env.local to override any system env vars
dotenvConfig({ path: path.resolve(process.cwd(), ".env.local"), override: true });
import {
  AgentId,
  AgentResponse,
  RoomState,
  TokenUsage,
  MessageDebugInfo,
  RAGChunkInfo,
  ToolCall,
  AgentConfig,
  LLMCallInfo,
} from "@/lib/agents";
import { getSystem, type SystemDefinition } from "@/systems/registry";
import { getMcpClientManager, type McpClientManager } from "@/lib/mcp/client";

export const dynamic = "force-dynamic";

// ============================================================================
// RAG: Retrieve relevant context from Pinecone
// ============================================================================

interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
  category: string;
}

async function retrieveContext(
  openai: OpenAI,
  query: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  // Skip RAG if Pinecone is not configured
  const pineconeKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || "interrogation-room";
  
  console.log(`RAG: Pinecone key exists: ${!!pineconeKey}, Index: ${indexName}`);
  
  if (!pineconeKey) {
    console.log("RAG: Pinecone not configured, skipping retrieval");
    return [];
  }

  try {
    // Create embedding for the query
    console.log(`RAG: Creating embedding for: "${query.slice(0, 50)}..."`);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log(`RAG: Embedding created, length: ${queryEmbedding.length}`);

    // Query Pinecone
    const pinecone = new Pinecone({ apiKey: pineconeKey });
    const index = pinecone.index(indexName);

    console.log(`RAG: Querying Pinecone index "${indexName}"...`);
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });
    
    console.log(`RAG: Pinecone returned ${results.matches?.length || 0} matches`);
    if (results.matches?.length > 0) {
      results.matches.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.id} (score: ${m.score?.toFixed(3)})`);
      });
    }

    // Filter and format results (lowered threshold to 0.3)
    const filtered = results.matches
      .filter((match) => (match.score || 0) >= 0.3)
      .map((match) => ({
        id: match.id,
        text: (match.metadata?.text as string) || "",
        score: match.score || 0,
        category: (match.metadata?.category as string) || "unknown",
      }));
    
    console.log(`RAG: After filtering (>=0.3): ${filtered.length} chunks`);
    return filtered;
  } catch (error) {
    console.error("RAG retrieval error:", error);
    return [];
  }
}

function buildContextString(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const contextParts = chunks.map((chunk, i) => 
    `[${i + 1}] (${chunk.category})\n${chunk.text}`
  );

  return `
## RELEVANT CONTEXT FOR THIS SITUATION:

${contextParts.join("\n\n---\n\n")}

## END CONTEXT - Use this information to inform your response.
`;
}

interface ChatToolCallRef {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  agent?: AgentId;
  tool_calls?: ChatToolCallRef[];
  tool_call_id?: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  activeAgent: AgentId;
  roomState: RoomState;
  suspectId?: string;
  systemId?: string;
}

function getAgentConfig(agent: AgentId, system: SystemDefinition): AgentConfig {
  return system.agents.find(a => a.id === agent) || system.agents[0];
}

function getOtherAgent(agent: AgentId, system: SystemDefinition): AgentId {
  const others = system.agents.filter(a => a.id !== agent);
  return (others[0]?.id || agent) as AgentId;
}

type FormattedMessage =
  | { role: "user" | "assistant"; content: string }
  | { role: "assistant"; content: string | null; tool_calls: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; content: string; tool_call_id: string };

function formatMessagesForAgent(messages: ChatMessage[]): FormattedMessage[] {
  return messages.map((m): FormattedMessage => {
    if (m.role === "tool" && m.tool_call_id) {
      return { role: "tool", content: m.content, tool_call_id: m.tool_call_id };
    }
    if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
      return {
        role: "assistant",
        content: m.content || null,
        tool_calls: m.tool_calls.map(tc => ({ id: tc.id, type: "function" as const, function: tc.function })),
      };
    }
    if (m.role === "assistant" && m.agent) {
      return { role: "assistant", content: `[${m.agent}]: ${m.content}` };
    }
    return { role: m.role as "user" | "assistant", content: m.content };
  });
}

// Helper to send SSE event
function sseEvent(type: string, data: Record<string, unknown>): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

const TOOL_LABELS: Record<string, string> = {
  search_knowledge_base: "Searching knowledge base",
  check_evidence: "Checking evidence files",
  check_criminal_history: "Pulling criminal history",
  check_associates: "Looking up known associates",
  verify_alibi: "Verifying alibi details",
  calculate_sentence: "Calculating potential sentence",
  // Goody-exclusive
  offer_deal: "Preparing a cooperation deal",
  share_similar_case: "Finding a similar case",
  offer_comfort: "Looking up support resources",
  // Baddy-exclusive
  threaten_arrest_associate: "Pulling associate file",
  read_victim_impact: "Reading victim impact statement",
  show_time_pressure: "Applying time pressure",
  // Milestone Tracker
  get_baby_info: "Looking up Agastya's info",
  get_milestones: "Fetching Agastya's milestones",
  record_milestone: "Saving to Agastya's milestone log",
  update_milestone: "Updating Agastya's milestone",
  search_milestones: "Searching Agastya's records",
  // SMB Analytics
  get_revenue_summary: "Pulling revenue numbers",
  get_top_items: "Finding top selling items",
  get_receivables_ageing: "Checking outstanding receivables",
  get_payables_ageing: "Checking outstanding payables",
  get_expense_breakdown: "Analyzing expenses",
  get_inventory_levels: "Checking inventory levels",
  get_discount_trend: "Analyzing discount patterns",
  get_payment_timing: "Analyzing payment timing (DSO/DPO)",
  get_customer_activity: "Checking customer activity",
  get_party_ledger: "Looking up transaction history",
  get_margin_analysis: "Analyzing margins",
  get_daily_patterns: "Checking daily patterns",
  get_price_trends: "Tracking price changes",
  send_email: "Sending email",
};

// NON-STREAMING call - just to get the decision (action field)
async function callAgentForDecision(
  openai: OpenAI,
  messages: ChatMessage[],
  agent: AgentId,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  system: SystemDefinition,
  subject?: unknown,
  subjectContext?: string,
  toolCalls: ToolCall[] = [],
  mcpManager?: McpClientManager,
): Promise<{ response: AgentResponse; tokenUsage: TokenUsage; debug: MessageDebugInfo }> {
  const config = getAgentConfig(agent, system);
  const formattedMessages = formatMessagesForAgent(messages);
  const model = "gpt-4.1-mini";
  const maxTokens = 2048;
  const timestamp = new Date().toISOString();
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  const llmCalls: LLMCallInfo[] = [];

  const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
  const contextCount = messages.length;
  const hasSubject = !!subject;
  const promptSummary = `Agent: ${agent} | Context: ${contextCount} msgs | Subject: ${hasSubject ? "loaded" : "none"} | Last user: "${lastUserMsg?.content?.slice(0, 50)}${(lastUserMsg?.content?.length || 0) > 50 ? '...' : ''}"`;
  const conversationHistory = formattedMessages.map(m => ({ role: m.role, content: m.content || "" }));

  let augmentedSystemPrompt = config.systemPrompt;
  if (subjectContext) {
    augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n${subjectContext}`;
  }

  const baseMessages: FormattedMessage[] = [
    { role: "system" as "user", content: augmentedSystemPrompt },
    ...formattedMessages,
  ];

  const localTools = system.getTools(agent) as Parameters<typeof openai.chat.completions.create>[0]["tools"];
  const mcpTools = mcpManager ? mcpManager.getToolsAsOpenAI() as Parameters<typeof openai.chat.completions.create>[0]["tools"] : [];
  const agentTools = [...(localTools || []), ...(mcpTools || [])];

  // --- LLM Call #1: Tool selection ---
  const call1Start = Date.now();
  await writer.write(encoder.encode(sseEvent("step", {
    id: "llm_decide",
    label: "LLM call — choosing action",
    status: "running",
  })));

  const initialResponse = await openai.chat.completions.create({
    model,
    messages: baseMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
    max_tokens: maxTokens,
    temperature: config.temperature,
    response_format: { type: "json_object" },
    tools: agentTools.length > 0 ? agentTools : undefined,
  });
  const call1Duration = Date.now() - call1Start;
  const call1Usage = initialResponse.usage;

  const hasTools = !!initialResponse.choices[0]?.message?.tool_calls?.length;

  llmCalls.push({
    label: hasTools ? "LLM call — choosing action" : "LLM call — generating response",
    promptTokens: call1Usage?.prompt_tokens || 0,
    completionTokens: call1Usage?.completion_tokens || 0,
    durationMs: call1Duration,
    messages: baseMessages.map(m => ({ role: m.role, content: m.content || "" })),
  });

  await writer.write(encoder.encode(sseEvent("step", {
    id: "llm_decide",
    label: hasTools ? "LLM call — chose action" : "LLM call — generated response",
    status: "done",
    detail: `${call1Usage?.prompt_tokens || 0}+${call1Usage?.completion_tokens || 0} tokens · ${(call1Duration / 1000).toFixed(1)}s`,
    durationMs: call1Duration,
  })));

  type OAIMessage = { role: string; content: string | null; tool_calls?: unknown; tool_call_id?: string };
  const enrichedMessages: OAIMessage[] = [...baseMessages as OAIMessage[]];
  let totalUsage = initialResponse.usage;

  const MAX_TOOL_ROUNDS = 5;
  let currentResponse = initialResponse;
  let currentHasTools = hasTools;
  let roundIndex = 0;

  while (currentHasTools && roundIndex < MAX_TOOL_ROUNDS) {
    roundIndex++;
    const assistantToolMsg = currentResponse.choices[0].message;
    enrichedMessages.push(assistantToolMsg as OAIMessage);
    let roundToolResultTokens = 0;

    const toolResultMessages: { tool_call_id: string; name: string; content: string }[] = [];

    for (const toolCall of assistantToolMsg.tool_calls!) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const isMcp = mcpManager?.isMcpTool(toolName);
      const friendlyLabel = isMcp
        ? (mcpManager!.getToolLabel(toolName) || toolName)
        : (TOOL_LABELS[toolName] || toolName);
      const stepId = `tool_${toolName}_${roundIndex}`;
      const stepLabel = `Tool call — ${isMcp ? toolName.replace(/^mcp__[^_]+__/, "") : toolName}`;
      const toolStart = Date.now();

      await writer.write(encoder.encode(sseEvent("step", {
        id: stepId,
        label: stepLabel,
        status: "running",
      })));

      let toolResult: string;
      if (toolName === "search_knowledge_base") {
        const chunks = await retrieveContext(openai, toolArgs.query as string, 5);
        toolResult = chunks.length > 0
          ? buildContextString(chunks)
          : "No relevant information found in the knowledge base.";
      } else if (isMcp && mcpManager) {
        toolResult = await mcpManager.callTool(toolName, toolArgs);
      } else {
        const result = system.executeTool(toolName, toolArgs, subject);
        toolResult = result instanceof Promise ? await result : result;
      }
      const toolDuration = Date.now() - toolStart;
      const resultTokens = estimateTokens(toolResult);
      roundToolResultTokens += resultTokens;

      await writer.write(encoder.encode(sseEvent("step", {
        id: stepId,
        label: stepLabel,
        status: "done",
        detail: `~${resultTokens} tokens · ${(toolDuration / 1000).toFixed(1)}s`,
        durationMs: toolDuration,
      })));

      toolCalls.push({
        name: toolName,
        description: friendlyLabel,
        input: toolArgs,
        output: toolResult,
        durationMs: toolDuration,
        status: "success",
      });

      toolResultMessages.push({ tool_call_id: toolCall.id, name: toolName, content: toolResult });

      enrichedMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      } as OAIMessage);
    }

    // Send tool history to frontend so it can persist in conversation
    await writer.write(encoder.encode(sseEvent("tool_history", {
      assistantToolCalls: assistantToolMsg.tool_calls!.map((tc: { id: string; type: string; function: { name: string; arguments: string } }) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
      toolResults: toolResultMessages,
    })));

    // Call LLM again with tool results — it may request more tools or produce a final response
    const nextCallStart = Date.now();
    await writer.write(encoder.encode(sseEvent("step", {
      id: `llm_round_${roundIndex + 1}`,
      label: `LLM call — processing tool results`,
      status: "running",
      detail: `+${roundToolResultTokens} tokens from tool results`,
    })));

    const nextResponse = await openai.chat.completions.create({
      model,
      messages: enrichedMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      max_tokens: maxTokens,
      temperature: config.temperature,
      response_format: { type: "json_object" },
      tools: agentTools,
    });
    const nextCallDuration = Date.now() - nextCallStart;
    const nextUsage = nextResponse.usage;

    currentHasTools = !!nextResponse.choices[0]?.message?.tool_calls?.length;

    llmCalls.push({
      label: currentHasTools ? `LLM call — chose action (round ${roundIndex + 1})` : "LLM call — generated response",
      promptTokens: nextUsage?.prompt_tokens || 0,
      completionTokens: nextUsage?.completion_tokens || 0,
      durationMs: nextCallDuration,
      toolResultTokens: roundToolResultTokens,
      messages: enrichedMessages.map(m => ({ role: m.role, content: m.content || "" })),
    });

    await writer.write(encoder.encode(sseEvent("step", {
      id: `llm_round_${roundIndex + 1}`,
      label: currentHasTools ? `LLM call — chose action (round ${roundIndex + 1})` : "LLM call — generated response",
      status: "done",
      detail: `${nextUsage?.prompt_tokens || 0}+${nextUsage?.completion_tokens || 0} tokens · ${(nextCallDuration / 1000).toFixed(1)}s`,
      durationMs: nextCallDuration,
    })));

    if (nextResponse.usage && totalUsage) {
      totalUsage = {
        prompt_tokens: totalUsage.prompt_tokens + nextResponse.usage.prompt_tokens,
        completion_tokens: totalUsage.completion_tokens + nextResponse.usage.completion_tokens,
        total_tokens: totalUsage.total_tokens + nextResponse.usage.total_tokens,
      };
    }

    currentResponse = nextResponse;
  }

  // Extract final text response (either from original call or after tool loop)
  const finalContent = currentResponse.choices[0]?.message?.content;
  if (!finalContent) throw new Error("No response from OpenAI");

  const tokenUsage: TokenUsage = {
    promptTokens: totalUsage?.prompt_tokens || 0,
    completionTokens: totalUsage?.completion_tokens || 0,
    totalTokens: totalUsage?.total_tokens || 0,
  };

  let parsedResponse: AgentResponse;
  try {
    const parsed = JSON.parse(finalContent) as AgentResponse;
    parsedResponse = {
      message: parsed.message || "I'm not sure what to say.",
      action: parsed.action || "none",
      transitionNote: parsed.transitionNote,
    };
  } catch {
    parsedResponse = { message: finalContent, action: "none" };
  }

  const basePromptTokens = estimateTokens(config.systemPrompt);
  const suspectContextTokens = subjectContext ? estimateTokens(subjectContext) : 0;
  const augmentedSystemTokens = basePromptTokens + suspectContextTokens;
  const conversationTokens = Math.max(0, tokenUsage.promptTokens - augmentedSystemTokens);

  return {
    response: parsedResponse,
    tokenUsage,
    debug: {
      agentId: agent, action: parsedResponse.action, transitionNote: parsedResponse.transitionNote, timestamp,
      tokenUsage, tokenBreakdown: { basePromptTokens, suspectContextTokens, ragContextTokens: 0, conversationTokens, completionTokens: tokenUsage.completionTokens },
      messageCount: messages.length, toolCalls, llmCalls, ragChunks: [], ragEnabled: false,
      systemPrompt: augmentedSystemPrompt, conversationHistory, model, temperature: config.temperature, maxTokens, promptSent: promptSummary,
    },
  };
}

// STREAMING call - for the actual response to show to user
async function streamAgentResponse(
  openai: OpenAI,
  messages: ChatMessage[],
  agent: AgentId,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  system: SystemDefinition,
  subject?: unknown,
  subjectContext?: string,
  toolCalls: ToolCall[] = [],
  mcpManager?: McpClientManager,
): Promise<{ response: AgentResponse; tokenUsage: TokenUsage; debug: MessageDebugInfo }> {
  const config = getAgentConfig(agent, system);
  const formattedMessages = formatMessagesForAgent(messages);
  const model = "gpt-4.1-mini";
  const maxTokens = 2048;
  const timestamp = new Date().toISOString();
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  const llmCalls: LLMCallInfo[] = [];

  const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
  const contextCount = messages.length;
  const hasSubject = !!subject;
  const promptSummary = `Agent: ${agent} | Context: ${contextCount} msgs | Subject: ${hasSubject ? "loaded" : "none"} | Last user: "${lastUserMsg?.content?.slice(0, 50)}${(lastUserMsg?.content?.length || 0) > 50 ? '...' : ''}"`;
  const conversationHistory = formattedMessages.map(m => ({ role: m.role, content: m.content || "" }));

  let augmentedSystemPrompt = config.systemPrompt;
  if (subjectContext) {
    augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n${subjectContext}`;
  }

  type OAIMessage = { role: string; content: string | null; tool_calls?: unknown; tool_call_id?: string };
  const streamMessages: OAIMessage[] = [
    { role: "system", content: augmentedSystemPrompt },
    ...(formattedMessages as OAIMessage[]),
  ];

  const localTools = system.getTools(agent) as Parameters<typeof openai.chat.completions.create>[0]["tools"];
  const mcpTools = mcpManager ? mcpManager.getToolsAsOpenAI() as Parameters<typeof openai.chat.completions.create>[0]["tools"] : [];
  const agentTools = [...(localTools || []), ...(mcpTools || [])];

  // --- LLM Call #1: Tool detection ---
  const call1Start = Date.now();
  await writer.write(encoder.encode(sseEvent("step", {
    id: "llm_decide",
    label: "LLM call — choosing action",
    status: "running",
  })));

  const toolDetection = await openai.chat.completions.create({
    model,
    messages: streamMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
    max_tokens: maxTokens,
    temperature: config.temperature,
    tools: agentTools.length > 0 ? agentTools : undefined,
  });
  const call1Duration = Date.now() - call1Start;
  const call1Usage = toolDetection.usage;
  const hasTools = !!toolDetection.choices[0]?.message?.tool_calls?.length;

  llmCalls.push({
    label: hasTools ? "LLM call — choosing action" : "LLM call — generating response",
    promptTokens: call1Usage?.prompt_tokens || 0,
    completionTokens: call1Usage?.completion_tokens || 0,
    durationMs: call1Duration,
    messages: streamMessages.map(m => ({ role: m.role, content: m.content || "" })),
  });

  await writer.write(encoder.encode(sseEvent("step", {
    id: "llm_decide",
    label: hasTools ? "LLM call — chose action" : "LLM call — generated response",
    status: "done",
    detail: `${call1Usage?.prompt_tokens || 0}+${call1Usage?.completion_tokens || 0} tokens · ${(call1Duration / 1000).toFixed(1)}s`,
    durationMs: call1Duration,
  })));

  let totalToolResultTokens = 0;
  const MAX_TOOL_ROUNDS = 5;
  let currentDetection = toolDetection;
  let currentHasTools = hasTools;
  let roundIndex = 0;

  while (currentHasTools && roundIndex < MAX_TOOL_ROUNDS) {
    roundIndex++;
    const assistantToolMsg = currentDetection.choices[0].message;
    streamMessages.push(assistantToolMsg as OAIMessage);

    const toolResultMessages: { tool_call_id: string; name: string; content: string }[] = [];
    let roundToolResultTokens = 0;

    for (const toolCall of assistantToolMsg.tool_calls!) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const isMcp = mcpManager?.isMcpTool(toolName);
      const friendlyLabel = isMcp
        ? (mcpManager!.getToolLabel(toolName) || toolName)
        : (TOOL_LABELS[toolName] || toolName);
      const stepId = `tool_${toolName}_${roundIndex}`;
      const stepLabel = `Tool call — ${isMcp ? toolName.replace(/^mcp__[^_]+__/, "") : toolName}`;
      const toolStart = Date.now();

      await writer.write(encoder.encode(sseEvent("step", {
        id: stepId,
        label: stepLabel,
        status: "running",
      })));

      let toolResult: string;
      if (toolName === "search_knowledge_base") {
        const chunks = await retrieveContext(openai, toolArgs.query as string, 5);
        toolResult = chunks.length > 0
          ? buildContextString(chunks)
          : "No relevant information found in the knowledge base.";
      } else if (isMcp && mcpManager) {
        toolResult = await mcpManager.callTool(toolName, toolArgs);
      } else {
        const result = system.executeTool(toolName, toolArgs, subject);
        toolResult = result instanceof Promise ? await result : result;
      }
      const toolDuration = Date.now() - toolStart;
      const resultTokens = estimateTokens(toolResult);
      roundToolResultTokens += resultTokens;
      totalToolResultTokens += resultTokens;

      await writer.write(encoder.encode(sseEvent("step", {
        id: stepId,
        label: stepLabel,
        status: "done",
        detail: `~${resultTokens} tokens · ${(toolDuration / 1000).toFixed(1)}s`,
        durationMs: toolDuration,
      })));

      toolCalls.push({
        name: toolName,
        description: friendlyLabel,
        input: toolArgs,
        output: toolResult,
        durationMs: toolDuration,
        status: "success",
      });

      toolResultMessages.push({ tool_call_id: toolCall.id, name: toolName, content: toolResult });

      streamMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      } as OAIMessage);
    }

    // Send tool history to frontend so it can persist in conversation
    await writer.write(encoder.encode(sseEvent("tool_history", {
      assistantToolCalls: assistantToolMsg.tool_calls!.map((tc: { id: string; type: string; function: { name: string; arguments: string } }) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
      toolResults: toolResultMessages,
    })));

    // Call LLM again — may request more tools or produce final response
    const nextCallStart = Date.now();
    await writer.write(encoder.encode(sseEvent("step", {
      id: `llm_round_${roundIndex + 1}`,
      label: `LLM call — processing tool results`,
      status: "running",
      detail: `+${roundToolResultTokens} tokens from tool results`,
    })));

    const nextResponse = await openai.chat.completions.create({
      model,
      messages: streamMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      max_tokens: maxTokens,
      temperature: config.temperature,
      tools: agentTools,
    });
    const nextCallDuration = Date.now() - nextCallStart;
    const nextUsage = nextResponse.usage;

    currentHasTools = !!nextResponse.choices[0]?.message?.tool_calls?.length;

    llmCalls.push({
      label: currentHasTools ? `LLM call — chose action (round ${roundIndex + 1})` : "LLM call — generated response",
      promptTokens: nextUsage?.prompt_tokens || 0,
      completionTokens: nextUsage?.completion_tokens || 0,
      durationMs: nextCallDuration,
      toolResultTokens: roundToolResultTokens,
      messages: streamMessages.map(m => ({ role: m.role, content: m.content || "" })),
    });

    await writer.write(encoder.encode(sseEvent("step", {
      id: `llm_round_${roundIndex + 1}`,
      label: currentHasTools ? `LLM call — chose action (round ${roundIndex + 1})` : "LLM call — generated response",
      status: "done",
      detail: `${nextUsage?.prompt_tokens || 0}+${nextUsage?.completion_tokens || 0} tokens · ${(nextCallDuration / 1000).toFixed(1)}s`,
      durationMs: nextCallDuration,
    })));

    currentDetection = nextResponse;
  }

  // --- Final LLM Call (streaming): Generate response ---
  await writer.write(encoder.encode(sseEvent("step", {
    id: "llm_respond",
    label: "LLM call — generating response",
    status: "running",
    detail: totalToolResultTokens > 0 ? `+${totalToolResultTokens} tokens from tool results` : undefined,
  })));

  const streamStart = Date.now();

  // Send start event
  await writer.write(encoder.encode(sseEvent("start", { agent })));

  const stream = await openai.chat.completions.create({
    model,
    messages: streamMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
    max_tokens: maxTokens,
    temperature: config.temperature,
    response_format: { type: "json_object" },
    stream: true,
    stream_options: { include_usage: true },
  });

  let fullContent = "";
  let tokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let currentMessageContent = "";
  let inMessageField = false;
  let messageStarted = false;

  for await (const chunk of stream) {
    if (chunk.usage) {
      tokenUsage = {
        promptTokens: chunk.usage.prompt_tokens,
        completionTokens: chunk.usage.completion_tokens,
        totalTokens: chunk.usage.total_tokens,
      };
    }

    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullContent += delta;

      if (!messageStarted) {
        const messageMatch = fullContent.match(/"message"\s*:\s*"/);
        if (messageMatch) {
          messageStarted = true;
          inMessageField = true;
          const startIndex = fullContent.indexOf('"message"');
          const contentStart = fullContent.indexOf('"', startIndex + 9) + 1;
          const contentSoFar = fullContent.slice(contentStart);
          const parsed = tryParseMessageContent(contentSoFar);
          if (parsed.content.length > currentMessageContent.length) {
            const newContent = parsed.content.slice(currentMessageContent.length);
            currentMessageContent = parsed.content;
            await writer.write(encoder.encode(sseEvent("token", { content: newContent })));
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }
      } else if (inMessageField) {
        const startIndex = fullContent.indexOf('"message"');
        const contentStart = fullContent.indexOf('"', startIndex + 9) + 1;
        const contentSoFar = fullContent.slice(contentStart);
        const parsed = tryParseMessageContent(contentSoFar);
        if (parsed.content.length > currentMessageContent.length) {
          const newContent = parsed.content.slice(currentMessageContent.length);
          currentMessageContent = parsed.content;
          await writer.write(encoder.encode(sseEvent("token", { content: newContent })));
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        if (parsed.complete) {
          inMessageField = false;
        }
      }
    }
  }

  const streamDuration = Date.now() - streamStart;

  llmCalls.push({
    label: "LLM call — generating response",
    promptTokens: tokenUsage.promptTokens,
    completionTokens: tokenUsage.completionTokens,
    durationMs: streamDuration,
    toolResultTokens: hasTools ? totalToolResultTokens : undefined,
    messages: streamMessages.map(m => ({ role: m.role, content: m.content || "" })),
  });

  await writer.write(encoder.encode(sseEvent("step", {
    id: "llm_respond",
    label: "LLM call — generated response",
    status: "done",
    detail: `${tokenUsage.promptTokens}+${tokenUsage.completionTokens} tokens · ${(streamDuration / 1000).toFixed(1)}s`,
    durationMs: streamDuration,
  })));

  let parsedResponse: AgentResponse;
  try {
    const parsed = JSON.parse(fullContent) as AgentResponse;
    parsedResponse = {
      message: parsed.message || currentMessageContent || "I'm not sure what to say.",
      action: parsed.action || "none",
      transitionNote: parsed.transitionNote,
    };
  } catch {
    parsedResponse = {
      message: currentMessageContent || fullContent,
      action: "none",
    };
  }

  const basePromptTokens = estimateTokens(config.systemPrompt);
  const suspectContextTokens = subjectContext ? estimateTokens(subjectContext) : 0;
  const augmentedSystemTokens = basePromptTokens + suspectContextTokens;
  const conversationTokens = Math.max(0, tokenUsage.promptTokens - augmentedSystemTokens);

  const debug: MessageDebugInfo = {
    agentId: agent,
    action: parsedResponse.action,
    transitionNote: parsedResponse.transitionNote,
    timestamp,
    tokenUsage,
    tokenBreakdown: {
      basePromptTokens,
      suspectContextTokens,
      ragContextTokens: 0,
      conversationTokens,
      completionTokens: tokenUsage.completionTokens,
    },
    messageCount: messages.length,
    toolCalls,
    llmCalls,
    ragChunks: [],
    ragEnabled: false,
    systemPrompt: augmentedSystemPrompt,
    conversationHistory,
    model,
    temperature: config.temperature,
    maxTokens,
    promptSent: promptSummary,
  };

  return { response: parsedResponse, tokenUsage, debug };
}

// Try to parse message content from partial JSON string
function tryParseMessageContent(content: string): { content: string; complete: boolean } {
  let result = "";
  let complete = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (char === "\\") {
      if (i + 1 < content.length) {
        const nextChar = content[i + 1];
        if (nextChar === '"') { result += '"'; i += 2; continue; }
        else if (nextChar === "\\") { result += "\\"; i += 2; continue; }
        else if (nextChar === "n") { result += "\n"; i += 2; continue; }
        else if (nextChar === "t") { result += "\t"; i += 2; continue; }
        else if (nextChar === "r") { result += "\r"; i += 2; continue; }
      }
      break;
    }

    if (char === '"') {
      complete = true;
      break;
    }

    result += char;
    i++;
  }

  return { content: result, complete };
}

export async function POST(request: NextRequest) {
  console.log("=== Chat API called ===");
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OpenAI API key not found!");
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  console.log("API key found, length:", apiKey.length);

  const openai = new OpenAI({ apiKey });

  let body: ChatRequest;
  try {
    body = await request.json();
    console.log("Request body parsed:", { 
      messagesCount: body.messages?.length, 
      activeAgent: body.activeAgent,
      suspectId: body.suspectId 
    });
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, activeAgent, roomState, suspectId, systemId } = body;

  if (!messages || !activeAgent || !roomState) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Load system definition
  const system = await getSystem(systemId || "interrogation");
  if (!system) {
    return new Response(
      JSON.stringify({ error: `Unknown system: ${systemId}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get subject data if ID provided — supports async resolvers (e.g. DB-backed subjects)
  let subject: unknown = undefined;
  if (suspectId) {
    if (system.getSubjectByIdAsync) {
      subject = await system.getSubjectByIdAsync(suspectId);
    } else if (system.getSubjectById) {
      subject = system.getSubjectById(suspectId);
    }
  }
  // For systems with subjects, generate context from the subject.
  // For systems without subjects, still call generateContext() for default dynamic context.
  const subjectContext = subject
    ? system.generateContext(subject)
    : !system.hasSubjects
      ? system.generateContext(undefined)
      : undefined;

  if (suspectId && !subject) {
    console.warn(`Subject not found: ${suspectId}`);
  } else if (subject) {
    console.log(`System: ${system.id}, Subject: ${suspectId}`);
  }

  // Connect to MCP servers declared by this system (cached across requests)
  let mcpManager: McpClientManager | undefined;
  if (system.mcpServers && Object.keys(system.mcpServers).length > 0) {
    mcpManager = getMcpClientManager();
    await mcpManager.connectAll(system.mcpServers);
    console.log(`MCP: ${mcpManager.connectedCount} server(s), ${mcpManager.toolCount} tool(s) available`);
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      let totalTokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const toolCalls: ToolCall[] = [];

      const decisionResult = await callAgentForDecision(openai, messages, activeAgent, writer, encoder, system, subject, subjectContext, toolCalls, mcpManager);
      totalTokenUsage = { ...decisionResult.tokenUsage };

      // Check if there's a handoff
      if (decisionResult.response.action === "bring_colleague" || decisionResult.response.action === "step_out") {
        const enteringAgent = getOtherAgent(activeAgent, system);
        const enteringConfig = getAgentConfig(enteringAgent, system);

        await writer.write(encoder.encode(sseEvent("step", {
          id: "handoff",
          label: `Handing off to ${enteringConfig.name}`,
          status: "done",
        })));
        const transition = system.generateTransition
          ? system.generateTransition(activeAgent, enteringAgent)
          : { exitMessage: "", entranceMessage: "" };

        // Send handoff event with transition messages
        await writer.write(encoder.encode(sseEvent("handoff", {
          exitingAgent: activeAgent,
          exitMessage: transition.exitMessage,
          enteringAgent: enteringAgent,
          entranceMessage: transition.entranceMessage,
          exitingAgentDecision: {
            action: decisionResult.response.action,
            transitionNote: decisionResult.response.transitionNote,
            tokenUsage: decisionResult.tokenUsage,
          },
        })));

        // Stream the NEW agent's response (this is what the user sees)
        const newAgentResult = await streamAgentResponse(openai, messages, enteringAgent, writer, encoder, system, subject, subjectContext, toolCalls, mcpManager);

        totalTokenUsage = {
          promptTokens: totalTokenUsage.promptTokens + newAgentResult.tokenUsage.promptTokens,
          completionTokens: totalTokenUsage.completionTokens + newAgentResult.tokenUsage.completionTokens,
          totalTokens: totalTokenUsage.totalTokens + newAgentResult.tokenUsage.totalTokens,
        };

        await writer.write(encoder.encode(sseEvent("done", {
          agent: enteringAgent,
          action: newAgentResult.response.action,
          roomState: {
            goodyInRoom: true,
            baddyInRoom: true,
            activeAgent: enteringAgent,
          },
          tokenUsage: totalTokenUsage,
          debug: newAgentResult.debug,
        })));
      } else {
        // NO HANDOFF: Stream the first agent's response (we already have it, fake-stream it)
        await writer.write(encoder.encode(sseEvent("start", { agent: activeAgent })));
        
        // Fake-stream the message we already have - word by word for natural feel
        const message = decisionResult.response.message;
        const words = message.split(/(\s+)/); // Split but keep whitespace
        for (const word of words) {
          await writer.write(encoder.encode(sseEvent("token", { content: word })));
          // Delay between words for readable streaming effect
          if (word.trim()) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        await writer.write(encoder.encode(sseEvent("done", {
          agent: activeAgent,
          action: decisionResult.response.action,
          roomState: {
            ...roomState,
            activeAgent,
          },
          tokenUsage: totalTokenUsage,
          debug: decisionResult.debug,
        })));
      }
    } catch (error) {
      console.error("=== STREAMING ERROR ===", error);
      try {
        await writer.write(encoder.encode(sseEvent("error", {
          message: error instanceof Error ? error.message : "An error occurred",
        })));
      } catch (writeError) {
        console.error("Failed to write error to stream:", writeError);
      }
    } finally {
      console.log("=== Stream finished ===");
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
