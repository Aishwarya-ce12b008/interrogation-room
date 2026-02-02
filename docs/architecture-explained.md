# Understanding LLMs, Context, and Knowledge Injection

> A complete guide to how your interrogation room actually works under the hood.

---

## 1. THE FUNDAMENTAL TRUTH: LLMs ARE STATELESS

### What "Stateless" Means

An LLM (like GPT-4) has **NO MEMORY between API calls**. 

Every single time you send a message, the LLM:
- Has no idea who you are
- Has no idea what was said before
- Starts completely fresh

```
YOUR MENTAL MODEL (Wrong):
┌─────────────────────────────────────────────────────────────┐
│ LLM Brain                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Memory:                                                 │ │
│ │ - User said they robbed a store                         │ │
│ │ - User seems remorseful                                 │ │
│ │ - I'm playing Goody right now                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

REALITY:
┌─────────────────────────────────────────────────────────────┐
│ LLM Brain                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                      (empty)                            │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### How "Memory" Actually Works

We FAKE memory by sending the **entire conversation history** with every request.

```
API Call #1:
┌─────────────────────────────────────────────────────────────┐
│ System: "You are Goody, a detective..."                     │
│ User: "I robbed a store"                                    │
└─────────────────────────────────────────────────────────────┘
→ LLM responds: "A robbery. Tell me what happened."

API Call #2:
┌─────────────────────────────────────────────────────────────┐
│ System: "You are Goody, a detective..."                     │
│ User: "I robbed a store"                      ← REPEATED    │
│ Assistant: "A robbery. Tell me what happened." ← REPEATED   │
│ User: "I needed money for rent"               ← NEW         │
└─────────────────────────────────────────────────────────────┘
→ LLM responds: "Money for rent. How much did you take?"

API Call #3:
┌─────────────────────────────────────────────────────────────┐
│ System: "You are Goody, a detective..."                     │
│ User: "I robbed a store"                      ← REPEATED    │
│ Assistant: "A robbery. Tell me what happened." ← REPEATED   │
│ User: "I needed money for rent"               ← REPEATED    │
│ Assistant: "Money for rent. How much..."      ← REPEATED    │
│ User: "About $500"                            ← NEW         │
└─────────────────────────────────────────────────────────────┘
→ LLM responds...
```

**Every API call includes EVERYTHING from the beginning.**

---

## 2. WHAT IS A "TOKEN"?

### Tokens = The LLM's Alphabet

LLMs don't read words — they read **tokens** (pieces of words).

```
"I robbed a convenience store" 
= ["I", " rob", "bed", " a", " convenience", " store"]
= 6 tokens

"Embezzlement" 
= ["Emb", "ezz", "lement"]
= 3 tokens

Roughly: 1 token ≈ 4 characters ≈ 0.75 words
```

### Why Tokens Matter

You pay for tokens. More tokens = more cost and slower responses.

```
Your current setup (approximate):
┌─────────────────────────────────────────────────────────────┐
│ System Prompt (Goody)        ~650 tokens                    │
│ Conversation History         ~100-1000 tokens (grows)       │
│ User Message                 ~10-50 tokens                  │
├─────────────────────────────────────────────────────────────┤
│ INPUT (what you send)        ~800-1700 tokens               │
│ OUTPUT (LLM response)        ~50-150 tokens                 │
├─────────────────────────────────────────────────────────────┤
│ TOTAL per request            ~900-1850 tokens               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. THE CONTEXT WINDOW

### What It Is

The **context window** is the maximum amount of text the LLM can "see" at once.

```
GPT-4o-mini: 128,000 tokens context window

Think of it like a window looking at a document:
┌─────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░┌─────────────────────────────────────────┐░░░░░░░░░░░ │
│ ░░░░░│  CONTEXT WINDOW                         │░░░░░░░░░░░ │
│ ░░░░░│  The LLM can only see what's            │░░░░░░░░░░░ │
│ ░░░░░│  inside this box.                       │░░░░░░░░░░░ │
│ ░░░░░│                                         │░░░░░░░░░░░ │
│ ░░░░░│  Everything else doesn't exist          │░░░░░░░░░░░ │
│ ░░░░░│  to the model.                          │░░░░░░░░░░░ │
│ ░░░░░└─────────────────────────────────────────┘░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────┘
```

### Your Rules Documents

