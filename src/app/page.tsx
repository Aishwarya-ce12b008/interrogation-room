"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { ThemeToggle } from "@/components/theme-toggle";
import { systemCatalog, type SystemLanding } from "@/systems/registry";
import { ArrowLeft, Fingerprint, Sprout, LineChart, Info, type LucideIcon } from "lucide-react";
import { InfoSlideshow } from "@/components/info-slideshow";

const systemCards: Record<string, {
  icon: LucideIcon;
  iconColor: string;
  bar: string;
}> = {
  Fingerprint: {
    icon: Fingerprint,
    iconColor: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  },
  Sprout: {
    icon: Sprout,
    iconColor: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  LineChart: {
    icon: LineChart,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-600",
  },
};

const accentColors: Record<string, { pulse: string; border: string; text: string; heartbeat: string; bg: string }> = {
  red: { pulse: "bg-red-500/10", border: "border-red-400/40 dark:border-red-500/30", text: "text-red-600 dark:text-red-500/80", heartbeat: "text-red-500/25", bg: "bg-red-500" },
  blue: { pulse: "bg-blue-500/10", border: "border-blue-400/40 dark:border-blue-500/30", text: "text-blue-600 dark:text-blue-500/80", heartbeat: "text-blue-500/25", bg: "bg-blue-500" },
  green: { pulse: "bg-green-500/10", border: "border-green-400/40 dark:border-green-500/30", text: "text-green-600 dark:text-green-500/80", heartbeat: "text-green-500/25", bg: "bg-green-500" },
  purple: { pulse: "bg-purple-500/10", border: "border-purple-400/40 dark:border-purple-500/30", text: "text-purple-600 dark:text-purple-500/80", heartbeat: "text-purple-500/25", bg: "bg-purple-500" },
  amber: { pulse: "bg-amber-500/10", border: "border-amber-400/40 dark:border-amber-500/30", text: "text-amber-600 dark:text-amber-500/80", heartbeat: "text-amber-500/25", bg: "bg-amber-500" },
};

type AppStep =
  | { step: "system-select" }
  | { step: "system-landing"; systemId: string; landing: SystemLanding }
  | { step: "chat"; systemId: string };

export default function Home() {
  const [appState, setAppState] = useState<AppStep>({ step: "system-select" });
  const [showInfo, setShowInfo] = useState(false);

  // --- Step 1: System Selector ---
  if (appState.step === "system-select") {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h1 className="font-display text-2xl tracking-wide text-foreground">Agent Playground</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Info className="w-[18px] h-[18px]" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <InfoSlideshow open={showInfo} onClose={() => setShowInfo(false)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-10 max-w-lg">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Choose an agent</h2>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                Each agent system has its own personality, tools, and purpose. Pick one to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemCatalog.map((sys) => {
                const card = systemCards[sys.icon];
                if (!card) return null;
                const IconComponent = card.icon;
                return (
                  <button
                    key={sys.id}
                    onClick={() => setAppState({ step: "system-landing", systemId: sys.id, landing: sys.landing })}
                    className="group text-left rounded-2xl border border-border bg-card hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 overflow-hidden"
                  >
                    <div className="flex h-full">
                      <div className={`w-1 shrink-0 ${card.bar} rounded-l-2xl`} />
                      <div className="p-5 flex-1 min-w-0">
                        <IconComponent className={`w-5 h-5 ${card.iconColor} mb-3`} />
                        <h3 className="font-semibold text-foreground text-[15px] mb-1">{sys.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{sys.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Placeholder for future agents */}
              <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/30 p-5 flex flex-col items-center justify-center text-center min-h-[160px]">
                <div className="text-2xl mb-2 opacity-40">+</div>
                <p className="text-sm text-muted-foreground/60">More agents coming soon</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Step 2: System Landing Page ---
  if (appState.step === "system-landing") {
    const { systemId, landing } = appState;
    const colors = accentColors[landing.accentColor] || accentColors.blue;

    return (
      <div className="h-screen flex flex-col relative overflow-hidden">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setAppState({ step: "system-select" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        {/* Swinging lamp light effect - dark mode only (interrogation only) */}
        {landing.accentColor === "red" && (
          <>
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] animate-swing-light">
              <div className="w-full h-full bg-gradient-radial from-white/10 via-white/5 to-transparent blur-2xl" />
            </div>
            <div className="hidden dark:flex absolute top-4 left-1/2 -translate-x-1/2 flex-col items-center animate-swing">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
              <div className="w-3 h-3 rounded-full bg-amber-300/80 shadow-lg shadow-amber-300/50" />
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <div className="max-w-xl w-full text-center space-y-8">

            {/* Case file stamp effect */}
            {landing.caseLabel && (
              <div className="inline-block">
                <div className={`font-typewriter ${colors.text} text-xs tracking-[0.2em] uppercase border ${colors.border} px-4 py-1.5 rounded-lg rotate-[-2deg] animate-stamp`}>
                  {landing.caseLabel}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <h1 className="font-display text-7xl md:text-8xl tracking-wide leading-[0.85]">
                <span className="block text-foreground/40 text-4xl md:text-5xl mb-1">{landing.title[0]}</span>
                <span className="block text-foreground">{landing.title[1]}</span>
                {landing.title[2] && <span className="block text-foreground/40 text-4xl md:text-5xl mt-1">{landing.title[2]}</span>}
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-base text-muted-foreground tracking-wide max-w-xs mx-auto leading-relaxed">
              {landing.tagline}
            </p>

            {/* Enter button */}
            <div className="pt-2">
              <button
                onClick={() => setAppState({ step: "chat", systemId })}
                className="group relative"
              >
                <div className={`absolute inset-[-8px] rounded-2xl ${colors.pulse} animate-pulse-slow pointer-events-none`} />
                <div className="relative px-10 py-4 bg-foreground text-background rounded-2xl font-semibold tracking-wide shadow-xl shadow-black/10 dark:shadow-black/30 hover:shadow-2xl hover:shadow-black/15 dark:hover:shadow-black/40 transition-all duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]">
                  <span className="flex items-center gap-3 text-[15px]">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.bg} animate-pulse`} />
                    {landing.enterButton}
                  </span>
                </div>
              </button>
            </div>

            {/* Heartbeat line */}
            <div className="flex justify-center pt-2">
              <svg className={`w-32 h-5 ${colors.heartbeat}`} viewBox="0 0 200 40">
                <path
                  className="animate-heartbeat"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M0,20 L40,20 L50,20 L55,5 L60,35 L65,15 L70,25 L75,20 L160,20 L170,20 L175,5 L180,35 L185,15 L190,25 L195,20 L200,20"
                />
              </svg>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center relative z-10">
          <span className="font-typewriter text-[10px] text-muted-foreground/30 tracking-[0.15em] uppercase">
            AI Agent Experiment
          </span>
        </footer>
      </div>
    );
  }

  // --- Step 3: Chat (handles subject selection internally if needed) ---
  return <ChatInterface systemId={appState.systemId} onBack={() => setAppState({ step: "system-select" })} />;
}
