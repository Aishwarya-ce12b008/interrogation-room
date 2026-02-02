/**
 * RAG EMBEDDING SCRIPT
 * 
 * Run this script ONCE (or whenever chunks change) to:
 * 1. Generate embeddings for all chunks using OpenAI
 * 2. Upload them to your vector database
 * 
 * Usage:
 *   npx ts-node src/lib/rag/embed-chunks.ts
 * 
 * Prerequisites:
 * - OPENAI_API_KEY environment variable set
 * - Vector database configured (Pinecone, Supabase, or Chroma)
 */

import OpenAI from "openai";
import { chunks, Chunk } from "./chunks";

// ============================================================================
// CONFIGURATION - USING PINECONE
// ============================================================================

const VECTOR_DB: "pinecone" | "supabase" | "json-file" = "pinecone";

// ============================================================================
// OPENAI EMBEDDING FUNCTION
// ============================================================================

async function createEmbedding(openai: OpenAI, text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  
  return response.data[0].embedding;
}

// ============================================================================
// VECTOR DATABASE UPLOADERS
// ============================================================================

// Pinecone upload
async function uploadToPinecone(
  chunks: Array<{ id: string; embedding: number[]; text: string; metadata: Chunk["metadata"] }>
) {
  const { Pinecone } = require("@pinecone-database/pinecone");
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "interrogation-room");
  
  // Pinecone expects vectors in this format
  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    values: chunk.embedding,
    metadata: {
      ...chunk.metadata,
      text: chunk.text, // Store text in metadata for retrieval
    },
  }));
  
  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(`  Uploaded batch ${Math.floor(i / batchSize) + 1}`);
  }
  
  console.log(`✅ Uploaded ${vectors.length} vectors to Pinecone`);
}

// Option 2: Supabase
async function uploadToSupabase(
  chunks: Array<{ id: string; embedding: number[]; text: string; metadata: Chunk["metadata"] }>
) {
  // Install: npm install @supabase/supabase-js
  // 
  // First, create a table in Supabase:
  // ```sql
  // create extension if not exists vector;
  // 
  // create table chunks (
  //   id text primary key,
  //   embedding vector(1536),
  //   text text,
  //   source text,
  //   category text,
  //   subcategory text,
  //   crime_type text,
  //   agent text,
  //   phase text
  // );
  // 
  // create index on chunks using ivfflat (embedding vector_cosine_ops);
  // ```
  //
  // const { createClient } = require("@supabase/supabase-js");
  // 
  // const supabase = createClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_KEY!
  // );
  // 
  // for (const chunk of chunks) {
  //   await supabase.from("chunks").upsert({
  //     id: chunk.id,
  //     embedding: chunk.embedding,
  //     text: chunk.text,
  //     source: chunk.metadata.source,
  //     category: chunk.metadata.category,
  //     subcategory: chunk.metadata.subcategory || null,
  //     crime_type: chunk.metadata.crimeType || null,
  //     agent: chunk.metadata.agent || null,
  //     phase: chunk.metadata.phase || null,
  //   });
  // }
  // 
  // console.log(`✅ Uploaded ${chunks.length} vectors to Supabase`);
  
  console.log("Supabase upload not yet configured. Uncomment the code above.");
}

// Option 3: Local JSON file (for development)
async function saveToJsonFile(
  chunks: Array<{ id: string; embedding: number[]; text: string; metadata: Chunk["metadata"] }>
) {
  const fs = require("fs");
  const path = require("path");
  
  const outputPath = path.join(__dirname, "embeddings.json");
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
  
  console.log(`✅ Saved ${chunks.length} embeddings to ${outputPath}`);
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log("🚀 Starting RAG embedding process...\n");
  
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable not set");
    process.exit(1);
  }
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  console.log(`📄 Found ${chunks.length} chunks to embed\n`);
  
  // Generate embeddings for all chunks
  const embeddedChunks: Array<{
    id: string;
    embedding: number[];
    text: string;
    metadata: Chunk["metadata"];
  }> = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    console.log(`  [${i + 1}/${chunks.length}] Embedding: ${chunk.id}`);
    
    try {
      const embedding = await createEmbedding(openai, chunk.text);
      
      embeddedChunks.push({
        id: chunk.id,
        embedding,
        text: chunk.text,
        metadata: chunk.metadata,
      });
      
      // Rate limiting - be gentle with the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ❌ Failed to embed ${chunk.id}:`, error);
    }
  }
  
  console.log(`\n📊 Successfully embedded ${embeddedChunks.length}/${chunks.length} chunks\n`);
  
  // Upload to vector database
  console.log(`📤 Uploading to: ${VECTOR_DB}\n`);
  
  switch (VECTOR_DB) {
    case "pinecone":
      await uploadToPinecone(embeddedChunks);
      break;
    case "supabase":
      await uploadToSupabase(embeddedChunks);
      break;
    case "json-file":
      await saveToJsonFile(embeddedChunks);
      break;
    default:
      console.log("Unknown vector database. Saving to JSON file.");
      await saveToJsonFile(embeddedChunks);
  }
  
  console.log("\n✅ Done!");
}

main().catch(console.error);

