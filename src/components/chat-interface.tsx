"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ObservabilityPanel } from "@/components/observability-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { SuspectCard, SuspectCardData } from "@/components/suspect-card";
import { InlineSteps } from "@/components/inline-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomState, Message, TokenUsage, MessageDebugInfo, AgentId, PipelineStep } from "@/lib/agents";
import { suspectCards } from "@/lib/database/suspect-cards";
import { Send, Eye, EyeOff, ArrowRight, ChevronDown } from "lucide-react";

const DEFAULT_ROOM_STATE: RoomState = {
  goodyInRoom: true,
  baddyInRoom: true,
  activeAgent: "goody",
};

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>(DEFAULT_ROOM_STATE);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
  const [lastRequestTokens, setLastRequestTokens] = useState<TokenUsage | null>(null);
  const [allTurnDebug, setAllTurnDebug] = useState<MessageDebugInfo[]>([]);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number>(0);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [suspect, setSuspect] = useState<SuspectCardData | null>(null);
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

  const showError = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 6000);
  };

  const handleMessageDebugClick = (debug: MessageDebugInfo) => {
    // Find by timestamp since object identity won't match after JSON round-trip
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

  const startInterrogation = async () => {
    if (!suspect || requestInFlight.current || hasStarted) return;
    requestInFlight.current = true;
    pendingStepsRef.current = [];
    setHasStarted(true);
    setIsLoading(true);
    setPendingSteps([]);

    const triggerMessage = `[INTERROGATION START: Suspect ${suspect.name} brought in for ${suspect.currentCrime}]`;

    try {
      await processStream("/api/chat", {
        messages: [{ role: "user", content: triggerMessage }],
        activeAgent: roomState.activeAgent,
        roomState,
        suspectId: suspect.id,
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
    if (!messageText.trim() || requestInFlight.current || !suspect) return;
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
        .map(m => ({ role: m.role, content: m.content, agent: m.agent }));

      await processStream("/api/chat", {
        messages: apiMessages,
        activeAgent: roomState.activeAgent,
        roomState,
        suspectId: suspect.id,
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

  // --- Suspect selection screen ---
  if (!hasStarted) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {ToastUI}
        <header className="relative px-6 py-4 border-b border-border flex items-center justify-between">
          <h1 className="font-display text-2xl tracking-wide text-foreground">The Interrogation Room</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="mb-10 max-w-lg">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Choose your character</h2>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                Pick a suspect to play as. Each character has a unique backstory, criminal record, and set of circumstances. The detectives will adapt their strategy accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suspectCards.map((s, i) => (
                <SuspectCard key={s.id} suspect={s} compact index={i} selected={suspect?.id === s.id} onClick={() => setSuspect(s)} />
              ))}
            </div>
          </div>
        </main>

        {suspect && (
          <footer className="border-t border-border bg-card/80 backdrop-blur-xl px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-foreground font-semibold truncate">{suspect.name}</p>
                <p className="text-xs text-muted-foreground truncate">{suspect.currentCrime} &middot; {suspect.city}</p>
              </div>
              <Button onClick={startInterrogation} disabled={isLoading} className="bg-foreground text-background hover:bg-foreground/90 px-6 h-11 shrink-0 rounded-xl font-semibold text-[15px] gap-2">
                {isLoading ? (
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-background rounded-full animate-pulse" />Entering...</span>
                ) : (<>Begin interrogation<ArrowRight className="w-4 h-4" /></>)}
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
          <h1 className="font-display text-xl tracking-wide text-foreground">THE INTERROGATION ROOM</h1>
          {suspect && (
            <div className="relative">
              <button ref={caseButtonRef} onClick={() => setShowCasePopover(!showCasePopover)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-accent text-sm text-muted-foreground transition-colors">
                <span className="font-medium text-foreground">{suspect.name}</span>
                <span className="text-muted-foreground/60">{suspect.id}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showCasePopover && (
                <div className="absolute top-full left-0 mt-2 z-50 w-80">
                  <SuspectCard suspect={suspect} />
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

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex flex-col ${showPanel ? 'flex-[3]' : 'flex-1'} min-w-0`}>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.filter(m => !m.isTransition).map((message) => (
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
                    role={message.role}
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
                placeholder="Respond to the detectives..."
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
