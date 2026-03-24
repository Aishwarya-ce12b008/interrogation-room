"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
const TOTAL_SLIDES = 7;

const slideVariants = {
  enter: {
    y: -20,
    opacity: 0,
  },
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    y: 8,
    opacity: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.18, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

/* ──────────────────────── Agent Mockup UIs ──────────────────────── */

/* ── Agent Mockup UIs — each intentionally different in structure/style ── */

function MockInterrogation() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: "#0e0e18", fontFamily: "system-ui", borderRadius: 6 }}>
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c0392b" }} />
          <span style={{ color: "#c0392b", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Interrogation Room</span>
        </div>
        <span style={{ color: "#555", fontSize: 7 }}>Suspect: Marcus Bell</span>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1.5 overflow-hidden">
        <div className="rounded-lg px-2.5 py-1.5 max-w-[85%]" style={{ background: "#1a1a2e" }}>
          <span style={{ color: "#888", fontSize: 8 }}>Where were you on the night of March 12th?</span>
        </div>
        <div className="rounded-lg px-2.5 py-1.5 max-w-[80%] ml-auto" style={{ background: "rgba(192,57,43,0.12)", borderLeft: "2px solid rgba(192,57,43,0.4)" }}>
          <span style={{ color: "#a88", fontSize: 8 }}>I was at home. You can check the cameras.</span>
        </div>
        <div className="rounded-lg px-2.5 py-1.5 max-w-[85%]" style={{ background: "#1a1a2e" }}>
          <span style={{ color: "#888", fontSize: 8 }}>Your neighbour says otherwise. Care to explain?</span>
        </div>
        <div className="rounded-lg px-2.5 py-1.5 max-w-[75%] ml-auto" style={{ background: "rgba(192,57,43,0.12)", borderLeft: "2px solid rgba(192,57,43,0.4)" }}>
          <span style={{ color: "#a88", fontSize: 8 }}>Look, I already told you...</span>
        </div>
      </div>
      <div className="px-3 py-2 flex gap-2" style={{ borderTop: "1px solid #1a1a2e" }}>
        <div className="flex-1 rounded px-2 py-1" style={{ background: "#1a1a2e" }}>
          <span style={{ color: "#444", fontSize: 7 }}>Ask a follow-up...</span>
        </div>
      </div>
    </div>
  );
}