```
Your knowledge base:
├── interrogation-rules.md    ~450 lines  ~3,000 tokens
├── crime-database.md         ~500 lines  ~4,000 tokens
├── detective-playbook.md     ~400 lines  ~3,000 tokens
├── verdict-templates.md      ~350 lines  ~2,500 tokens
└── legal-reference.md        ~400 lines  ~3,000 tokens
                              ──────────  ─────────────
                              ~2,100 lines ~15,500 tokens
```

**Problem:** If you put ALL of this in every request:
```
15,500 (all docs) + 650 (system prompt) + 1,000 (history) = 17,150 tokens

At $0.15 per 1M input tokens:
- Per request: $0.0026
- 100 requests: $0.26
- 1000 requests: $2.60
- Plus it's SLOW (more tokens = more processing time)
```

**And most of it is irrelevant to the current question!**

---

## 4. THREE APPROACHES TO USING YOUR KNOWLEDGE BASE

### APPROACH A: STUFF EVERYTHING IN (Naive)

```
Every API Call:
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT                                               │
│ ├── Base personality (Goody/Baddy)          ~500 tokens     │
│ ├── ALL interrogation rules                 ~3,000 tokens   │
│ ├── ALL crime database                      ~4,000 tokens   │
│ ├── ALL detective playbook                  ~3,000 tokens   │
│ ├── ALL verdict templates                   ~2,500 tokens   │
│ └── ALL legal reference                     ~3,000 tokens   │
│                                             ─────────────── │
│ SUBTOTAL:                                   ~16,000 tokens  │
│                                                             │
│ + Conversation History                      ~1,000 tokens   │
│ + User Message                              ~50 tokens      │
│                                             ─────────────── │
│ TOTAL INPUT:                                ~17,050 tokens  │
└─────────────────────────────────────────────────────────────┘

❌ PROBLEMS:
- Very expensive
- Slow responses
- Most content is irrelevant
- Token limit issues for long conversations
```

---

### APPROACH B: HYBRID INJECTION (What I Recommended)

**The Idea:** Only include relevant rules based on the current situation.

```
Step 1: Analyze the situation
┌─────────────────────────────────────────────────────────────┐
│ What crime? → Embezzlement                                  │
│ What phase? → Suspect is lying                              │
│ What's happening? → Need pressure tactics                   │
└─────────────────────────────────────────────────────────────┘

Step 2: Select relevant chunks
┌─────────────────────────────────────────────────────────────┐
│ ✓ Embezzlement section from crime-database.md               │
│ ✓ Baddy's pressure tactics from detective-playbook.md       │
│ ✓ Financial crime sentences from legal-reference.md         │
│ ✗ Robbery section (not relevant)                            │
│ ✗ Goody's soft tactics (not relevant right now)             │
│ ✗ Moral crimes section (not relevant)                       │
└─────────────────────────────────────────────────────────────┘

Step 3: Build the prompt with ONLY relevant content
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT                                               │
│ ├── Base Baddy personality                  ~500 tokens     │
│ ├── Embezzlement rules                      ~400 tokens     │
│ ├── Pressure tactics                        ~300 tokens     │
│ └── Financial crime sentences               ~200 tokens     │
│                                             ─────────────── │
│ SUBTOTAL:                                   ~1,400 tokens   │
│                                                             │
│ + Conversation History                      ~1,000 tokens   │
│ + User Message                              ~50 tokens      │
│                                             ─────────────── │
│ TOTAL INPUT:                                ~2,450 tokens   │
└─────────────────────────────────────────────────────────────┘

✅ BENEFITS:
- Much cheaper (2,450 vs 17,050 tokens = 85% reduction)
- Faster responses
- More focused context (LLM isn't distracted by irrelevant info)
- Room for longer conversations
```

**How the code works:**

```javascript
// In your API route:

async function buildPrompt(messages, crimeType, suspectBehavior) {
  let rules = BASE_DETECTIVE_PROMPT;
  
  // Add crime-specific rules
  if (crimeType === "embezzlement") {
    rules += EMBEZZLEMENT_RULES;  // From crime-database.md
    rules += FINANCIAL_CRIME_SENTENCES;  // From legal-reference.md
  } else if (crimeType === "robbery") {
    rules += ROBBERY_RULES;
    rules += VIOLENT_CRIME_SENTENCES;
  }
  
  // Add behavior-specific tactics
  if (suspectBehavior === "lying") {
    rules += PRESSURE_TACTICS;  // Baddy's playbook
    rules += EVIDENCE_BLUFF_TECHNIQUES;
  } else if (suspectBehavior === "breaking_down") {
    rules += SOFT_TACTICS;  // Goody's playbook
    rules += EMOTIONAL_SUPPORT_TECHNIQUES;
  }
  
  // Add end-state rules if relevant
  if (detectLawyerUp(messages)) {
    rules += LAWYER_UP_PROCEDURE;
    rules += LAWYER_UP_VERDICT;
  }
  
  return {
    systemPrompt: rules,
    messages: messages
  };
}
```

