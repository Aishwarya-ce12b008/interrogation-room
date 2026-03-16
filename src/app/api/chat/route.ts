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
  goodyConfig,
  baddyConfig,
  generateTransition,
} from "@/lib/agents";
import {
  Suspect,
  getSuspectById,
  generateBasicSuspectContext,
  getToolsForAgent,
  executeTool,
} from "@/lib/database";

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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
}

interface ChatRequest {
  messages: ChatMessage[];
  activeAgent: AgentId;
  roomState: RoomState;
  suspectId?: string; // ID of the suspect being interrogated
}

function getAgentConfig(agent: AgentId) {
  return agent === "goody" ? goodyConfig : baddyConfig;
}

function getOtherAgent(agent: AgentId): AgentId {
  return agent === "goody" ? "baddy" : "goody";
}

function formatMessagesForAgent(messages: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  return messages.map((m) => {
    if (m.role === "assistant" && m.agent) {
      const agentName = m.agent === "goody" ? "Goody" : "Baddy";
      return {
        role: m.role,
        content: `[${agentName}]: ${m.content}`,
      };
    }
    return { role: m.role, content: m.content };
  });
}

// Helper to send SSE event
function sseEvent(type: string, data: Record<string, unknown>): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

const TOOL_LABELS: Record<string, string> = {
  search_knowledge_base: "Searching knowledge base",
  check_evidence: "Checking evidence",
  check_criminal_history: "Checking criminal history",
  check_associates: "Checking associates",
  verify_alibi: "Verifying alibi",
  calculate_sentence: "Calculating sentence",
  // Goody-exclusive
  offer_deal: "Preparing cooperation deal",
  share_similar_case: "Finding similar case",
  offer_comfort: "Looking up support resources",
  // Baddy-exclusive
  threaten_arrest_associate: "Pulling associate file",
  read_victim_impact: "Reading victim impact statement",
  show_time_pressure: "Generating time pressure",
};