function MockKitchen() {
  const recipes = [
    { name: "Dal Tadka", time: "25 min", tag: "Lunch" },
    { name: "Masala Omelette", time: "10 min", tag: "Breakfast" },
    { name: "Pongal", time: "30 min", tag: "South Indian" },
  ];
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: "#f8f6f0", borderRadius: 10 }}>
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span style={{ fontSize: 11, fontWeight: 600, color: "#3a3530", fontStyle: "italic" }}>Aishwarya&apos;s Kitchen</span>
        <span style={{ fontSize: 8, color: "#a09580", border: "1px solid #d4cfc0", borderRadius: 4, padding: "1px 5px" }}>+ Add</span>
      </div>
      <div className="px-3 mb-2">
        <div className="rounded-full px-2.5 py-1" style={{ background: "#eee9df", fontSize: 7, color: "#999" }}>Search recipes...</div>
      </div>
      <div className="flex-1 px-3 space-y-1.5 overflow-hidden">
        {recipes.map((r) => (
          <div key={r.name} className="flex items-center justify-between py-1.5 px-2" style={{ background: "#f0ece3", borderRadius: 6 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 500, color: "#3a3530" }}>{r.name}</div>
              <div style={{ fontSize: 7, color: "#a09580" }}>{r.time}</div>
            </div>
            <span style={{ fontSize: 6, color: "#7a8a6a", background: "#e8efe0", padding: "1px 4px", borderRadius: 3 }}>{r.tag}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 flex gap-3" style={{ borderTop: "1px solid #e8e3d8" }}>
        <span style={{ fontSize: 7, color: "#b0a890", fontWeight: 500 }}>All</span>
        <span style={{ fontSize: 7, color: "#7a8a6a", fontWeight: 600 }}>Favourites</span>
        <span style={{ fontSize: 7, color: "#b0a890", fontWeight: 500 }}>Recent</span>
      </div>
    </div>
  );
}

function MockPreggo() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: "#ede7f6", borderRadius: 14 }}>
      <div className="px-4 pt-3 pb-1 text-center">
        <div style={{ fontSize: 7, color: "#9575cd", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Week 24</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4a148c", marginTop: 2 }}>Preggo</div>
        <div style={{ fontSize: 7, color: "#7e57c2", marginTop: 1 }}>Baby is the size of a cantaloupe 🍈</div>
      </div>
      <div className="flex-1 px-3 py-2 space-y-2">
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.6)" }}>
          <div style={{ fontSize: 7, fontWeight: 600, color: "#6a1b9a", marginBottom: 3 }}>Today&apos;s reminders</div>
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ fontSize: 8 }}>💊</span>
            <span style={{ fontSize: 7.5, color: "#4a4a5a" }}>Iron + Folic acid</span>
            <span style={{ fontSize: 6, color: "#aaa", marginLeft: "auto" }}>8:00 AM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 8 }}>🩺</span>
            <span style={{ fontSize: 7.5, color: "#4a4a5a" }}>Glucose test — Dr. Mehta</span>
            <span style={{ fontSize: 6, color: "#aaa", marginLeft: "auto" }}>Thu</span>
          </div>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.6)" }}>
          <div style={{ fontSize: 7, fontWeight: 600, color: "#6a1b9a", marginBottom: 3 }}>Logged symptoms</div>
          <div className="flex flex-wrap gap-1">
            {["Back pain", "Heartburn", "Fatigue", "Swelling"].map((s) => (
              <span key={s} style={{ fontSize: 6.5, background: "#d1c4e9", color: "#4a148c", borderRadius: 10, padding: "1px 5px" }}>{s}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <span style={{ fontSize: 7.5, color: "#0088cc" }}>📲</span>
          <span style={{ fontSize: 6.5, color: "#888" }}>Connected to Telegram</span>
        </div>
      </div>
    </div>
  );
}

function MockAggyMiles() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: "#fff", borderRadius: 4, border: "1px solid #e0e0e0" }}>
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <div className="flex items-center justify-center" style={{ width: 18, height: 18, background: "#222", borderRadius: 3 }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>A</span>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#222" }}>Aggy&apos;s Miles</div>
          <div style={{ fontSize: 6.5, color: "#999" }}>Agastya · 11 months old</div>
        </div>
      </div>
      <div className="flex-1 px-3 py-1 space-y-1.5 overflow-hidden">
        <div style={{ fontSize: 7.5, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>Motor skills</div>
        {[
          { m: "Holds head steady", done: true },
          { m: "Rolls both ways", done: true },
          { m: "Sits without support", done: true },
          { m: "Crawling", done: false },
          { m: "Pulls to stand", done: false },
        ].map((item) => (
          <div key={item.m} className="flex items-center gap-2 py-0.5">
            <div style={{ width: 10, height: 10, borderRadius: 2, border: item.done ? "none" : "1.5px solid #ccc", background: item.done ? "#222" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.done && <span style={{ color: "#fff", fontSize: 6 }}>✓</span>}
            </div>
            <span style={{ fontSize: 8, color: item.done ? "#333" : "#aaa", textDecoration: item.done ? "line-through" : "none" }}>{item.m}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2" style={{ borderTop: "1px solid #eee" }}>
        <div className="flex gap-1">
          {[...Array(11)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 1, background: i < 7 ? "#222" : "#e5e5e5" }} />
          ))}
        </div>
        <div style={{ fontSize: 6, color: "#999", marginTop: 2 }}>7 of 52 milestones completed</div>
      </div>
    </div>
  );
}

function MockPlaystoreReviewer() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: "#f8f9fc", fontFamily: "system-ui", borderRadius: 8, border: "1px solid #e2e5ee" }}>
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between" style={{ background: "#fff" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1a1f36" }}>Playstore Reviewer</div>
          <div style={{ fontSize: 7, color: "#8792a2" }}>Vyapar App · Last 90 days</div>
        </div>
        <div className="flex items-center gap-0.5">
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1f36" }}>4.2</span>
          <span style={{ color: "#f5a623", fontSize: 10 }}>★</span>
        </div>
      </div>
      <div className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
        <div className="flex items-end gap-0.5" style={{ height: 36 }}>
          {[40, 65, 52, 88, 73, 60, 45, 78, 91, 55].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 80 ? "#4263eb" : "#e2e5ee", borderRadius: "2px 2px 0 0" }} />
          ))}
        </div>
        <div className="space-y-1">
          {[
            { text: "Invoice generation is very slow after update", score: "Negative", color: "#e74c3c" },
            { text: "Best accounting app for small business!!", score: "Positive", color: "#27ae60" },
            { text: "GST filing feature needs more options", score: "Mixed", color: "#f39c12" },
          ].map((r) => (
            <div key={r.text} className="flex items-start gap-1.5 py-1 px-1.5" style={{ background: "#fff", borderRadius: 4 }}>
              <span style={{ fontSize: 6, fontWeight: 600, color: r.color, whiteSpace: "nowrap", marginTop: 1 }}>{r.score}</span>
              <span style={{ fontSize: 7, color: "#555", lineHeight: 1.3 }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockCatalogGenerator() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: "#fff8f0", borderRadius: 8 }}>
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between" style={{ borderBottom: "2px solid #e67e22" }}>
        <div className="flex items-center gap-1.5">
          <div style={{ background: "#e67e22", borderRadius: 3, width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 7, fontWeight: 800 }}>V</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, color: "#5a4a3a" }}>Catalog Generator</span>
        </div>
        <span style={{ fontSize: 6, color: "#e67e22" }}>3 items ready</span>
      </div>
      <div className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
        <div className="flex gap-2">
          <div style={{ width: 50, height: 50, background: "#f0e8da", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #d4c4a8" }}>
            <span style={{ fontSize: 6, color: "#b0a080" }}>IMG</span>
          </div>
          <div className="flex-1">
            <div style={{ fontSize: 9, fontWeight: 600, color: "#3a3020" }}>Brass Diya Set (Pack of 4)</div>
            <div style={{ fontSize: 7, color: "#888" }}>₹450 · In stock</div>
            <div style={{ fontSize: 7, color: "#e67e22", marginTop: 2 }}>✓ Description generated</div>
          </div>
        </div>
        <div className="px-2 py-1.5" style={{ background: "#fef4e8", borderRadius: 4, fontSize: 7, color: "#6a5a40", lineHeight: 1.4 }}>
          Handcrafted brass diya set, perfect for festive decoration. Each piece is uniquely finished with traditional Rajasthani patterns. Ideal for Diwali, puja rooms, and gifting...
        </div>
        <div className="flex gap-1.5">
          <div style={{ flex: 1, textAlign: "center", background: "#e67e22", color: "#fff", fontSize: 7, fontWeight: 600, borderRadius: 4, padding: "3px 0" }}>Add to Catalog</div>
          <div style={{ textAlign: "center", color: "#999", fontSize: 7, border: "1px solid #ddd", borderRadius: 4, padding: "3px 8px" }}>Edit</div>
        </div>
      </div>
    </div>
  );
}

