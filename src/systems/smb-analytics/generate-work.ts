import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const OUT = path.join(process.cwd(), "public");

function b64(file: string) {
  return `data:image/png;base64,${fs.readFileSync(path.join(OUT, file)).toString("base64")}`;
}

const ssSelector = b64("ss-agent-selector.png");
const ssSmb = b64("ss-smb-advisor-chat.png");
const ssInterrogation = b64("ss-interrogation-chat.png");
const ssObsTools = b64("ss-observability-tools.png");

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 48px 56px 32px 56px; }

  body {
    font-family: 'Public Sans', sans-serif;
    font-size: 12.5px;
    line-height: 1.5;
    color: #1e293b;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }

  h2 {
    font-family: 'Public Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #991b1b;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 2px;
    margin-top: 0;
    margin-bottom: 10px;
  }

  .phil-list {
    list-style: none;
    padding: 0;
    margin-bottom: 0;
  }
  .phil-list li {
    display: flex;
    gap: 12px;
    align-items: baseline;
    margin-bottom: 14px;
  }
  .phil-list .num {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    min-width: 18px;
    font-variant-numeric: tabular-nums;
  }
  .phil-list .title {
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    display: block;
    margin-bottom: 1px;
  }
  .phil-list .desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
    display: block;
  }

  .exp-section {
    margin-top: 28px;
  }

  .exp-row {
    display: flex;
    gap: 24px;
    margin-top: 12px;
    margin-bottom: 36px;
    align-items: flex-start;
    page-break-inside: avoid;
  }
  .exp-text {
    flex: 0 0 44%;
    min-width: 0;
  }
  .exp-img {
    flex: 1;
    min-width: 0;
  }
  .exp-title {
    font-weight: 700;
    font-size: 12.5px;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .exp-desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
    margin-bottom: 6px;
  }
  .exp-desc b { font-weight: 600; color: #0f172a; }
  .exp-bullets {
    list-style: none;
    padding: 0;
  }
  .exp-bullets li {
    font-size: 12px;
    color: #334155;
    line-height: 1.45;
    padding-left: 12px;
    position: relative;
    margin-bottom: 3px;
  }
  .exp-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #94a3b8;
  }
  .exp-bullets li b { font-weight: 600; color: #0f172a; }

  .ss-wrap {
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  }
  .ss-wrap img { width: 100%; display: block; }
  .ss-caption {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 4px;
    line-height: 1.4;
  }
</style>
</head>
<body>

<h2>How I Think About Building Products</h2>

<ol class="phil-list">
  <li>
    <span class="num">01</span>
    <div>
      <span class="title">Start with the problem, not the solution</span>
      <span class="desc">I spend more time understanding what's broken than deciding what to build.</span>
    </div>
  </li>
  <li>
    <span class="num">02</span>
    <div>
      <span class="title">Pace matters more than people think</span>
      <span class="desc">I'd rather get something out by Friday and learn from it than plan for a month.</span>
    </div>
  </li>
  <li>
    <span class="num">03</span>
    <div>
      <span class="title">The best feature is often no feature</span>
      <span class="desc">If I'm writing a help doc for it, something's wrong with the design.</span>
    </div>
  </li>
  <li>
    <span class="num">04</span>
    <div>
      <span class="title">Taste matters. Design matters more than we think.</span>
      <span class="desc">I care about spacing, copy, and flow. Products that feel right get adopted.</span>
    </div>
  </li>
  <li>
    <span class="num">05</span>
    <div>
      <span class="title">Talk to users every week, not through dashboards</span>
      <span class="desc">I learn more from one user call than a week of looking at charts.</span>
    </div>
  </li>
  <li>
    <span class="num">06</span>
    <div>
      <span class="title">Own the last mile</span>
      <span class="desc">I spend the extra hour on the edge case, the error state, the empty screen. That's what makes it complete.</span>
    </div>
  </li>
</ol>

<div class="exp-section">
  <h2>My Experiments with AI</h2>

  <div class="exp-row">
    <div class="exp-text">
      <div class="exp-title">Agent Fleet</div>
      <div class="exp-desc">
        The infra layer I built from scratch. Front-end, back-end, everything needed to spin up a new agent without rebuilding the plumbing.
      </div>
      <ul class="exp-bullets">
        <li>Shared runtime handling SSE streaming, tool execution loops, and multi-agent handoffs</li>
        <li>Eval framework with Braintrust and LangFuse: automated datasets, LLM-as-judge scoring on accuracy, tone, and tool usage, regression testing before any prompt change ships</li>
        <li>Each agent gets its own system prompt, tools, and personality. The platform handles the rest.</li>
      </ul>
    </div>
    <div class="exp-img">
      <div class="ss-wrap"><img src="${ssSelector}" /></div>
      <div class="ss-caption">The platform. Each agent has its own tools and personality.</div>
    </div>
  </div>

  <div class="exp-row">
    <div class="exp-text">
      <div class="exp-title">Enterprise Analytics Co-Pilot</div>
      <div class="exp-desc">
        An AI advisor that knows the business numbers and suggests what to do next. Not a dashboard, a conversation.
      </div>
      <ul class="exp-bullets">
        <li><b>15+ custom tools</b> querying live data: revenue, margins, receivables, inventory, customer activity, price trends</li>
        <li><b>RAG pipeline</b> (OpenAI embeddings + Pinecone) cross-referencing financials with business policies and enterprise knowledge</li>
        <li><b>MCP integrations</b> pushing insights directly to Slack, Notion, and external tools without leaving the conversation</li>
        <li>Reasons across dimensions, fires <b>parallel tool calls</b>, and synthesizes one cross-functional answer</li>
        <li><b>Eval suite</b> with 25+ test cases scoring on accuracy, tone, tool usage, and restraint. Braintrust + LangFuse integrated.</li>
      </ul>
    </div>
    <div class="exp-img">
      <div class="ss-wrap"><img src="${ssSmb}" /></div>
      <div class="ss-caption">Parallel tool calls, one synthesized response with real numbers.</div>
    </div>
  </div>

  <div class="exp-row">
    <div class="exp-text">
      <div class="exp-title">The Interrogation Room</div>
      <div class="exp-desc">
        Multi-agent system. Each cop has its own system prompt, personality, and tools.
      </div>
      <ul class="exp-bullets">
        <li>Good Cop builds rapport (empathy, open questions, deals). Bad Cop applies pressure (confrontation, urgency, victim impact). Different <b>system prompts</b> drive completely different behaviors.</li>
        <li><b>12 tools with role-based access</b>: each agent can investigate, verify claims, apply pressure, or offer deals depending on their role</li>
        <li><b>RAG-powered fact checking</b>: agents cross-reference suspect claims against case files in real time</li>
        <li><b>Mid-conversation handoffs</b> with shared state: when one cop hits a wall, the other picks up with full context</li>
      </ul>
    </div>
    <div class="exp-img">
      <div class="ss-wrap"><img src="${ssInterrogation}" /></div>
      <div class="ss-caption">The agent thinks, verifies the alibi (tool call), then responds.</div>
    </div>
  </div>

  <div class="exp-row" style="margin-bottom:0">
    <div class="exp-text">
      <div class="exp-title">LLM Observability</div>
      <div class="exp-desc">
        Built into every agent. If I can't see why the agent did what it did, I can't improve it.
      </div>
      <ul class="exp-bullets">
        <li><b>LangFuse integration</b> tracking every generation with session, system, and agent tags</li>
        <li>Full <b>tool call traces</b>: inputs, outputs, latency per call, all inspectable</li>
        <li><b>Token economics</b>: system prompt, tool definitions, RAG context, conversation history, cost per turn</li>
        <li>RAG chunk inspection, MCP server status, and the complete prompt visible on every turn</li>
      </ul>
    </div>
    <div class="exp-img">
      <div class="ss-wrap"><img src="${ssObsTools}" /></div>
      <div class="ss-caption">Tool traces with full JSON payloads, latency, and token breakdown.</div>
    </div>
  </div>
</div>

</body>
</html>`;

async function main() {
  console.log("Generating How I Build PDF...\n");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const outputPath = path.join(process.cwd(), "public", "aishwarya-how-i-build.pdf");

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "48px", bottom: "32px", left: "56px", right: "56px" },
  });

  await browser.close();
  console.log("PDF saved to: " + outputPath);
}

main().catch(console.error);