**The "injection" is simply string concatenation:**

```javascript
// This is all "injection" means:
const systemPrompt = `
${BASE_PERSONALITY}

## CURRENT CRIME: EMBEZZLEMENT
${EMBEZZLEMENT_RULES}

## RELEVANT TACTICS
${PRESSURE_TACTICS}

## LEGAL CONSEQUENCES
${FINANCIAL_SENTENCES}
`;
```

---

### APPROACH C: RAG (Retrieval Augmented Generation)

**The Idea:** Use AI to automatically find the most relevant chunks.

```
┌─────────────────────────────────────────────────────────────┐
│                     RAG ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────┘

SETUP PHASE (One Time):
━━━━━━━━━━━━━━━━━━━━━━━━

1. CHUNK your documents into pieces
   ┌──────────────────────────────────────────────────────────┐
   │ crime-database.md                                        │
   │ ┌────────────┐ ┌────────────┐ ┌────────────┐            │
   │ │ Chunk 1:   │ │ Chunk 2:   │ │ Chunk 3:   │            │
   │ │ Robbery    │ │ Embezzle-  │ │ Hit & Run  │  ...       │
   │ │ section    │ │ ment       │ │ section    │            │
   │ └────────────┘ └────────────┘ └────────────┘            │
   └──────────────────────────────────────────────────────────┘

2. EMBED each chunk (convert text to numbers/vectors)
   ┌──────────────────────────────────────────────────────────┐
   │ "Robbery is taking property by force..."                 │
   │                    ↓                                     │
   │ Embedding API (e.g., OpenAI text-embedding-3-small)      │
   │                    ↓                                     │
   │ [0.023, -0.145, 0.892, 0.234, -0.567, ...]              │
   │ (1536 numbers that represent the "meaning")              │
   └──────────────────────────────────────────────────────────┘

3. STORE in a vector database
   ┌──────────────────────────────────────────────────────────┐
   │ Vector Database (Pinecone, Supabase, Chroma, etc.)       │
   │ ┌──────────────────────────────────────────────────────┐ │
   │ │ ID: "robbery"     Vector: [0.023, -0.145, ...]       │ │
   │ │ ID: "embezzle"    Vector: [0.156, 0.234, ...]        │ │
   │ │ ID: "hit_run"     Vector: [-0.089, 0.445, ...]       │ │
   │ │ ...                                                  │ │
   │ └──────────────────────────────────────────────────────┘ │
   └──────────────────────────────────────────────────────────┘


RUNTIME (Every Request):
━━━━━━━━━━━━━━━━━━━━━━━━

1. User sends message: "I stole $50,000 from my company"

2. EMBED the query
   ┌──────────────────────────────────────────────────────────┐
   │ "stole $50,000 from company"                             │
   │                    ↓                                     │
   │ [0.145, 0.267, 0.891, ...]                               │
   └──────────────────────────────────────────────────────────┘

3. SEARCH vector database for similar vectors
   ┌──────────────────────────────────────────────────────────┐
   │ Query Vector: [0.145, 0.267, 0.891, ...]                 │
   │                                                          │
   │ Find closest matches:                                    │
   │ 1. Embezzlement chunk (similarity: 0.94) ← BEST MATCH   │
   │ 2. Financial fraud chunk (similarity: 0.87)              │
   │ 3. Theft chunk (similarity: 0.82)                        │
   │ 4. Robbery chunk (similarity: 0.45) ← NOT RELEVANT      │
   └──────────────────────────────────────────────────────────┘

4. RETRIEVE the top chunks
   ┌──────────────────────────────────────────────────────────┐
   │ Retrieved:                                               │
   │ - Embezzlement definition, questions, consequences       │
   │ - Financial crime sentences                              │
   └──────────────────────────────────────────────────────────┘

5. AUGMENT the prompt
   ┌──────────────────────────────────────────────────────────┐
   │ System: "You are Goody..."                               │
   │                                                          │
   │ ## RELEVANT CONTEXT (automatically retrieved):           │
   │ [Embezzlement rules inserted here]                       │
   │ [Financial sentences inserted here]                      │
   │                                                          │
   │ User: "I stole $50,000 from my company"                  │
   └──────────────────────────────────────────────────────────┘

6. GENERATE response using augmented context
```