const agentMockups = [
  { name: "Interrogation Room", component: MockInterrogation },
  { name: "Kitchen Manager", component: MockKitchen },
  { name: "Preggo", component: MockPreggo },
  { name: "Aggy's Miles", component: MockAggyMiles },
  { name: "Playstore Reviewer", component: MockPlaystoreReviewer },
  { name: "Catalog Generator", component: MockCatalogGenerator },
];

/* ──────────────────────── Slide Components ──────────────────────── */

function SlidePlatform() {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-8"
      >
        The Agent Playground
      </motion.h1>

      <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="text-muted-foreground text-lg leading-relaxed max-w-2xl"
      >
        A platform built to rapidly prototype AI agents, with deep observability plugged in so you can see exactly what&apos;s happening behind every response.
      </motion.p>
    </div>
  );
}

function SlideWhyImages() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-3"
      >
        6 agents, 6 workflows
      </motion.h1>

      <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="text-muted-foreground text-base leading-relaxed mb-8"
      >
        Each one built from scratch. Each one a completely different problem.
      </motion.p>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {agentMockups.map((agent, idx) => {
            const Comp = agent.component;
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 w-[240px] flex flex-col"
              >
                <div className="h-[300px] rounded-xl overflow-hidden shadow-sm">
                  <Comp />
                </div>
                <span className="text-xs text-muted-foreground mt-2 text-center">{agent.name}</span>
              </motion.div>
            );
          })}
        </div>
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
          className="absolute right-0 top-[100px] p-1.5 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function SlideWhyText() {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-8"
      >
        Why a platform, not just projects
      </motion.h1>

      <div className="space-y-5 max-w-2xl">
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-3 text-muted-foreground text-lg leading-relaxed"
        >
          <span className="shrink-0">-</span>
          <span>8 agents over the last year. Each one meant rebuilding infrastructure from scratch. Frontend, backend, integrations, API keys, pipelines, etc.</span>
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-3 text-muted-foreground text-lg leading-relaxed"
        >
          <span className="shrink-0">-</span>
          <span>Significant cognitive overload when you want to experiment with multiple ideas. Most of your energy goes into logistics.</span>
        </motion.div>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-3 text-muted-foreground text-lg leading-relaxed"
        >
          <span className="shrink-0">-</span>
          <span>This platform solves that. The infra layer is set up. Every new agent inherits it and it compounds for the next one.</span>
        </motion.div>
      </div>
    </div>
  );
}

