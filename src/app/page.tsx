"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => setStarted(true), 600);
  };

  if (started) {
    return <ChatInterface />;
  }

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden transition-all duration-600 ${isExiting ? 'scale-110 opacity-0' : ''}`}>
      
      {/* Swinging lamp light effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] animate-swing-light">
        <div className="w-full h-full bg-gradient-radial from-white/10 via-white/5 to-transparent blur-2xl" />
      </div>

      {/* Lamp fixture */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-swing">
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
        <div className="text-3xl">💡</div>
      </div>

      {/* Police tape - top */}
      <div className="absolute top-14 -left-4 right-0 h-7 bg-yellow-400/90 -rotate-1 flex items-center overflow-hidden">
        <div className="animate-scroll-tape whitespace-nowrap text-black font-bold text-sm tracking-widest">
          {Array(20).fill("⚠️ CRIME SCENE DO NOT CROSS ").join("")}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-6">
          
          {/* Case file stamp effect */}
          <div className="inline-block">
            <div className="font-typewriter text-red-500/80 text-sm tracking-widest uppercase border-2 border-red-500/50 px-4 py-1.5 rotate-[-2deg] animate-stamp">
              CASE #2024-0121 — ACTIVE
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-7xl md:text-8xl tracking-wide leading-[0.9]">
              <span className="block text-white/90">THE</span>
              <span className="block text-red-500 animate-pulse-slow">INTERROGATION</span>
              <span className="block text-white/90">ROOM</span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="space-y-1">
            <p className="text-base text-white/50 tracking-widest uppercase">
              Two detectives. One suspect.
            </p>
            <p className="text-2xl text-red-500/80 font-medium tracking-wide">
              No escape.
            </p>
          </div>

          {/* Enter button */}
          <div className="pt-4">
            <button
              onClick={handleEnter}
              className="group relative"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping-slow" />
              <div className="absolute inset-[-6px] rounded-full border border-red-500/30 animate-pulse-slow" />
              
              <div className="relative px-12 py-4 bg-gradient-to-b from-red-600 to-red-700 rounded-full text-white font-semibold tracking-wide shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-500 hover:to-red-600 transition-all duration-300 group-hover:scale-105">
                <span className="flex items-center gap-3 text-base">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ENTER THE ROOM
                </span>
              </div>
            </button>
          </div>

          {/* Heartbeat line */}
          <div className="flex justify-center">
            <svg className="w-40 h-6 text-red-500/40" viewBox="0 0 200 40">
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

      {/* Fingerprint watermark */}
      <div className="absolute bottom-16 right-8 text-[100px] opacity-[0.03] select-none">
        🖐️
      </div>

      {/* Footer */}
      <footer className="py-4 text-center relative z-10">
        <span className="font-typewriter text-xs text-muted-foreground/50 tracking-wider">
          CLASSIFIED // AI INTERROGATION EXPERIMENT // CLEARANCE REQUIRED
        </span>
      </footer>

      {/* Corner evidence markers */}
      <div className="absolute top-24 left-6 flex flex-col items-center gap-1 opacity-30">
        <div className="w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">A</div>
        <div className="w-px h-12 bg-yellow-500/50" />
      </div>
      <div className="absolute bottom-24 right-6 flex flex-col items-center gap-1 opacity-30">
        <div className="w-px h-12 bg-yellow-500/50" />
        <div className="w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center">B</div>
      </div>
    </div>
  );
}