**RAG requires:**
- Embedding API calls (extra cost, extra latency)
- Vector database (Pinecone, Supabase, Weaviate, etc.)
- More complex code
- Chunking strategy decisions

---

## 5. COMPARISON TABLE

| Aspect | Naive (All) | Hybrid | RAG |
|--------|-------------|--------|-----|
| **Tokens per request** | ~17,000 | ~2,500 | ~2,500 |
| **Cost** | High | Low | Low + embedding costs |
| **Latency** | Slow | Fast | Medium (retrieval step) |
| **Accuracy of context** | Poor (diluted) | Good | Very good |
| **Setup complexity** | None | Medium | High |
| **Infrastructure** | None | None | Vector DB needed |
| **Maintenance** | Easy | Medium | Medium |
| **Scales to large docs** | No | Somewhat | Yes |

---

## 6. MY RECOMMENDATION FOR YOUR PROJECT

**Use Hybrid Injection** because:

1. **Your knowledge base is small** (~2,100 lines)
   - RAG shines with 10,000+ lines of documentation
   - For your size, simple if/else logic works great

2. **Your categories are clear**
   - Crime types are distinct
   - Phases are identifiable
   - Easy to write rules for what to include

3. **No extra infrastructure**
   - No vector database to set up
   - No embedding API costs
   - No additional latency

4. **Easy to debug**
   - You can see exactly what rules are being included
   - Simple to adjust and test

5. **Can migrate to RAG later**
   - If you add 50 more crimes and complex scenarios
   - The document structure already supports chunking

---

## 7. WHAT HYBRID INJECTION LOOKS LIKE IN CODE

```javascript
// src/lib/knowledge/index.ts

// Import chunks from your documents
import { ROBBERY_RULES, EMBEZZLEMENT_RULES, ... } from './crimes';
import { GOODY_TACTICS, BADDY_TACTICS, ... } from './tactics';
import { SENTENCES } from './legal';
import { VERDICTS } from './verdicts';

export function getRelevantContext(
  crimeType: string,
  currentAgent: 'goody' | 'baddy',
  suspectBehavior: 'cooperative' | 'evasive' | 'breaking_down' | 'hostile',
  isEndState: boolean
) {
  let context = '';
  
  // Crime-specific rules
  switch (crimeType) {
    case 'robbery':
      context += ROBBERY_RULES;
      context += SENTENCES.ROBBERY;
      break;
    case 'embezzlement':
      context += EMBEZZLEMENT_RULES;
      context += SENTENCES.FINANCIAL;
      break;
    // ... etc
  }
  
  // Agent-specific tactics based on suspect behavior
  if (currentAgent === 'goody') {
    if (suspectBehavior === 'cooperative') {
      context += GOODY_TACTICS.SOFT_REDIRECT;
      context += GOODY_TACTICS.STORY_BUILDER;
    } else if (suspectBehavior === 'breaking_down') {
      context += GOODY_TACTICS.EMOTIONAL_SUPPORT;
    }
  } else {
    if (suspectBehavior === 'evasive') {
      context += BADDY_TACTICS.EVIDENCE_BLUFF;
      context += BADDY_TACTICS.CONSEQUENCE_STACK;
    } else if (suspectBehavior === 'hostile') {
      context += BADDY_TACTICS.ULTIMATUM;
      context += BADDY_TACTICS.TABLE_SLAM;
    }
  }
  
  // End state rules
  if (isEndState) {
    context += VERDICTS[crimeType];
  }
  
  return context;
}

// In your API route:
const relevantContext = getRelevantContext(
  detectedCrimeType,
  currentAgent,
  analyzeSuspectBehavior(messages),
  detectEndState(lastMessage)
);

const systemPrompt = `
${BASE_AGENT_PROMPT}

## RELEVANT RULES FOR THIS SITUATION
${relevantContext}
`;
```

---

## 8. VISUAL SUMMARY

