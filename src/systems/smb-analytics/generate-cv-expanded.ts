import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const photoBuf = fs.readFileSync(path.join(process.cwd(), "public", "aishwarya-photo.png"));
const photoB64 = `data:image/png;base64,${photoBuf.toString("base64")}`;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }

  body {
    font-family: 'Public Sans', sans-serif;
    font-size: 12.5px;
    line-height: 1.5;
    color: #1e293b;
    padding: 40px 56px 20px;
    width: 210mm;
  }

  .header {
    border-bottom: 2px solid #0f172a;
    padding-bottom: 8px;
    margin-bottom: 8px;
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .header-photo-wrap {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    flex-shrink: 0;
    overflow: hidden;
  }
  .header-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 58%;
    transform: scale(1.6);
    transform-origin: 50% 55%;
  }
  .header-content {
    flex: 1;
    min-width: 0;
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .header h1 {
    font-family: 'Public Sans', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.2px;
    color: #991b1b;
    line-height: 1;
    text-transform: uppercase;
  }
  .header-contact {
    display: flex;
    gap: 10px;
    font-size: 11.5px;
    color: #0f172a;
    align-items: center;
  }
  .header-contact .sep { color: #cbd5e1; }
  .header-contact a {
    color: #0a66c2;
    text-decoration: underline;
  }
  .header-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 3px;
  }
  .header-meta .subtitle {
    font-size: 12.5px;
    font-weight: 500;
    color: #475569;
  }
  .header-meta .tagline {
    font-size: 11px;
    font-style: italic;
    color: #94a3b8;
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
    margin-top: 8px;
    margin-bottom: 3px;
  }

  .role-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1px;
    margin-top: 4px;
  }
  .role-title {
    font-weight: 700;
    font-size: 12.5px;
    color: #0f172a;
  }
  .role-date {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  ul {
    padding-left: 14px;
    margin: 2px 0 3px;
  }
  li {
    font-size: 12px;
    color: #334155;
    line-height: 1.45;
    margin-bottom: 1px;
  }
  li::marker { color: #94a3b8; }

  .b { font-weight: 600; color: #0f172a; }

  .section-label {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
    margin-top: 3px;
    margin-bottom: 1px;
  }
  .skills-row {
    font-size: 12px;
    color: #334155;
    line-height: 1.7;
  }
  .edu-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 12px;
  }
</style>
</head>
<body>

<!-- ─── HEADER ─── -->
<div class="header">
  <div class="header-photo-wrap"><img class="header-photo" src="${photoB64}" /></div>
  <div class="header-content">
    <div class="header-top">
      <h1>Aishwarya AR</h1>
      <div class="header-contact">
        +91-9884299621
        <span class="sep">·</span>
        <a href="mailto:aishy.savi@gmail.com">Email</a>
        <span class="sep">·</span>
        <a href="https://linkedin.com/in/">LinkedIn</a>
      </div>
    </div>
    <div class="header-meta">
      <div class="subtitle">Group Product Manager · Growth, Platform, AI · IIT Madras</div>
      <div class="tagline">A problem well put is half solved</div>
    </div>
  </div>
</div>

<!-- ─── AI / AGENT SYSTEMS ─── -->
<h2>AI &amp; Agent Systems</h2>

<div class="role-header">
  <span class="role-title">Agent Fleet: AI Agent Platform</span>
</div>
<ul>
  <li><span class="b">Built a full-stack platform from scratch</span> that runs multiple AI agents, each with its own tools, prompts, and behavior</li>
  <li>Shared runtime handling streaming, <span class="b">multi-agent handoffs</span>, and tool execution across all agent systems</li>
  <li>Real-time <span class="b">observability layer</span> with token costs, tool call traces with inputs/outputs, and full prompt visibility per turn</li>
</ul>

<div class="role-header">
  <span class="role-title">Enterprise Analytics Co-Pilot</span>
</div>
<ul>
  <li>AI advisor for small businesses that queries live transaction data via <span class="b">15+ tools</span> (revenue, margins, receivables, inventory)</li>
  <li><span class="b">RAG pipeline</span> (OpenAI embeddings + Pinecone) that cross-references business policies with real financial data</li>
  <li>Responds in Hindi, Hinglish, or English, <span class="b">matching the user's language</span> by reading their last few messages</li>
  <li><span class="b">Eval framework</span> (Braintrust) scoring accuracy, tone, and tool usage across test cases with run comparison</li>
</ul>

<div class="role-header">
  <span class="role-title">Interrogation Room: Multi-Agent Simulator</span>
</div>
<ul>
  <li>Good Cop / Bad Cop agents that <span class="b">hand off mid-conversation</span>, share state, and adapt to suspect behavior</li>
  <li><span class="b">12 specialized tools</span> with role-based access: verify alibi, check evidence, read victim impact, apply pressure</li>
  <li>Shared state machine with conditional routing and <span class="b">MCP server integration</span> for external tool discovery</li>
</ul>

<!-- ─── WORK EXPERIENCE ─── -->
<h2>Work Experience</h2>

<div class="role-header">
  <span class="role-title">Group Product Manager, Vyapar</span>
  <span class="role-date">Jul 2022 — Present</span>
</div>

<div class="section-label">Growth & Monetisation</div>
<ul>
  <li>Owned monetisation charter; launched tiered pricing + add-on revenue streams, boosting <span class="b">$1.0M ARR</span></li>
  <li>Led international expansion (Product + GTM + Pricing); scaled from zero to <span class="b">₹12Cr ARR</span></li>
  <li>Improved renewals by <span class="b">+10%</span> by redesigning plans, pricing tiers, and nudge sequences</li>
  <li>Steered iOS launch, boosting MAUs by <span class="b">30%</span> and diversifying platform beyond Android-only</li>
</ul>

<div class="section-label">B2C App: Purchase Funnel</div>
<ul>
  <li>Cart conversion up <span class="b">+12%</span> by fixing drop-offs, coupon failures, and communication breakpoints; GMV up <span class="b">$200K</span></li>
  <li>Category-to-cart conversion up <span class="b">+20%</span> through discoverability, search ranking, and catalog quality improvements</li>
  <li>Built event taxonomy + real-time dashboards for key journeys, enabling weekly experiment cadence</li>
</ul>

<div class="section-label">Gen AI</div>
<ul>
  <li>Automated online store catalog creation with generative AI; cut setup time by <span class="b">60%</span>, faster merchant onboarding</li>
  <li>LLM-based call analytics improving intent capture by <span class="b">20%</span> and processing <span class="b">5x</span> higher volume of customer signals</li>
  <li>Business Copilot for merchant partners delivering proactive updates, anomaly detection, and nudges</li>
</ul>

<div class="section-label">Platform</div>
<ul>
  <li>Built platform capabilities (pricing architecture, inventory, MaaS); reduced time-to-ship for dependent teams</li>
  <li>Vyapar Advanced: API infrastructure + multi-entity dashboards; DMS partnerships expanding addressable market</li>
</ul>

<div class="role-header">
  <span class="role-title">Product Manager, Pitstop</span>
  <span class="role-date">Jun 2020 — Jun 2022</span>
</div>
<ul>
  <li>Owned end-to-end car service marketplace; grew monthly transactions by <span class="b">3x</span> via supply and demand optimization</li>
  <li>Launched real-time job tracking and pricing transparency; NPS <span class="b">+18 points</span>, repeat rate <span class="b">+15%</span></li>
  <li>Built supply onboarding pipeline and garage quality scoring, expanding serviceable network by <span class="b">2x</span> in 6 months</li>
</ul>

<div class="role-header">
  <span class="role-title">Management Consultant, EY & Auctus</span>
  <span class="role-date">Jul 2017 — May 2020</span>
</div>
<ul>
  <li>Drove <span class="b">$300mn</span> infra projects in Amaravati with IAS officers; program management across ~40+ projects</li>
  <li>Commercial DD for <span class="b">$120mn</span> acquisition by Japanese MNC; M&A cross-sales for <span class="b">€90mn</span> revenue</li>
  <li>Proposals for World Bank, Asian Development Bank, and State Government tenders</li>
</ul>

<!-- ─── EDUCATION ─── -->
<h2>Education</h2>
<div class="edu-row">
  <span><span class="b">Civil Engineering, Dual Degree, IIT Madras</span> — CGPA: 9.1/10</span>
  <span class="role-date">2012 — 2017</span>
</div>

<!-- ─── SKILLS ─── -->
<h2>Skills</h2>
<div class="skills-row">
  <span class="b">Product:</span> Strategy · Pricing · Growth · Monetisation · International Expansion · Platform &nbsp;&nbsp;
  <span class="b">Technical:</span> SQL · RAG · Prompt Engineering · Evals · Agent Architecture &nbsp;&nbsp;
  <span class="b">Design:</span> Figma
</div>

</body>
</html>`;

async function main() {
  console.log("Generating CV...\n");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const outputPath = path.join(process.cwd(), "public", "aishwarya-cv-expanded.pdf");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });

  await browser.close();
  console.log(`CV saved to: ${outputPath}`);
}

main().catch(console.error);
