import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const OUT_DIR = path.join(process.cwd(), "public");

function b64(filename: string): string {
  const buf = fs.readFileSync(path.join(OUT_DIR, filename));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const ssInterrogation = b64("ss-interrogation-chat.png");
const ssSmb = b64("ss-smb-advisor-chat.png");
const ssObsTools = b64("ss-observability-tools.png");
const ssObsPricing = b64("ss-observability-pricing.png");

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 52px 68px 44px 68px; }

  html, body {
    font-family: 'Public Sans', -apple-system, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    color: #1a1a1a;
    background: #ffffff;
    -webkit-font-smoothing: antialiased;
  }

  .header {
    margin-bottom: 36px;
  }
  .header h1 {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #0a0a0a;
    text-transform: uppercase;
    line-height: 1;
    margin-bottom: 7px;
  }
  .header-line {
    height: 2px;
    background: #0a0a0a;
    margin-bottom: 8px;
  }
  .header-sub {
    font-size: 9.5px;
    font-weight: 400;
    color: #888;
  }

  .question {
    font-size: 10.5px;
    font-weight: 700;
    color: #c0392b;
    margin-top: 28px;
    margin-bottom: 8px;
    line-height: 1.45;
  }
  .question:first-of-type { margin-top: 0; }

  .answer {
    font-size: 9.8px;
    line-height: 1.72;
    color: #2a2a2a;
    margin-bottom: 0;
  }
  .answer + .answer { margin-top: 8px; }

  .b { font-weight: 700; color: #0a0a0a; }

  .sep {
    border: none;
    border-top: 1px solid #e8e8e8;
    margin: 28px 0 0 0;
  }

  .page-break { page-break-before: always; }

  .footer {
    margin-top: 44px;
    padding-top: 10px;
    border-top: 2px solid #0a0a0a;
    font-size: 8px;
    color: #aaa;
    display: flex;
    justify-content: space-between;
  }

  /* ── Screenshot sections ── */
  .ss-header {
    margin-bottom: 16px;
  }
  .ss-header h2 {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #c0392b;
    margin-bottom: 6px;
  }
  .ss-header p {
    font-size: 9.5px;
    line-height: 1.65;
    color: #555;
    max-width: 88%;
  }
  .ss-img-wrap {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 16px rgba(0,0,0,0.04);
    margin-bottom: 28px;
  }
  .ss-img-wrap img {
    width: 100%;
    display: block;
  }
</style>
</head>
<body>

<!-- ═══════════════ PAGE 1 ═══════════════ -->

<div class="header">
  <h1>Aishwarya AR</h1>
  <div class="header-line"></div>
  <div class="header-sub">Group PM, Vyapar &nbsp;·&nbsp; IIT Madras &nbsp;·&nbsp; aishy.savi@gmail.com &nbsp;·&nbsp; +91-9884299621</div>
</div>

<p class="question">How do you use AI in your day-to-day work as a Product Manager?</p>

<p class="answer">It's embedded in almost everything I do now. At the most basic level, I use Cursor as my primary IDE, not as a novelty, but as a genuine building environment. I prototype features, write backend logic, build full-stack apps, and generate production-quality code directly. When I need to spec something, I'll often just build the first version instead of writing a document about it. It's faster, and you end up solving real design problems that a PRD never surfaces.</p>

<p class="answer">Beyond personal productivity, I've been building <span class="b">AI-native product experiences</span> at Vyapar: LLM-based call analytics that improved intent capture by 20% and processed 5x higher volume, generative AI for automated catalog creation that cut merchant onboarding time by 60%, and a business copilot that delivers proactive insights and anomaly detection to merchant partners.</p>

<hr class="sep">

<p class="question">What's your comfort level with the actual technical stack behind AI products: models, agents, RAG, evals?</p>

<p class="answer">Very high, and it's not theoretical. I've <span class="b">personally built and shipped agent systems</span> that use OpenAI function-calling with 15+ custom tools, RAG pipelines with vector embeddings and Pinecone, multi-agent orchestration with handoffs and shared state machines, MCP server integrations (Google Sheets, Notion, Slack), and eval frameworks using Braintrust with automated dataset generation and multi-dimensional scoring.</p>

<p class="answer">I understand the full stack, from how token costs compound across multi-turn conversations, to why you need similarity thresholds and metadata filtering on your RAG retrievals, to why an agent's prompt architecture matters more than the model you pick. When engineers discuss context windows or tool routing, I'm not learning on the fly. I've built these systems myself.</p>

<hr class="sep">

<p class="question">How do you think about building AI agents specifically: what separates a good agent from a chatbot?</p>

<p class="answer">Most AI products are chatbots with a system prompt. An agent is fundamentally different: it <span class="b">acts</span>. It calls tools, retrieves context, makes decisions about what to do next, and adapts based on what it finds. The design challenge isn't "what should the AI say," it's "what should the AI <em>do</em>, in what order, with what information, and when should it stop."</p>

<p class="answer">Concretely, that means: designing tool schemas that give the model the right capabilities without overwhelming it. Writing prompts that encode business logic, not just personality. Building state machines that let multiple agents collaborate without losing coherence. And critically, making every decision the agent makes <span class="b">inspectable</span>. I've built observability systems that surface token usage, tool call traces, RAG chunks retrieved, and full prompt visibility on every single turn. If you can't see why your agent did what it did, you can't improve it.</p>

<hr class="sep">

<p class="question">Can you walk through how you approach prompt engineering: not the basics, but at a systems level?</p>

<p class="answer">Prompt engineering at the systems level is really about <span class="b">information architecture for an LLM</span>. You're deciding what the model knows, when it knows it, and how that knowledge is structured.</p>

<p class="answer">For example, I built a business advisor agent that needed to serve electronics retailers, restaurants, and apparel businesses, each with completely different mental models. The prompt doesn't just say "be helpful." It encodes: how to mirror the user's language (Hindi, Hinglish, English) by reading their last 2-3 messages. What to do on session start vs. after engagement. That tool results come back in English but the response must match the user's language. That the agent must give one insight per message, never a wall of text. That follow-ups must add new information, never repeat prior advice.</p>

<p class="answer">That's not a prompt, it's a <span class="b">behavioral specification</span> that happens to be written in natural language. Getting this right is the difference between a demo and a product.</p>

<div class="page-break"></div>

<!-- ═══════════════ PAGE 2 ═══════════════ -->

<p class="question">What's your take on evals for AI products? How do you measure quality?</p>

<p class="answer">Evals are the most underinvested area in AI product development. Most teams ship on vibes ("it feels better") and then get surprised when the model regresses after a prompt change. I've built eval pipelines using <span class="b">Braintrust</span> that automate dataset generation, score responses across multiple dimensions (factual accuracy, tone, tool usage correctness, response length), and run regression tests before any prompt or model change goes live.</p>

<p class="answer">The key insight is that AI evals are a <span class="b">product design problem</span>, not just an engineering one. You need to decide: what does "good" look like for this agent? Is it accuracy? Is it empathy? Is it knowing when <em>not</em> to use a tool? Those are product decisions that determine your scoring rubric. And then you need enough representative examples: edge cases, adversarial inputs, multi-turn conversations, to actually trust the scores. I think the PM who owns the eval framework has more leverage over AI product quality than the one who owns the prompt.</p>

<hr class="sep">

<p class="question">How do you think about MCP and tool-use ecosystems for agents?</p>

<p class="answer">MCP (Model Context Protocol) is the most important infrastructure shift happening in AI right now. It standardizes how agents connect to external services. Your agent doesn't need custom integrations for every tool, it discovers capabilities at runtime through a shared protocol. I've integrated MCP servers for <span class="b">Google Sheets, Notion, and Slack</span> into agent systems, where the agent connects via stdio transport and discovers available tools dynamically.</p>

<p class="answer">For product thinking, this matters because it changes the build-vs-integrate calculus entirely. Instead of building every capability into your agent, you compose them from MCP servers. Your agent becomes an orchestrator over an ecosystem of tools. The PM's job shifts from speccing individual features to <span class="b">designing the orchestration layer</span>: which tools should the agent have access to, in what contexts, with what guardrails.</p>

<hr class="sep">

<p class="question">What's the one thing that separates you from other PMs working on AI?</p>

<p class="answer">I don't delegate the understanding. Most PMs learn AI concepts at the abstraction layer: they know what RAG is, they know what function-calling is, they can have the conversation. I <span class="b">build the systems</span>. I've written the tool schemas, designed the embedding pipelines, debugged the token overflow issues, tuned the similarity thresholds, and shipped the streaming UX. When I make a product decision about an AI feature, it's grounded in having built it myself, not from a second-hand understanding of an engineer's explanation.</p>

<p class="answer">That doesn't mean I think PMs should be engineers. It means the best AI PMs right now are the ones who've <span class="b">closed the gap</span> between what they can imagine and what they can validate. I can go from an idea to a working prototype in Cursor in a day. That speed isn't about coding, it's about having the judgment to know what to build, how the pieces fit, and where the real product risk is. And that only comes from building.</p>


<!-- ═══════════════ PAGE 3 — ENTERPRISE INTELLIGENCE ═══════════════ -->

<div class="page-break"></div>

<div class="ss-header">
  <h2>Enterprise Intelligence</h2>
  <p>An AI business advisor that cross-references live transaction data with RAG-retrieved policies. The agent receives a broad question, reasons through it (5.1s), orchestrates <span class="b">three parallel tool calls</span> (revenue, margins, receivables) and synthesizes a single opinionated response with ₹ figures and a concrete action.</p>
</div>

<div class="ss-img-wrap">
  <img src="${ssSmb}" />
</div>

<div class="ss-header">
  <h2>The Interrogation Room</h2>
  <p>A multi-agent Good Cop / Bad Cop system. Detective Goody opens with empathy, the suspect claims innocence, and the agent's expanded thought process shows the full pipeline: <span class="b">analyze message → verify alibi (Tool call) → compose response</span>. The "Verifying alibi details" badge confirms the tool was invoked.</p>
</div>

<div class="ss-img-wrap">
  <img src="${ssInterrogation}" />
</div>


<!-- ═══════════════ PAGE 4 — OBSERVABILITY ═══════════════ -->

<div class="page-break"></div>

<div class="ss-header">
  <h2>LLM Observability: Tool Traces</h2>
  <p>Every tool call is fully inspectable. Here the agent made <span class="b">two successive calls</span>: <span class="b">get_revenue_summary</span> (105ms) and <span class="b">get_margin_analysis</span> (187ms), with input arguments and full JSON return values visible. The LLM Call panel shows 10,303 prompt tokens and 91 completion tokens.</p>
</div>

<div class="ss-img-wrap">
  <img src="${ssObsTools}" />
</div>

<div class="ss-header">
  <h2>LLM Observability: Token Economics</h2>
  <p>Per-turn breakdown of where context budget goes: base system prompt (23%), tool definitions (87% of prompt tokens), dynamic context, RAG injection, conversation history, and output. Total: 22,200 tokens at ~$0.003/turn. Context window: 17.3% of 128K.</p>
</div>

<div class="ss-img-wrap">
  <img src="${ssObsPricing}" />
</div>

<div class="footer">
  <span>Aishwarya AR</span>
  <span>March 2026</span>
</div>

</body>
</html>`;

async function main() {
  console.log("Generating AI PM Case Study PDF...\n");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const outputPath = path.join(process.cwd(), "public", "aishwarya-ai-pm-case-study.pdf");

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "52px", bottom: "44px", left: "68px", right: "68px" },
  });

  await browser.close();

  console.log(`PDF saved to: ${outputPath}`);
}

main().catch(console.error);