```
YOUR CURRENT FLOW:
━━━━━━━━━━━━━━━━━━

User types message
       ↓
┌──────────────────┐
│ Your Frontend    │
│ (chat-interface) │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Your API Route   │ ← This is where injection happens
│ (route.ts)       │
└────────┬─────────┘
         ↓
    Build prompt:
    ┌─────────────────────────────────────┐
    │ System Prompt (hardcoded now)       │
    │ + Conversation History              │
    │ + User Message                      │
    └─────────────────────────────────────┘
         ↓
┌──────────────────┐
│ OpenAI API       │
└────────┬─────────┘
         ↓
    Response streamed back


WITH HYBRID INJECTION:
━━━━━━━━━━━━━━━━━━━━━━

User types message
       ↓
┌──────────────────┐
│ Your Frontend    │
│ (chat-interface) │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Your API Route   │
│ (route.ts)       │
└────────┬─────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ ANALYZE SITUATION                   │
    │ - What crime type?                  │
    │ - What's the suspect doing?         │
    │ - Is this an end state?             │
    └────────────────┬────────────────────┘
                     ↓
    ┌─────────────────────────────────────┐
    │ SELECT RELEVANT CHUNKS              │
    │ from your docs folder               │
    │                                     │
    │  docs/crime-database.md             │
    │  docs/detective-playbook.md    ───→ Only grab
    │  docs/legal-reference.md            what's needed
    │  docs/verdict-templates.md          │
    └────────────────┬────────────────────┘
                     ↓
    ┌─────────────────────────────────────┐
    │ BUILD DYNAMIC PROMPT                │
    │                                     │
    │ Base Prompt + Selected Chunks       │
    │ + Conversation History              │
    │ + User Message                      │
    └────────────────┬────────────────────┘
                     ↓
┌──────────────────┐
│ OpenAI API       │
└────────┬─────────┘
         ↓
    Response streamed back
```

---

---

## 9. RAG IMPLEMENTATION GUIDE

### File Formats for RAG

**You DON'T need PDFs.** Plain text/markdown is actually better:
- Cleaner text (no PDF parsing artifacts)
- Easier to chunk precisely
- Direct control over content

Your `.md` files are perfect as-is.

---

### RAG Flow: Every Single Turn

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         RAG FLOW: ONE CONVERSATION TURN                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

USER TYPES: "I've been embezzling money from my company for 2 years"
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: FRONTEND SENDS TO YOUR API                                          │
│                                                                             │
│ POST /api/chat                                                              │
│ {                                                                           │
│   messages: [...conversation history...],                                   │
│   activeAgent: "goody",                                                     │
│   userMessage: "I've been embezzling money from my company for 2 years"     │
│ }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CREATE EMBEDDING OF USER MESSAGE                                    │
│                                                                             │
│ Call OpenAI Embeddings API:                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ POST https://api.openai.com/v1/embeddings                               │ │
│ │ {                                                                       │ │
│ │   model: "text-embedding-3-small",                                      │ │
│ │   input: "I've been embezzling money from my company for 2 years"       │ │
│ │ }                                                                       │ │
│ │                                                                         │ │
│ │ Response: [0.0231, -0.0892, 0.1456, ..., 0.0673]  (1536 numbers)        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Cost: ~$0.00002 per embedding (negligible)                                  │
│ Latency: ~100-200ms                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: SEARCH VECTOR DATABASE FOR SIMILAR CHUNKS                           │
│                                                                             │
│ Query your vector DB (Pinecone/Supabase/etc.):                              │
│ "Find the 5 chunks most similar to this embedding"                          │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ RESULTS (ranked by similarity):                                         │ │
│ │                                                                         │ │
│ │ 1. chunk_embezzlement_definition     similarity: 0.94  ✓ USE           │ │
│ │ 2. chunk_financial_crime_sentences   similarity: 0.89  ✓ USE           │ │
│ │ 3. chunk_embezzlement_questions      similarity: 0.87  ✓ USE           │ │
│ │ 4. chunk_goody_soft_tactics          similarity: 0.72  ✓ USE           │ │
│ │ 5. chunk_tier1_overview              similarity: 0.68  ✓ USE           │ │
│ │ 6. chunk_robbery_definition          similarity: 0.34  ✗ TOO LOW       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Latency: ~50-100ms                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: RETRIEVE THE ACTUAL TEXT OF THOSE CHUNKS                            │
│                                                                             │
│ From your stored chunks, get the text content:                              │
│                                                                             │
│ Retrieved Context (~800 tokens total):                                      │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ## EMBEZZLEMENT                                                         │ │
│ │ Definition: Theft of assets by a person in a position of trust...       │ │
│ │                                                                         │ │
│ │ Key Questions to Ask:                                                   │ │
│ │ - How long has this been going on?                                      │ │
│ │ - What's the total amount?                                              │ │
│ │ - How did you do it without getting caught?                             │ │
│ │ ...                                                                     │ │
│ │                                                                         │ │
│ │ Legal Consequences:                                                     │ │
│ │ | Amount | Classification | Prison Time |                               │ │
│ │ | $50k-$250k | Felony | 3-10 years |                                    │ │
│ │ ...                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: BUILD THE AUGMENTED PROMPT                                          │
│                                                                             │
│ Combine: Base Prompt + Retrieved Context + Conversation + User Message      │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SYSTEM PROMPT:                                                          │ │
│ │ "You are Goody, the good cop detective..."  (~500 tokens)               │ │
│ │                                                                         │ │
│ │ ## RELEVANT CONTEXT FOR THIS SITUATION:                                 │ │
│ │ [Retrieved chunks inserted here]             (~800 tokens)              │ │
│ │                                                                         │ │
│ │ CONVERSATION HISTORY:                                                   │ │
│ │ [Previous messages]                          (~500 tokens)              │ │
│ │                                                                         │ │
│ │ USER MESSAGE:                                                           │ │
│ │ "I've been embezzling money..."              (~20 tokens)               │ │
│ │                                                                         │ │
│ │ TOTAL INPUT: ~1,820 tokens                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: CALL OPENAI CHAT COMPLETION (with streaming)                        │
│                                                                             │
│ POST https://api.openai.com/v1/chat/completions                             │
│ {                                                                           │
│   model: "gpt-4o-mini",                                                     │
│   messages: [system + history + user],                                      │
│   stream: true                                                              │
│ }                                                                           │
│                                                                             │
│ Latency: 500ms to first token, then streaming                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: STREAM RESPONSE BACK TO USER                                        │
│                                                                             │
│ "Two years of embezzlement. That's not a one-time slip—that's a            │
│  pattern. How much are we talking about? And who else knows?"               │
│                                                                             │
│ [Streams word by word to frontend]                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          USER SEES RESPONSE
                       (Ready for next message)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL LATENCY PER TURN:
  - Embedding creation:     ~150ms
  - Vector search:          ~75ms
  - LLM first token:        ~500ms
  - Streaming:              ~2-3 seconds
  ─────────────────────────────────
  TOTAL:                    ~3-4 seconds (similar to current)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### RAG Setup: One-Time Process

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         RAG SETUP (ONE TIME ONLY)                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