const layers = [
  {
    label: "The Model",
    description: "The foundation. A probabilistic system that takes tokens in and gives tokens out. On its own, it knows nothing about your problem.",
  },
  {
    label: "System Prompt",
    description: "The instruction layer. This is where you define who the agent is, how it reasons, what it can and cannot do.",
  },
  {
    label: "Tools",
    description: "The execution layer. Functions the agent can invoke to interact with the real world. Search, compute, fetch, act.",
  },
  {
    label: "MCPs & Knowledge",
    description: "The context layer. RAG pipelines, MCP servers, domain-specific knowledge. This is what makes the agent useful for your enterprise, not just generic.",
  },
];

function SlideHarness() {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-3"
      >
        Building blocks of an agent
      </motion.h1>

      <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl"
      >
        Everyone has access to the same foundation models. The delta is how you structure what goes around them.
      </motion.p>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-col-reverse gap-1.5 shrink-0"
        >
          {layers.map((layer, idx) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center"
            >
              <div
                className="rounded-md border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground"
                style={{ width: `${120 + idx * 30}px` }}
              >
                {layer.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="space-y-4 flex-1 max-w-lg">
          {layers.map((layer, idx) => (
            <motion.div
              key={layer.label}
              custom={3 + idx}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="text-sm font-medium text-foreground">{layer.label}</span>
              <p className="text-muted-foreground text-[15px] leading-relaxed mt-0.5">{layer.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p custom={8} variants={fadeUp} initial="hidden" animate="visible"
        className="text-foreground text-base leading-relaxed mt-8 max-w-2xl"
      >
        The model is the starting line. The system you build around it is the race.
      </motion.p>
    </div>
  );
}

const legoBlocks = [
  { label: "Model", sub: "Tokens in, tokens out", height: 80, width: 130 },
  { label: "System Prompt", sub: "Identity & instructions", height: 110, width: 150 },
  { label: "Tools", sub: "Search, compute, act", height: 145, width: 150 },
  { label: "MCPs & Knowledge", sub: "RAG, context, enterprise data", height: 185, width: 170 },
];

function SlideHarnessLego() {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-2"
      >
        Building blocks of an agent
      </motion.h1>

      <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="text-muted-foreground text-base leading-relaxed mb-10"
      >
        Each layer adds complexity. The more you stack, the more capable the agent becomes.
      </motion.p>

      {/* Lego blocks - horizontal, left to right, increasing height */}
      <div className="flex items-end gap-1">
        {legoBlocks.map((block, idx) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.3 + idx * 0.25,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col items-center"
          >
            {/* The block */}
            <div
              className="relative border border-border rounded-lg bg-secondary/30 flex flex-col items-center justify-center px-3"
              style={{ height: block.height, width: block.width }}
            >
              {/* Lego studs */}
              <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-border bg-background" />
                <div className="w-2.5 h-2.5 rounded-full border border-border bg-background" />
              </div>

              <span className="text-sm font-medium text-foreground text-center leading-tight">{block.label}</span>
            </div>

            {/* Label below */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + idx * 0.25, duration: 0.4 }}
              className="text-xs text-muted-foreground mt-3 text-center max-w-[140px]"
            >
              {block.sub}
            </motion.span>
          </motion.div>
        ))}

        {/* Arrow showing increasing complexity */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="flex flex-col items-center ml-4 mb-8"
        >
          <span className="text-xs text-muted-foreground/50 writing-mode-vertical rotate-0">complexity →</span>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="text-foreground text-base leading-relaxed mt-10"
      >
        The model is the starting line. The system you build around it is the race.
      </motion.p>
    </div>
  );
}

function SlideEvals() {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-3"
      >
        What doesn&apos;t get measured doesn&apos;t get improved
      </motion.h1>

      <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-2xl"
      >
        This is not a traditional testing problem. The system is stochastic. Same input can produce different outputs. You need a fundamentally different approach to evaluation.
      </motion.p>

      <div className="space-y-4 max-w-2xl">
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <span className="text-sm font-medium text-foreground">Observability</span>
          <p className="text-muted-foreground text-[15px] leading-relaxed mt-0.5">
            Langfuse is wired in for tracing. Every step the agent takes, every tool call, every decision point is visible.
          </p>
        </motion.div>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <span className="text-sm font-medium text-foreground">Evaluation</span>
          <p className="text-muted-foreground text-[15px] leading-relaxed mt-0.5">
            Built structured eval datasets and run them through Braintrust. Three dimensions:
          </p>
        </motion.div>
      </div>

      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="flex gap-4 mt-5"
      >
        {[
          { title: "Quality", desc: "Accurate, relevant, complete?" },
          { title: "Safety", desc: "Stays within guardrails?" },
          { title: "Capability", desc: "Can it perform end to end?" },
        ].map((item) => (
          <div key={item.title} className="border border-border rounded-lg px-4 py-3 flex-1 max-w-[180px]">
            <span className="text-sm font-medium text-foreground block">{item.title}</span>
            <span className="text-xs text-muted-foreground mt-0.5 block">{item.desc}</span>
          </div>
        ))}
      </motion.div>

      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-2 gap-3 mt-6 max-w-md"
      >
        <div className="aspect-video rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground/40">Langfuse traces</span>
        </div>
        <div className="aspect-video rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground/40">Braintrust evals</span>
        </div>
      </motion.div>
    </div>
  );
}

function SlideTakeaway() {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-20">
      <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-3xl tracking-wide text-foreground leading-tight mb-8"
      >
        It&apos;s not about the model.
      </motion.h1>

      <div className="space-y-5 max-w-2xl">
        <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="text-muted-foreground text-lg leading-relaxed"
        >
          Everyone has access to GPT-4, Claude, Gemini. Same starting line.
        </motion.p>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-muted-foreground text-lg leading-relaxed"
        >
          The real work is everything around it. How you write the system prompt. How you design the tools. How you connect it to your enterprise systems. How you evaluate and iterate.
        </motion.p>

        <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="text-muted-foreground text-lg leading-relaxed"
        >
          Building great agents is a craft. Prompt engineering, tool design, eval loops, and doing it over and over until the system behaves the way it should.
        </motion.p>

        <motion.p custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="text-foreground text-lg leading-relaxed"
        >
          That&apos;s what this playground is for.
        </motion.p>
      </div>
    </div>
  );
}

const slides = [SlidePlatform, SlideWhyImages, SlideWhyText, SlideHarness, SlideHarnessLego, SlideEvals, SlideTakeaway];

/* ──────────────────────── Main Component ──────────────────────── */

interface InfoSlideshowProps {
  open: boolean;
  onClose: () => void;
}

export function InfoSlideshow({ open, onClose }: InfoSlideshowProps) {
  const [[current, direction], setCurrent] = useState([0, 0]);

  const paginate = useCallback((dir: number) => {
    setCurrent(([prev]) => {
      const next = prev + dir;
      if (next < 0 || next >= TOTAL_SLIDES) return [prev, 0];
      return [next, dir];
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setCurrent([0, 0]);
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, paginate, onClose]);

  const CurrentSlide = slides[current];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={onClose}
          />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-5 left-5 z-10 text-xs font-typewriter text-muted-foreground/40 tracking-widest">
            {String(current + 1).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
          </div>

          <div className="relative z-[1] w-full max-w-4xl h-[80vh] mx-6 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                <CurrentSlide />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-6">
            <button
              onClick={() => paginate(-1)}
              disabled={current === 0}
              className="p-2.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/40 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent([i, i > current ? 1 : -1])}
                  className="group p-1"
                >
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/25 group-hover:bg-muted-foreground/50"
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              disabled={current === TOTAL_SLIDES - 1}
              className="p-2.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/40 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
