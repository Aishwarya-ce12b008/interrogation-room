"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ObservabilityPanel } from "@/components/observability-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { SuspectCard } from "@/components/suspect-card";
import { MerchantCard } from "@/components/merchant-card";
import { KpiStrip } from "@/components/kpi-strip";
import { InlineSteps } from "@/components/inline-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomState, Message, TokenUsage, MessageDebugInfo, AgentId, PipelineStep, ToolCallRef } from "@/lib/agents";
import { Send, Eye, EyeOff, ArrowRight, ChevronDown, ArrowLeft } from "lucide-react";
import { type SystemDefinition, getSystem } from "@/systems/registry";
import { type SuspectCardData } from "@/systems/interrogation/types";
import { type MerchantCardData } from "@/systems/smb-analytics/types";

const CONTEXT_WINDOW_LIMIT = 128000;

// Shared SSE stream processor - handles all event types
function createStreamHandler(opts: {
  roomState: RoomState;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStreamingMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  setRoomState: React.Dispatch<React.SetStateAction<RoomState>>;
  setLastRequestTokens: React.Dispatch<React.SetStateAction<TokenUsage | null>>;
  setTokenUsage: React.Dispatch<React.SetStateAction<TokenUsage>>;
  setAllTurnDebug: React.Dispatch<React.SetStateAction<MessageDebugInfo[]>>;
  setSelectedTurnIndex: React.Dispatch<React.SetStateAction<number>>;
  setPendingSteps: React.Dispatch<React.SetStateAction<PipelineStep[]>>;
  pendingStepsRef: React.MutableRefObject<PipelineStep[]>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showError: (msg: string) => void;
}) {
  let currentMessageId: string | null = null;
  let currentContent = "";
  let currentDebug: MessageDebugInfo | undefined;
  let bufferedTransitions: string[] = [];

  return {
    handle(data: Record<string, unknown>) {
      switch (data.type) {
        case "step": {
          const step: PipelineStep = {
            id: data.id as string,
            label: data.label as string,
            status: data.status as PipelineStep["status"],
            detail: data.detail as string | undefined,
            durationMs: data.durationMs as number | undefined,
          };
          const existing = opts.pendingStepsRef.current.findIndex(s => s.id === step.id);
          if (existing >= 0) {
            opts.pendingStepsRef.current = [...opts.pendingStepsRef.current];
            opts.pendingStepsRef.current[existing] = step;
          } else {
            opts.pendingStepsRef.current = [...opts.pendingStepsRef.current, step];
          }
          opts.setPendingSteps(opts.pendingStepsRef.current);
          break;
        }

        case "tool_history": {
          const toolCalls = data.assistantToolCalls as ToolCallRef[];
          const toolResults = data.toolResults as { tool_call_id: string; name: string; content: string }[];

          // Insert assistant message with tool_calls (hidden from UI, used for API context)
          const assistantToolMsg: Message = {
            id: `tool-ast-${Date.now()}`,
            role: "assistant",
            content: "",
            tool_calls: toolCalls,
          };
          opts.setMessages(prev => [...prev, assistantToolMsg]);

          // Insert each tool result message
          const toolMsgs: Message[] = toolResults.map((tr, i) => ({
            id: `tool-res-${Date.now()}-${i}`,
            role: "tool" as const,
            content: tr.content,
            tool_call_id: tr.tool_call_id,
          }));
          if (toolMsgs.length > 0) {
            opts.setMessages(prev => [...prev, ...toolMsgs]);
          }
          break;
        }

        case "handoff": {
          bufferedTransitions = [
            data.exitMessage as string,
            data.entranceMessage as string,
          ];
          break;
        }

        case "start": {
          currentMessageId = (Date.now() + Math.random()).toString();
          const agent = data.agent as AgentId;
          currentContent = "";
          opts.setStreamingMessageId(currentMessageId);

          const stepsSnapshot = [...opts.pendingStepsRef.current];
          opts.pendingStepsRef.current = [];
          opts.setPendingSteps([]);

          const transitions = [...bufferedTransitions];
          bufferedTransitions = [];

          opts.setMessages(prev => [...prev, {
            id: currentMessageId!,
            role: "assistant",
            content: "",
            agent,
            steps: stepsSnapshot,
            transitions: transitions.length > 0 ? transitions : undefined,
          }]);
          break;
        }

        case "token": {
          if (currentMessageId) {
            currentContent += data.content as string;
            const captured = currentContent;
            const capturedId = currentMessageId;
            opts.setMessages(prev => prev.map(m =>
              m.id === capturedId ? { ...m, content: captured } : m
            ));
          }
          break;
        }

        case "done": {
          opts.setStreamingMessageId(null);
          if (currentMessageId) {
            currentDebug = data.debug as MessageDebugInfo | undefined;
            const capturedId = currentMessageId;
            opts.setMessages(prev => prev.map(m =>
              m.id === capturedId ? { ...m, debug: currentDebug } : m
            ));
            if (currentDebug) {
              opts.setAllTurnDebug(prev => {
                const next = [...prev, currentDebug!];
                opts.setSelectedTurnIndex(next.length - 1);
                return next;
              });
            }
          }
          if (data.roomState) opts.setRoomState(data.roomState as RoomState);
          if (data.tokenUsage) {
            const tu = data.tokenUsage as TokenUsage;
            opts.setLastRequestTokens(tu);
            opts.setTokenUsage(prev => ({
              promptTokens: prev.promptTokens + tu.promptTokens,
              completionTokens: prev.completionTokens + tu.completionTokens,
              totalTokens: prev.totalTokens + tu.totalTokens,
            }));
          }
          break;
        }

        case "error": {
          opts.setStreamingMessageId(null);
          opts.setPendingSteps([]);
          opts.showError(data.message as string || "Stream error");
          opts.setIsLoading(false);
          return true; // signal to stop
        }
      }
      return false;
    },
  };
}