YOUR DOCUMENTS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ docs/                                                                       │
│ ├── crime-database.md         (504 lines)                                   │
│ ├── detective-playbook.md     (405 lines)                                   │
│ ├── interrogation-rules.md    (447 lines)                                   │
│ ├── verdict-templates.md      (377 lines)                                   │
│ └── legal-reference.md        (312 lines)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: CHUNK THE DOCUMENTS                                                 │
│                                                                             │
│ Split each document into meaningful, self-contained pieces:                 │
│                                                                             │
│ crime-database.md → 15 chunks                                               │
│   ├── chunk: robbery_definition                                             │
│   ├── chunk: robbery_questions                                              │
│   ├── chunk: robbery_consequences                                           │
│   ├── chunk: embezzlement_definition                                        │
│   ├── chunk: embezzlement_questions                                         │
│   ├── chunk: embezzlement_consequences                                      │
│   └── ... etc                                                               │
│                                                                             │
│ detective-playbook.md → 12 chunks                                           │
│   ├── chunk: goody_opening_moves                                            │
│   ├── chunk: goody_soft_tactics                                             │
│   ├── chunk: goody_pressure_tactics                                         │
│   ├── chunk: baddy_opening_moves                                            │
│   ├── chunk: baddy_pressure_tactics                                         │
│   └── ... etc                                                               │
│                                                                             │
│ Total: ~50-60 chunks                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: EMBED EACH CHUNK                                                    │
│                                                                             │
│ For each chunk, call OpenAI Embeddings API:                                 │
│                                                                             │
│ chunk_robbery_definition → [0.023, -0.089, 0.145, ..., 0.067]              │
│ chunk_robbery_questions  → [0.045, 0.123, -0.078, ..., 0.089]              │
│ chunk_embezzlement_def   → [0.156, -0.034, 0.267, ..., 0.012]              │
│ ... (60 chunks × 1536 dimensions each)                                      │
│                                                                             │
│ Cost: 60 chunks × $0.00002 = $0.0012 (one-time)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: STORE IN VECTOR DATABASE                                            │
│                                                                             │
│ Options:                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ PINECONE (Recommended for production)                                   │ │
│ │ - Free tier: 1 index, 100K vectors                                      │ │
│ │ - Fast, reliable, easy API                                              │ │
│ │ - $0 for your scale                                                     │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ SUPABASE (If you want Postgres + vectors)                               │ │
│ │ - Free tier available                                                   │ │
│ │ - Good if you need other DB features                                    │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ CHROMA (Local/self-hosted)                                              │ │
│ │ - Free, runs locally                                                    │ │
│ │ - Good for development                                                  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Store each chunk with:                                                      │
│ - id: "chunk_embezzlement_definition"                                       │
│ - vector: [0.156, -0.034, 0.267, ..., 0.012]                               │
│ - metadata: { source: "crime-database.md", section: "embezzlement" }        │
│ - text: "Embezzlement: Theft of assets by a person in a position..."       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          ✅ SETUP COMPLETE
                     (Run this once, or when docs change)
