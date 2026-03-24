"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { AgentId, MessageDebugInfo } from "@/lib/agents";
import { SkillBadges } from "@/components/skill-badge";
import { Eye, Calendar, Clock, Users, ExternalLink } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
  agentName?: string;
  isTransition?: boolean;
  debug?: MessageDebugInfo;
  isStreaming?: boolean;
  onOpenDebug?: () => void;
  onBadgeClick?: (section: string) => void;
}

interface CalendarEvent {
  url: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
}

function extractCalendarEvent(text: string): { event: CalendarEvent | null; cleanText: string } {
  const calUrlRegex = /https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE[^\s)>]*/;
  const match = text.match(calUrlRegex);
  if (!match) return { event: null, cleanText: text };

  const url = match[0];
  const params = new URLSearchParams(url.split("?")[1]);
  const title = decodeURIComponent(params.get("text") || "Meeting");
  const dates = params.get("dates") || "";
  const attendeeStr = params.get("add") || "";
  const attendees = attendeeStr ? attendeeStr.split(",").map(e => decodeURIComponent(e)) : [];

  let date = "";
  let time = "";
  let duration = "30 min";
  if (dates) {
    const [startStr, endStr] = dates.split("/");
    const parseCalDate = (s: string) => {
      const y = s.slice(0, 4), mo = s.slice(4, 6), d = s.slice(6, 8);
      const h = s.slice(9, 11), mi = s.slice(11, 13);
      return new Date(`${y}-${mo}-${d}T${h}:${mi}:00Z`);
    };
    const start = parseCalDate(startStr);
    const end = endStr ? parseCalDate(endStr) : null;
    date = start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    time = start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    if (end) {
      const mins = Math.round((end.getTime() - start.getTime()) / 60000);
      duration = mins >= 60 ? `${(mins / 60).toFixed(mins % 60 ? 1 : 0)} hr` : `${mins} min`;
    }
  }

  const cleanText = text
    .replace(/\[([^\]]*)\]\([^)]*calendar\.google\.com[^)]*\)/g, "")
    .replace(calUrlRegex, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { event: { url, title, date, time, duration, attendees }, cleanText };
}

function CalendarEventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="not-prose my-3 rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-border">
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">{event.title}</span>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-4 text-sm text-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            {event.time} ({event.duration})
          </span>
        </div>
        {event.attendees.length > 0 && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{event.attendees.join(", ")}</span>
          </div>
        )}
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors no-underline"
        >
          <ExternalLink className="w-3 h-3" />
          Add to Google Calendar
        </a>
      </div>
    </div>
  );
}

export function ChatMessage({ role, content, agent, agentName, isTransition, debug, isStreaming, onOpenDebug, onBadgeClick }: ChatMessageProps) {
  const isUser = role === "user";

  if (isTransition) return null;

  const { event: calendarEvent, cleanText } = !isUser && !isStreaming
    ? extractCalendarEvent(content)
    : { event: null, cleanText: content };
  const displayContent = calendarEvent ? cleanText : content;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative",
          isUser
            ? "max-w-[80%] rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground rounded-br-md"
            : "max-w-[80%] py-2"
        )}
      >
        {!isUser && agent && (
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-widest",
                agent === "goody"
                  ? "text-emerald-600 dark:text-emerald-500"
                  : agent === "baddy"
                  ? "text-red-600 dark:text-red-400"
                  : "text-purple-600 dark:text-purple-400"
              )}
            >
              {agentName || agent}
            </span>
            {debug && onOpenDebug && (
              <button
                onClick={onOpenDebug}
                className="p-1 rounded-lg text-muted-foreground/20 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                title="View debug info"
              >
                <Eye className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <div className="text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-blockquote:my-2 prose-table:my-2 prose-th:px-3 prose-th:py-1.5 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:uppercase prose-th:tracking-wider prose-th:text-muted-foreground prose-td:px-3 prose-td:py-1.5 prose-td:text-sm prose-thead:border-b prose-thead:border-border prose-tr:border-b prose-tr:border-border/50">
          {isUser ? (
            <p className="whitespace-pre-wrap m-0">{content}</p>
          ) : (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              {calendarEvent && <CalendarEventCard event={calendarEvent} />}
            </>
          )}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse rounded-full" />
          )}
        </div>

        {!isUser && debug && !isStreaming && (
          <SkillBadges debug={debug} onBadgeClick={onBadgeClick} />
        )}
      </div>
    </div>
  );
}
