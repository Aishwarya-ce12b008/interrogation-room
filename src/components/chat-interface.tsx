"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { RoomPresence } from "@/components/room-presence";
import { DebugSidebar } from "@/components/debug-sidebar";
import { SuspectCard, SuspectCardData } from "@/components/suspect-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomState, Message, TokenUsage, MessageDebugInfo, AgentId } from "@/lib/agents";
import { getRandomSuspectCard } from "@/lib/database/suspect-cards";
import { Send } from "lucide-react";

const DEFAULT_ROOM_STATE: RoomState = {
  goodyInRoom: true,
  baddyInRoom: true,
  activeAgent: "goody",
};

const CONTEXT_WINDOW_LIMIT = 128000;

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>(DEFAULT_ROOM_STATE);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const [lastRequestTokens, setLastRequestTokens] = useState<TokenUsage | null>(null);
  const [debugSidebar, setDebugSidebar] = useState<{ debug: MessageDebugInfo; content: string } | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [suspect, setSuspect] = useState<SuspectCardData | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Assign suspect on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const randomSuspect = getRandomSuspectCard();
      setSuspect(randomSuspect);
    }
  }, []);

  const handleOpenDebug = (debug: MessageDebugInfo, content: string) => {
    setDebugSidebar({ debug, content });
  };

  const handleCloseDebug = () => {
    setDebugSidebar(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Start the interrogation - detective opens with first question
  const startInterrogation = async () => {
    if (!suspect || isLoading || hasStarted) return;
    
    console.log("Starting interrogation for:", suspect.name, suspect.id);
    setHasStarted(true);
    setIsLoading(true);

    // Track streaming state
    let currentMessageId: string | null = null;
    let currentAgent: AgentId | null = null;
    let currentContent = "";
    let currentDebug: MessageDebugInfo | undefined;

    // Send a "start" trigger to the API - user hasn't said anything yet
    const triggerMessage = `[INTERROGATION START: Suspect ${suspect.name} brought in for ${suspect.currentCrime}]`;
    
    try {
      console.log("Sending API request...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: triggerMessage }],
          activeAgent: roomState.activeAgent,
          roomState,
          suspectId: suspect.id,
        }),
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to start interrogation: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      console.log("Starting to read stream...");
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream done");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            console.log("SSE event:", data.type);

            switch (data.type) {
              case "start": {
                console.log("Stream started, agent:", data.agent);
                currentMessageId = (Date.now() + Math.random()).toString();
                currentAgent = data.agent;
                currentContent = "";
                setStreamingMessageId(currentMessageId);
                
                setMessages((prev) => [...prev, {
                  id: currentMessageId!,
                  role: "assistant",
                  content: "",
                  agent: currentAgent!,
                }]);
                break;
              }

              case "token": {
                if (currentMessageId) {
                  currentContent += data.content;
                  setMessages((prev) => prev.map((m) => 
                    m.id === currentMessageId 
                      ? { ...m, content: currentContent }
                      : m
                  ));
                }
                break;
              }

              case "done": {
                setStreamingMessageId(null);
                
                if (currentMessageId) {
                  currentDebug = data.debug;
                  setMessages((prev) => prev.map((m) => 
                    m.id === currentMessageId 
                      ? { ...m, debug: currentDebug }
                      : m
                  ));
                }

                if (data.roomState) {
                  setRoomState(data.roomState);
                }

                if (data.tokenUsage) {
                  setLastRequestTokens(data.tokenUsage);
                  setTokenUsage((prev) => ({
                    promptTokens: prev.promptTokens + data.tokenUsage.promptTokens,
                    completionTokens: prev.completionTokens + data.tokenUsage.completionTokens,
                    totalTokens: prev.totalTokens + data.tokenUsage.totalTokens,
                  }));
                }
                break;
              }

              case "error": {
                throw new Error(data.message || "Stream error");
              }
            }
          } catch (parseError) {
            console.error("Failed to parse SSE event:", parseError, line);
          }
        }
      }
    } catch (error) {
      console.error("Error starting interrogation:", error);
      setStreamingMessageId(null);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Something went wrong.",
        agent: roomState.activeAgent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !suspect) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Track current streaming message
    let currentMessageId: string | null = null;
    let currentAgent: AgentId | null = null;
    let currentContent = "";
    let currentDebug: MessageDebugInfo | undefined;
    let hadHandoff = false;

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => !m.isTransition)
        .map((m) => ({
            role: m.role,
          content: m.content,
          agent: m.agent,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          activeAgent: roomState.activeAgent,
          roomState,
          suspectId: suspect.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
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

            switch (data.type) {
              case "handoff": {
                // Handoff detected BEFORE any response is shown
                // First agent decided to hand off (their response is NOT shown)
                hadHandoff = true;

                // Add transition messages
                const exitId = (Date.now() + 1).toString();
                const entranceId = (Date.now() + 2).toString();
                
                setMessages((prev) => [...prev, 
                  {
                    id: exitId,
                    role: "assistant",
                    content: data.exitMessage,
                    isTransition: true,
                  },
                  {
                    id: entranceId,
                    role: "assistant",
                    content: data.entranceMessage,
                    isTransition: true,
                  }
                ]);
                break;
              }

              case "start": {
                // Agent starting to respond (either first agent with no handoff, or second agent after handoff)
                currentMessageId = (Date.now() + Math.random()).toString();
                currentAgent = data.agent;
                currentContent = "";
                setStreamingMessageId(currentMessageId);
                
                // Add placeholder message
                setMessages((prev) => [...prev, {
                  id: currentMessageId!,
        role: "assistant",
                  content: "",
                  agent: currentAgent!,
                }]);
                break;
              }

              case "token": {
                // Streaming token
                if (currentMessageId) {
                  currentContent += data.content;
                  setMessages((prev) => prev.map((m) => 
                    m.id === currentMessageId 
                      ? { ...m, content: currentContent }
                      : m
                  ));
                }
                break;
              }

              case "done": {
                // Stream complete
                setStreamingMessageId(null);
                
                if (currentMessageId) {
                  currentDebug = data.debug;
                  // Update message with final debug info
                  setMessages((prev) => prev.map((m) => 
                    m.id === currentMessageId 
                      ? { ...m, debug: currentDebug }
                      : m
                  ));
                }

                // Update room state
                if (data.roomState) {
                  setRoomState(data.roomState);
                }

                // Update token usage
                if (data.tokenUsage) {
                  setLastRequestTokens(data.tokenUsage);
                  setTokenUsage((prev) => ({
                    promptTokens: prev.promptTokens + data.tokenUsage.promptTokens,
                    completionTokens: prev.completionTokens + data.tokenUsage.completionTokens,
                    totalTokens: prev.totalTokens + data.tokenUsage.totalTokens,
                  }));
                }
                break;
              }

              case "error": {
                throw new Error(data.message || "Stream error");
              }
            }
          } catch (parseError) {
            console.error("Failed to parse SSE event:", parseError, line);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setStreamingMessageId(null);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        agent: roomState.activeAgent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };


  // Loading state - waiting for suspect to be assigned
  if (!suspect) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/50 font-typewriter">Loading suspect file...</p>
        </div>
      </div>
    );
  }

  // Starting screen - show suspect and start button
  if (!hasStarted) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative px-6 py-4 border-b border-red-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
          <h1 className="font-display text-2xl tracking-wide text-red-500/70">THE INTERROGATION ROOM</h1>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 relative">
          {/* Subtle spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-gradient-radial from-white/5 via-transparent to-transparent blur-2xl pointer-events-none" />
          
          <div className="w-full max-w-lg space-y-6 relative z-10">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-block mb-2">
                <span className="font-typewriter text-red-500/60 text-sm tracking-widest border border-red-500/30 px-3 py-1">
                  CASE #{suspect.id}
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white/90">
                SUSPECT PROFILE
              </h2>
            </div>

            {/* Suspect Card */}
            <SuspectCard suspect={suspect} />

            {/* Start Button */}
            <div className="pt-2">
              <Button 
                onClick={startInterrogation}
                disabled={isLoading}
                className="w-full h-14 bg-red-600/80 hover:bg-red-600 text-white text-lg font-medium tracking-wide"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ENTERING ROOM...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    BEGIN INTERROGATION
                  </span>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-white/40">
              You are {suspect.name}. The detectives will question you about your alleged crime.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-3 text-center border-t border-white/[0.05]">
          <span className="font-typewriter text-xs text-muted-foreground/40 tracking-wider">
            RECORDING IN PROGRESS
          </span>
        </footer>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b border-red-500/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
        <h1 className="font-display text-2xl tracking-wide text-red-500/70 relative z-10">THE INTERROGATION ROOM</h1>
        <div className="relative z-10">
          <RoomPresence roomState={roomState} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Suspect card at top of chat */}
          {suspect && <SuspectCard suspect={suspect} />}
          
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              agent={message.agent}
              isTransition={message.isTransition}
              debug={message.debug}
              isStreaming={message.id === streamingMessageId}
              onOpenDebug={message.debug ? () => handleOpenDebug(message.debug!, message.content) : undefined}
            />
          ))}
          {isLoading && !streamingMessageId && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500/50 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-red-500/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 bg-red-500/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
              if (e.key === "Escape") {
                setInput("");
              }
            }}
            placeholder="Respond to the detectives..."
            disabled={isLoading}
            autoFocus
            className="flex-1 bg-black/40 border-white/[0.08] focus-visible:ring-red-500/20 focus-visible:border-red-500/30 text-base"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            size="icon"
            className="shrink-0 bg-red-600/80 hover:bg-red-600 disabled:bg-white/[0.05]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {tokenUsage.totalTokens > 0 && (
          <div className="max-w-2xl mx-auto mt-3 flex items-center justify-between text-xs text-muted-foreground/50">
            <div className="flex items-center gap-4 font-typewriter">
              <span>
                SESSION: <span className="text-muted-foreground/70">{tokenUsage.totalTokens.toLocaleString()}</span>
              </span>
              {lastRequestTokens && (
                <span>
                  LAST: <span className="text-muted-foreground/70">{lastRequestTokens.totalTokens.toLocaleString()}</span>
                  <span className="text-muted-foreground/40 ml-1">
                    ({lastRequestTokens.promptTokens.toLocaleString()}↓ {lastRequestTokens.completionTokens.toLocaleString()}↑)
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500/50 transition-all duration-300"
                  style={{ width: `${Math.min((tokenUsage.totalTokens / CONTEXT_WINDOW_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <span className="font-typewriter">{((tokenUsage.totalTokens / CONTEXT_WINDOW_LIMIT) * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </footer>

      {/* Debug Sidebar */}
      {debugSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseDebug}
          />
          <DebugSidebar
            debug={debugSidebar.debug}
            messageContent={debugSidebar.content}
            onClose={handleCloseDebug}
          />
        </>
      )}
    </div>
  );
}