```

---

### What You Need to Implement RAG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REQUIRED COMPONENTS                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 1. VECTOR DATABASE ACCOUNT                                                  │
│    └── Pinecone (free tier) OR Supabase OR Chroma                          │
│                                                                             │
│ 2. CHUNKS FILE                                                              │
│    └── Your docs split into ~60 chunks (I'll create this)                  │
│                                                                             │
│ 3. EMBEDDING SCRIPT                                                         │
│    └── One-time script to embed chunks and upload to vector DB             │
│                                                                             │
│ 4. RAG RETRIEVAL FUNCTION                                                   │
│    └── Function that queries vector DB and returns relevant chunks         │
│                                                                             │
│ 5. UPDATED API ROUTE                                                        │
│    └── Modified route.ts to use RAG before calling LLM                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Next Steps (In Order)

```
STEP 1: Choose Vector Database
        ↓
STEP 2: Create chunks from your docs (I'll do this)
        ↓
STEP 3: Create embedding/upload script
        ↓
STEP 4: Run script to populate vector DB
        ↓
STEP 5: Create retrieval function
        ↓
STEP 6: Integrate into your API route
        ↓
STEP 7: Test the full flow
```

---

## DECISION TIME

**Which vector database would you like to use?**

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Pinecone** | Easy setup, fast, reliable | Separate service | Free tier (100K vectors) |
| **Supabase** | All-in-one (DB + vectors) | Slightly more setup | Free tier available |
| **Chroma** | Runs locally, no signup | Need to self-host | Free |

**My recommendation:** Pinecone for simplicity, or Supabase if you want to add more features later.

---

## 10. YOUR RAG FILES (CREATED)

I've created the following files in `src/lib/rag/`:

```
src/lib/rag/
├── chunks.ts         # 45 chunks from your docs
├── embed-chunks.ts   # Script to embed and upload to vector DB
├── retriever.ts      # Functions to query vector DB
└── index.ts          # Exports for easy importing
```

### Chunk Summary

| Category | Count | Description |
|----------|-------|-------------|
| Crime definitions | 14 | Definition, questions, consequences for each crime type |
| Detective tactics | 12 | Goody/Baddy playbook for each phase |
| Verdicts | 6 | Templates for different end states |
| Legal reference | 6 | Miranda, sentencing factors, phrases |
| Rules | 3 | Tone, phases, dos/donts |
| **TOTAL** | **45 chunks** | ~200-400 tokens each |

---

## 11. NEXT STEPS (Action Plan)

### Step 1: Set Up Vector Database (Choose ONE)

**Option A: Pinecone (Recommended for Simplicity)**
```bash
# 1. Create free account at https://www.pinecone.io
# 2. Create an index:
#    - Name: "interrogation-room"
#    - Dimensions: 1536 (for text-embedding-3-small)
#    - Metric: cosine
# 3. Get your API key and add to .env.local:
PINECONE_API_KEY=your-api-key
PINECONE_INDEX_NAME=interrogation-room
```

**Option B: Supabase (Good if you want more features later)**
```bash
# 1. Create project at https://supabase.com
# 2. Run SQL to create table (see embed-chunks.ts for SQL)
# 3. Add to .env.local:
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
```

**Option C: Local JSON (For Development/Testing)**
```bash
# No setup needed! Uses embeddings.json file locally
# Good for testing, but not for production
```

---

### Step 2: Install Dependencies

```bash
# For Pinecone:
npm install @pinecone-database/pinecone

# For Supabase:
npm install @supabase/supabase-js
```

---

### Step 3: Run the Embedding Script

```bash
# Make sure OPENAI_API_KEY is set
npx ts-node src/lib/rag/embed-chunks.ts
```

This will:
1. Generate embeddings for all 45 chunks (~$0.002 cost)
2. Upload them to your chosen vector DB
3. Only needs to run ONCE (or when you update chunks)

---

### Step 4: Integrate RAG into API Route

Update `src/app/api/chat/route.ts`:

```typescript
// Add at top:
import { retrieveRelevantChunks, buildContextString } from "@/lib/rag";

// Inside POST handler, before calling the LLM:
async function POST(request: NextRequest) {
  // ... existing code ...
  
  // NEW: Retrieve relevant chunks
  const lastUserMessage = messages.filter(m => m.role === "user").pop();
  const relevantChunks = await retrieveRelevantChunks(
    openai,
    lastUserMessage?.content || "",
    { topK: 5, minSimilarity: 0.5 }
  );
  const ragContext = buildContextString(relevantChunks);
  
  // NEW: Inject context into system prompt
  const augmentedSystemPrompt = `${config.systemPrompt}

${ragContext}`;
  
  // Use augmentedSystemPrompt instead of config.systemPrompt in LLM call
  // ... rest of existing code ...
}
```

---

### Step 5: Test the Flow

```bash
npm run dev
```

Try these to see RAG in action:
1. "I've been stealing from my company" → Should retrieve embezzlement chunks
2. "I hit someone with my car and drove away" → Should retrieve hit and run chunks
3. "I punched a guy at a bar" → Should retrieve assault chunks

---

## 12. COMPLETE TURN FLOW WITH RAG

```
USER: "I've been embezzling money from my company for 2 years"
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ API ROUTE (route.ts)                                                        │
│                                                                             │
│ 1. Parse request body                                                       │
│    └── messages, activeAgent, roomState                                    │
│                                                                             │
│ 2. ⭐ RAG RETRIEVAL (NEW!)                                                  │
│    ├── Create embedding of user message                                     │
│    ├── Query vector DB for similar chunks                                   │
│    └── Get top 5 chunks: embezzlement_def, embezzlement_questions,         │
│        embezzlement_consequences, goody_tactics, financial_crime_sentences │
│                                                                             │
│ 3. Build augmented prompt                                                   │
│    ├── Base system prompt (500 tokens)                                      │
│    ├── + RAG context (800 tokens)         <-- NEW!                         │
│    ├── + Conversation history (500 tokens)                                  │
│    └── = ~1800 total input tokens                                          │
│                                                                             │
│ 4. Call OpenAI gpt-4o-mini with streaming                                  │
│                                                                             │
│ 5. Parse response, check for handoff                                        │
│                                                                             │
│ 6. Stream response to client                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
            "Two years of embezzlement. That's not a one-time slip.
             You're looking at 3-10 years if this is over $20K.
             How much are we talking about?"
                                    │
                                    │  (Response uses embezzlement-specific
                                    │   questions and sentencing from RAG)
                                    ▼
                          USER SEES RESPONSE
```

---

## 13. HOW RAG IMPROVES RESPONSES

**Without RAG:**
```
Goody: "Tell me more about what happened. Why did you do it?"
(Generic response, no specific knowledge)
```

**With RAG:**
```
Goody: "Two years of embezzlement. That's not a one-time slip—that's a 
pattern. You're looking at 3-10 years if this is over $20,000. Help me 
understand: what's the total amount? And how did you do it without 
getting caught?"
(Uses specific sentencing ranges, knows key questions to ask)
```

---

## 14. TOKEN COST ANALYSIS

| Component | Tokens | Cost per Turn |
|-----------|--------|---------------|
| Base system prompt | ~500 | - |
| RAG context (5 chunks) | ~800 | - |
| Conversation history | ~500 | - |
| User message | ~50 | - |
| **Total Input** | ~1850 | ~$0.0003 |
| Output (response) | ~200 | ~$0.0003 |
| **Total per Turn** | ~2050 | ~$0.0006 |
| Embedding query | 1 call | ~$0.00002 |
| **Grand Total** | - | **~$0.0007/turn** |

At $0.0007 per turn:
- 100 conversations @ 20 turns each = ~$1.40
- 1000 conversations @ 20 turns each = ~$14

---

## READY TO GO!

Your RAG system is set up. Next:

1. **Choose vector DB** (Pinecone recommended)
2. **Run embedding script** (`npx ts-node src/lib/rag/embed-chunks.ts`)
3. **Integrate into API route** (add 5 lines of code)
4. **Test!**

Questions? Let me know what you'd like to tackle first.

