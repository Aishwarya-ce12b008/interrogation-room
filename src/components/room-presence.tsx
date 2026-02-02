"use client";

import { cn } from "@/lib/utils";
import { AgentId, RoomState } from "@/lib/agents";

interface RoomPresenceProps {
  roomState: RoomState;
}

export function RoomPresence({ roomState }: RoomPresenceProps) {
  const { activeAgent, goodyInRoom, baddyInRoom } = roomState;

  return (
    <div className="flex items-center gap-3">
      <AgentBadge
        agent="goody"
        inRoom={goodyInRoom}
        isActive={activeAgent === "goody"}
      />
      <AgentBadge
        agent="baddy"
        inRoom={baddyInRoom}
        isActive={activeAgent === "baddy"}
      />
    </div>
  );
}

interface AgentBadgeProps {
  agent: AgentId;
  inRoom: boolean;
  isActive: boolean;
}

function AgentBadge({ agent, inRoom, isActive }: AgentBadgeProps) {
  const isGoody = agent === "goody";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
        inRoom
          ? isActive
            ? isGoody
              ? "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/50"
              : "bg-red-600/20 text-red-400 ring-1 ring-red-500/50"
            : "bg-secondary text-muted-foreground"
          : "bg-secondary/50 text-muted-foreground/50"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full transition-all duration-300",
          inRoom
            ? isActive
              ? isGoody
                ? "bg-emerald-400 animate-pulse"
                : "bg-red-400 animate-pulse"
              : isGoody
                ? "bg-emerald-600/50"
                : "bg-red-600/50"
            : "bg-muted-foreground/30"
        )}
      />
      {isGoody ? "Goody" : "Baddy"}
    </div>
  );
}