// NON-STREAMING call - just to get the decision (action field)
async function callAgentForDecision(
  openai: OpenAI,
  messages: ChatMessage[],
  agent: AgentId,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  suspect?: Suspect,
  toolCalls: ToolCall[] = []
): Promise<{ response: AgentResponse; tokenUsage: TokenUsage; debug: MessageDebugInfo }> {
  const config = getAgentConfig(agent);
  const formattedMessages = formatMessagesForAgent(messages);
  const model = "gpt-4o-mini";
  const maxTokens = 1024;
  const timestamp = new Date().toISOString();

  const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
  const contextCount = messages.length;
  const hasSuspect = !!suspect;
  const promptSummary = `Agent: ${agent} | Context: ${contextCount} msgs | Suspect: ${hasSuspect ? suspect.id : "none"} | Last user: "${lastUserMsg?.content?.slice(0, 50)}${(lastUserMsg?.content?.length || 0) > 50 ? '...' : ''}"`;
  const conversationHistory = formattedMessages.map(m => ({ role: m.role, content: m.content }));

  // Build system prompt with suspect context
  let augmentedSystemPrompt = config.systemPrompt;

  if (suspect) {
    augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n${generateBasicSuspectContext(suspect)}`;
  }

  const baseMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: augmentedSystemPrompt },
    ...formattedMessages,
  ];

  const initialResponse = await openai.chat.completions.create({
    model,
    messages: baseMessages,
    max_tokens: maxTokens,
    temperature: config.temperature,
    response_format: { type: "json_object" },
    tools: getToolsForAgent(agent),
  });

  // Tool call loop
  type OAIMessage = { role: string; content: string | null; tool_calls?: unknown; tool_call_id?: string };
  const enrichedMessages: OAIMessage[] = [...baseMessages];
  let totalUsage = initialResponse.usage;

  if (initialResponse.choices[0]?.message?.tool_calls?.length) {
    enrichedMessages.push(initialResponse.choices[0].message as OAIMessage);

    for (const toolCall of initialResponse.choices[0].message.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const label = TOOL_LABELS[toolName] || toolName;
      const toolStart = Date.now();

      await writer.write(encoder.encode(sseEvent("step", {
        id: `tool_${toolName}`,
        label,
        status: "running",
      })));

      let toolResult: string;
      if (toolName === "search_knowledge_base") {
        const chunks = await retrieveContext(openai, toolArgs.query as string, 5);
        toolResult = chunks.length > 0
          ? buildContextString(chunks)
          : "No relevant information found in the knowledge base.";
      } else {
        toolResult = suspect ? executeTool(toolName, toolArgs, suspect) : "[No suspect loaded]";
      }
      const toolDuration = Date.now() - toolStart;

      await writer.write(encoder.encode(sseEvent("step", {
        id: `tool_${toolName}`,
        label,
        status: "done",
        detail: toolResult.slice(0, 120) + (toolResult.length > 120 ? "..." : ""),
        durationMs: toolDuration,
      })));

      toolCalls.push({
        name: toolName,
        description: label,
        input: toolArgs,
        output: toolResult.slice(0, 200),
        durationMs: toolDuration,
        status: "success",
      });

      enrichedMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      } as OAIMessage);
    }

    // Follow-up call with tool results
    const followUp = await openai.chat.completions.create({
      model,
      messages: enrichedMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      max_tokens: maxTokens,
      temperature: config.temperature,
      response_format: { type: "json_object" },
    });

    if (followUp.usage && totalUsage) {
      totalUsage = {
        prompt_tokens: totalUsage.prompt_tokens + followUp.usage.prompt_tokens,
        completion_tokens: totalUsage.completion_tokens + followUp.usage.completion_tokens,
        total_tokens: totalUsage.total_tokens + followUp.usage.total_tokens,
      };
    }

    const finalContent = followUp.choices[0]?.message?.content;
    if (!finalContent) throw new Error("No response from OpenAI after tool calls");

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

    const estimateTokens = (text: string) => Math.ceil(text.length / 4);
    const basePromptTokens = estimateTokens(config.systemPrompt);
    const suspectContextTokens = suspect ? estimateTokens(generateBasicSuspectContext(suspect)) : 0;
    const augmentedSystemTokens = basePromptTokens + suspectContextTokens;
    const conversationTokens = Math.max(0, tokenUsage.promptTokens - augmentedSystemTokens);

    return {
      response: parsedResponse,
      tokenUsage,
      debug: {
        agentId: agent, action: parsedResponse.action, transitionNote: parsedResponse.transitionNote, timestamp,
        tokenUsage, tokenBreakdown: { basePromptTokens, suspectContextTokens, ragContextTokens: 0, conversationTokens, completionTokens: tokenUsage.completionTokens },
        messageCount: messages.length, toolCalls, ragChunks: [], ragEnabled: false,
        systemPrompt: augmentedSystemPrompt, conversationHistory, model, temperature: config.temperature, maxTokens, promptSent: promptSummary,
      },
    };
  }

  // No tool calls — use the initial response directly
  const content = initialResponse.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  const tokenUsage: TokenUsage = {
    promptTokens: totalUsage?.prompt_tokens || 0,
    completionTokens: totalUsage?.completion_tokens || 0,
    totalTokens: totalUsage?.total_tokens || 0,
  };

  let parsedResponse: AgentResponse;
  try {
    const parsed = JSON.parse(content) as AgentResponse;
    parsedResponse = {
      message: parsed.message || "I'm not sure what to say.",
      action: parsed.action || "none",
      transitionNote: parsed.transitionNote,
    };
  } catch {
    parsedResponse = {
      message: content,
      action: "none",
    };
  }

  // Estimate token breakdown (rough: 1 token ≈ 4 chars)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  const basePromptTokens = estimateTokens(config.systemPrompt);
  const suspectContextTokens = suspect ? estimateTokens(generateBasicSuspectContext(suspect)) : 0;
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

// STREAMING call - for the actual response to show to user
async function streamAgentResponse(
  openai: OpenAI,
  messages: ChatMessage[],
  agent: AgentId,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  suspect?: Suspect,
  toolCalls: ToolCall[] = []
): Promise<{ response: AgentResponse; tokenUsage: TokenUsage; debug: MessageDebugInfo }> {
  const config = getAgentConfig(agent);
  const formattedMessages = formatMessagesForAgent(messages);
  const model = "gpt-4o-mini";
  const maxTokens = 1024;
  const timestamp = new Date().toISOString();

  const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
  const contextCount = messages.length;
  const hasSuspect = !!suspect;
  const promptSummary = `Agent: ${agent} | Context: ${contextCount} msgs | Suspect: ${hasSuspect ? suspect.id : "none"} | Last user: "${lastUserMsg?.content?.slice(0, 50)}${(lastUserMsg?.content?.length || 0) > 50 ? '...' : ''}"`;
  const conversationHistory = formattedMessages.map(m => ({ role: m.role, content: m.content }));

  // Build system prompt with suspect context
  let augmentedSystemPrompt = config.systemPrompt;

  if (suspect) {
    augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n${generateBasicSuspectContext(suspect)}`;
  }

  // Tool call detection phase (non-streaming)
  type OAIMessage = { role: string; content: string | null; tool_calls?: unknown; tool_call_id?: string };
  const streamMessages: OAIMessage[] = [
    { role: "system", content: augmentedSystemPrompt },
    ...formattedMessages,
  ];

  const toolDetection = await openai.chat.completions.create({
    model,
    messages: streamMessages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
    max_tokens: maxTokens,
    temperature: config.temperature,
    tools: getToolsForAgent(agent),
  });

  if (toolDetection.choices[0]?.message?.tool_calls?.length) {
    streamMessages.push(toolDetection.choices[0].message as OAIMessage);

    for (const toolCall of toolDetection.choices[0].message.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const label = TOOL_LABELS[toolName] || toolName;
      const toolStart = Date.now();

      await writer.write(encoder.encode(sseEvent("step", {
        id: `tool_${toolName}`,
        label,
        status: "running",
      })));

      let toolResult: string;
      if (toolName === "search_knowledge_base") {
        const chunks = await retrieveContext(openai, toolArgs.query as string, 5);
        toolResult = chunks.length > 0
          ? buildContextString(chunks)
          : "No relevant information found in the knowledge base.";
      } else {
        toolResult = suspect ? executeTool(toolName, toolArgs, suspect) : "[No suspect loaded]";
      }
        const toolDuration = Date.now() - toolStart;

        await writer.write(encoder.encode(sseEvent("step", {
          id: `tool_${toolName}`,
          label,
          status: "done",
          detail: toolResult.slice(0, 120) + (toolResult.length > 120 ? "..." : ""),
          durationMs: toolDuration,
        })));

        toolCalls.push({
          name: toolName,
          description: label,
          input: toolArgs,
          output: toolResult.slice(0, 200),
          durationMs: toolDuration,
          status: "success",
        });

        streamMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        } as OAIMessage);
      }
    }

  // Send start event
  await writer.write(encoder.encode(sseEvent("start", { agent })));

  // Create streaming completion (with enriched messages if tools were called)
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

      // Extract and stream the "message" field content incrementally
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
            // Small delay for readable streaming
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
          // Small delay for readable streaming
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        if (parsed.complete) {
          inMessageField = false;
        }
      }
    }
  }

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

  // Estimate token breakdown
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  const basePromptTokens = estimateTokens(config.systemPrompt);
  const suspectContextTokens = suspect ? estimateTokens(generateBasicSuspectContext(suspect)) : 0;
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

  const { messages, activeAgent, roomState, suspectId } = body;

  if (!messages || !activeAgent || !roomState) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Get suspect data if ID provided
  const suspect = suspectId ? getSuspectById(suspectId) : undefined;
  if (suspectId && !suspect) {
    console.warn(`Suspect not found: ${suspectId}`);
  } else if (suspect) {
    console.log(`Interrogating suspect: ${suspect.name} (${suspect.id}) - ${suspect.currentCase.crime}`);
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      let totalTokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const toolCalls: ToolCall[] = [];

      // --- STEP: LLM Call (tools including RAG are agent-driven) ---
      const agentName = activeAgent === "goody" ? "Goody" : "Baddy";
      await writer.write(encoder.encode(sseEvent("step", {
        id: "decision",
        label: `Generating ${agentName}'s response`,
        status: "running",
        detail: `gpt-4o-mini, ${messages.length} msgs in context`,
      })));

      const decisionStart = Date.now();
      const decisionResult = await callAgentForDecision(openai, messages, activeAgent, writer, encoder, suspect, toolCalls);
      const decisionDuration = Date.now() - decisionStart;
      totalTokenUsage = { ...decisionResult.tokenUsage };

      const actionLabel = decisionResult.response.action === "bring_colleague" || decisionResult.response.action === "step_out"
        ? "Will hand off"
        : "Will respond";

      await writer.write(encoder.encode(sseEvent("step", {
        id: "decision",
        label: `LLM responded`,
        status: "done",
        detail: `${actionLabel} (${decisionResult.tokenUsage.promptTokens}+${decisionResult.tokenUsage.completionTokens} tokens, ${decisionDuration}ms)`,
        durationMs: decisionDuration,
      })));

      // Check if there's a handoff
      if (decisionResult.response.action === "bring_colleague" || decisionResult.response.action === "step_out") {
        const enteringAgent = getOtherAgent(activeAgent);

        await writer.write(encoder.encode(sseEvent("step", {
          id: "handoff",
          label: `Handing off to ${enteringAgent === "goody" ? "Goody" : "Baddy"}`,
          status: "done",
        })));
        const transition = generateTransition(activeAgent, enteringAgent);

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
        const newAgentResult = await streamAgentResponse(openai, messages, enteringAgent, writer, encoder, suspect, toolCalls);

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