interface ChatInterfaceProps {
  systemId: string;
  onBack: () => void;
}

export function ChatInterface({ systemId, onBack }: ChatInterfaceProps) {
  const [system, setSystem] = useState<SystemDefinition | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>({
    goodyInRoom: true,
    baddyInRoom: true,
    activeAgent: "goody",
  });
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
  const [lastRequestTokens, setLastRequestTokens] = useState<TokenUsage | null>(null);
  const [allTurnDebug, setAllTurnDebug] = useState<MessageDebugInfo[]>([]);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number>(0);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [subject, setSubject] = useState<SuspectCardData | MerchantCardData | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [showCasePopover, setShowCasePopover] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingSteps, setPendingSteps] = useState<PipelineStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const caseButtonRef = useRef<HTMLButtonElement>(null);
  const requestInFlight = useRef(false);
  const pendingStepsRef = useRef<PipelineStep[]>([]);
  const hasAutoStarted = useRef(false);

  // Load system definition
  useEffect(() => {
    getSystem(systemId).then(sys => {
      if (sys) {
        setSystem(sys);
        setRoomState({
          goodyInRoom: true,
          baddyInRoom: true,
          activeAgent: sys.defaultAgent as AgentId,
        });
        // If system has no subjects, skip subject selection
        if (!sys.hasSubjects) {
          setHasStarted(true);
        }
      }
    });
  }, [systemId]);

  const showError = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 6000);
  };

  const handleMessageDebugClick = (debug: MessageDebugInfo) => {
    let idx = allTurnDebug.indexOf(debug);
    if (idx < 0) {
      idx = allTurnDebug.findIndex(d => d.timestamp === debug.timestamp && d.agentId === debug.agentId);
    }
    if (idx >= 0) {
      setSelectedTurnIndex(idx);
      if (!showPanel) setShowPanel(true);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages, pendingSteps]);
  useEffect(() => { if (!isLoading) inputRef.current?.focus(); }, [isLoading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Auto-start for systems without subjects
  useEffect(() => {
    if (hasStarted && system && !system.hasSubjects && messages.length === 0 && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startSession();
    }
  }, [hasStarted, system, messages.length]);

  useEffect(() => {
    if (!showCasePopover) return;
    const handleClick = (e: MouseEvent) => {
      if (caseButtonRef.current && !caseButtonRef.current.contains(e.target as Node))
        setShowCasePopover(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCasePopover]);

  // Generic SSE fetch + process
  async function processStream(url: string, body: Record<string, unknown>) {
    const handler = createStreamHandler({
      roomState, setMessages, setStreamingMessageId, setRoomState,
      setLastRequestTokens, setTokenUsage, setAllTurnDebug,
      setSelectedTurnIndex, setPendingSteps, pendingStepsRef,
      setIsLoading, showError,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detail = "";
      try { detail = JSON.parse(errorText).error || errorText; } catch { detail = errorText; }
      throw new Error(`API ${response.status}: ${detail}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          const shouldStop = handler.handle(data);
          if (shouldStop) return;
        } catch (e) {
          console.error("Failed to parse SSE event:", e, line);
        }
      }
    }
  }

  const startSession = async () => {
    if (requestInFlight.current) return;
    // For systems with subjects, require one selected
    if (system?.hasSubjects && !subject) return;

    requestInFlight.current = true;
    pendingStepsRef.current = [];
    setHasStarted(true);
    setIsLoading(true);
    setPendingSteps([]);

    let triggerMessage = `[SESSION START]`;
    if (subject && system?.subjectCardType === "merchant") {
      triggerMessage = `[SESSION START] Merchant: ${subject.name}`;
    } else if (subject && "currentCrime" in subject) {
      triggerMessage = `[INTERROGATION START: Suspect ${subject.name} brought in for ${(subject as SuspectCardData).currentCrime}]`;
    }

    try {
      await processStream("/api/chat", {
        messages: [{ role: "user", content: triggerMessage }],
        activeAgent: roomState.activeAgent,
        roomState,
        suspectId: subject?.id,
        systemId,
      });
    } catch (error) {
      setStreamingMessageId(null);
      setPendingSteps([]);
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      requestInFlight.current = false;
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || requestInFlight.current) return;
    requestInFlight.current = true;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
    };

    pendingStepsRef.current = [];
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setPendingSteps([]);

    try {
      const apiMessages = [...messages, userMessage]
        .filter(m => !m.isTransition)
        .map(m => {
          const msg: Record<string, unknown> = { role: m.role, content: m.content };
          if (m.agent) msg.agent = m.agent;
          if (m.tool_calls) msg.tool_calls = m.tool_calls;
          if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
          return msg;
        });

      await processStream("/api/chat", {
        messages: apiMessages,
        activeAgent: roomState.activeAgent,
        roomState,
        suspectId: subject?.id,
        systemId,
      });
    } catch (error) {
      setStreamingMessageId(null);
      setPendingSteps([]);
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      requestInFlight.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const currentDebug = allTurnDebug[selectedTurnIndex] ?? null;

  const ToastUI = toast ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-float-in">
      <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-red-600/20 text-sm max-w-lg">
        <span className="flex-1">{toast}</span>
        <button onClick={() => setToast(null)} className="text-white/60 hover:text-white shrink-0 text-xs font-medium">Dismiss</button>
      </div>
    </div>
  ) : null;

  // Loading system
  if (!system) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.15s]" />
          <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>
    );
  }

  // --- Subject selection screen (for systems that have subjects) ---
  if (system.hasSubjects && !hasStarted) {
    const isMerchantSystem = system.subjectCardType === "merchant";
    const subjectCards = (system.getSubjectCards?.() || []) as (SuspectCardData | MerchantCardData)[];

    const subjectDescription = isMerchantSystem
      ? `Select a ${system.subjectLabel || "merchant"} to analyze their business data.`
      : `Pick a ${system.subjectLabel || "character"} to play as. Each one has a unique backstory and set of circumstances.`;

    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {ToastUI}
        <header className="relative px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-display text-2xl tracking-wide text-foreground">{system.name}</h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="mb-10 max-w-lg">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Choose your {system.subjectLabel || "character"}</h2>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                {subjectDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isMerchantSystem
                ? (subjectCards as MerchantCardData[]).map((m, i) => (
                    <MerchantCard key={m.id} merchant={m} index={i} selected={subject?.id === m.id} onClick={() => setSubject(m)} />
                  ))
                : (subjectCards as SuspectCardData[]).map((s, i) => (
                    <SuspectCard key={s.id} suspect={s} compact index={i} selected={subject?.id === s.id} onClick={() => setSubject(s)} />
                  ))
              }
            </div>
          </div>
        </main>

        {subject && (
          <footer className="border-t border-border bg-card/80 backdrop-blur-xl px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-foreground font-semibold truncate">{subject.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isMerchantSystem
                    ? `${(subject as MerchantCardData).business_type} · ${(subject as MerchantCardData).city}`
                    : `${(subject as SuspectCardData).currentCrime} · ${(subject as SuspectCardData).city}`
                  }
                </p>
              </div>
              <Button onClick={startSession} disabled={isLoading} className="bg-foreground text-background hover:bg-foreground/90 px-6 h-11 shrink-0 rounded-xl font-semibold text-[15px] gap-2">
                {isLoading ? (
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-background rounded-full animate-pulse" />Entering...</span>
                ) : (<>Begin session<ArrowRight className="w-4 h-4" /></>)}
              </Button>
            </div>
          </footer>
        )}
      </div>
    );
  }

  // --- Chat interface ---
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {ToastUI}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display text-xl tracking-wide text-foreground">{system.name.toUpperCase()}</h1>
          {subject && (
            <div className="relative">
              <button ref={caseButtonRef} onClick={() => setShowCasePopover(!showCasePopover)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-accent text-sm text-muted-foreground transition-colors">
                <span className="font-medium text-foreground">{subject.name}</span>
                {system.subjectCardType !== "merchant" && <span className="text-muted-foreground/60">{subject.id}</span>}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showCasePopover && system.subjectCardType !== "merchant" && "currentCrime" in subject && (
                <div className="absolute top-full left-0 mt-2 z-50 w-80">
                  <SuspectCard suspect={subject as SuspectCardData} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {tokenUsage.totalTokens > 0 && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {tokenUsage.totalTokens.toLocaleString()} tokens &middot; {((tokenUsage.totalTokens / CONTEXT_WINDOW_LIMIT) * 100).toFixed(1)}%
            </span>
          )}
          <button onClick={() => setShowPanel(!showPanel)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors lg:inline-flex hidden" title={showPanel ? "Hide observability" : "Show observability"}>
            {showPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {system.dashboard && subject && (
        <KpiStrip merchantCardId={subject.id} apiEndpoint={system.dashboard.apiEndpoint} />
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex flex-col ${showPanel ? 'flex-[3]' : 'flex-1'} min-w-0`}>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.filter(m => !m.isTransition && m.role !== "tool" && !(m.role === "assistant" && m.tool_calls && !m.content)).map((message) => (
                <div key={message.id}>
                  {/* Steps timeline above assistant message */}
                  {message.role === "assistant" && message.steps && message.steps.length > 0 && (
                    <InlineSteps
                      steps={message.steps}
                      isStreaming={message.id === streamingMessageId}
                      onStepClick={(stepId) => {
                        if (message.debug) handleMessageDebugClick(message.debug);
                        const sectionMap: Record<string, string> = {
                          suspect_lookup: "tools",
                          rag: "rag",
                          decision: "tokens",
                          handoff: "tools",
                        };
                        setHighlightedSection(sectionMap[stepId] || null);
                      }}
                    />
                  )}
                  {/* Transition messages (handoff) between steps and bubble */}
                  {message.transitions && message.transitions.map((t, i) => (
                    <div key={`${message.id}-t-${i}`} className="py-2">
                      <p className="text-sm text-muted-foreground italic">{t}</p>
                    </div>
                  ))}
                  <ChatMessage
                    role={message.role as "user" | "assistant"}
                    content={message.content}
                    agent={message.agent}
                    debug={message.debug}
                    isStreaming={message.id === streamingMessageId}
                    onOpenDebug={message.debug ? () => handleMessageDebugClick(message.debug!) : undefined}
                  />
                </div>
              ))}

              {/* Pending steps (before assistant message arrives) */}
              {pendingSteps.length > 0 && (
                <InlineSteps steps={pendingSteps} isStreaming={true} />
              )}

              {isLoading && !streamingMessageId && pendingSteps.length === 0 && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <div className="px-4 pb-4 pt-2">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2 items-center">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setInput("");
                }}
                placeholder="Type your response..."
                disabled={isLoading}
                autoFocus
                className="flex-1 bg-secondary border-0 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] h-11 px-5 shadow-none"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shrink-0 bg-foreground text-background hover:bg-foreground/90 disabled:bg-secondary disabled:text-muted-foreground rounded-full h-10 w-10 shadow-none border-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className={`hidden lg:block overflow-hidden transition-all duration-300 ease-in-out ${showPanel ? 'flex-[2] min-w-[320px] max-w-[480px] opacity-100' : 'w-0 min-w-0 max-w-0 opacity-0'}`}>
          <div className="h-full min-w-[320px]">
            <ObservabilityPanel debug={currentDebug} allTurnDebug={allTurnDebug} onSelectTurn={setSelectedTurnIndex} selectedTurnIndex={selectedTurnIndex} expandSection={highlightedSection} onSectionViewed={() => setHighlightedSection(null)} />
          </div>
        </div>
      </div>
    </div>
  );
}
