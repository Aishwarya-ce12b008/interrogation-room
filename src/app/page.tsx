"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <ChatInterface />;
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">

      {/* Swinging lamp light effect - dark mode only */}
      <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] animate-swing-light">
        <div className="w-full h-full bg-gradient-radial from-white/10 via-white/5 to-transparent blur-2xl" />
      </div>

      {/* Lamp fixture - dark mode only */}
      <div className="hidden dark:flex absolute top-4 left-1/2 -translate-x-1/2 flex-col items-center animate-swing">
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
        <div className="w-3 h-3 rounded-full bg-amber-300/80 shadow-lg shadow-amber-300/50" />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-xl w-full text-center space-y-8">

          {/* Case file stamp effect */}
          <div className="inline-block">
            <div className="font-typewriter text-red-600 dark:text-red-500/80 text-xs tracking-[0.2em] uppercase border border-red-400/40 dark:border-red-500/30 px-4 py-1.5 rounded-lg rotate-[-2deg] animate-stamp">
              CASE #2024-0121 // ACTIVE
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="font-display text-7xl md:text-8xl tracking-wide leading-[0.85]">
              <span className="block text-foreground/40 text-4xl md:text-5xl mb-1">THE</span>
              <span className="block text-foreground">INTERROGATION</span>
              <span className="block text-foreground/40 text-4xl md:text-5xl mt-1">ROOM</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-base text-muted-foreground tracking-wide max-w-xs mx-auto leading-relaxed">
            Two AI detectives will interrogate you. How long can you keep your story straight?
          </p>

          {/* Enter button */}
          <div className="pt-2">
            <button
              onClick={() => setStarted(true)}
              className="group relative"
            >
              <div className="absolute inset-[-8px] rounded-2xl bg-red-500/10 animate-pulse-slow pointer-events-none" />

              <div className="relative px-10 py-4 bg-foreground text-background rounded-2xl font-semibold tracking-wide shadow-xl shadow-black/10 dark:shadow-black/30 hover:shadow-2xl hover:shadow-black/15 dark:hover:shadow-black/40 transition-all duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]">
                <span className="flex items-center gap-3 text-[15px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Enter the room
                </span>
              </div>
            </button>
          </div>

          {/* Heartbeat line */}
          <div className="flex justify-center pt-2">
            <svg className="w-32 h-5 text-red-500/25" viewBox="0 0 200 40">
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
          AI Interrogation Experiment
        </span>
      </footer>
    </div>
  );
}
