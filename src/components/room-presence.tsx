"use client";

import { cn } from "@/lib/utils";
import { AgentId, RoomState } from "@/lib/agents";

interface RoomPresenceProps {
  roomState: RoomState;
}

export function RoomPresence({ roomState }: RoomPresenceProps) {
  const { activeAgent, goodyInRoom, baddyInRoom } = roomState;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="mr-1">Detectives:</span>
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
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300",
        inRoom
          ? isActive
            ? isGoody
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 text-red-700 dark:text-red-400"
            : "text-muted-foreground"
          : "text-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full transition-all duration-300",
          inRoom
            ? isActive
              ? isGoody
                ? "bg-emerald-500 animate-pulse"
                : "bg-red-500 animate-pulse"
              : "bg-muted-foreground/30"
            : "bg-muted-foreground/15"
        )}
      />
      {isGoody ? "Goody" : "Baddy"}
    </div>
  );
}
