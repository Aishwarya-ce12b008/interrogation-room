/**
 * RAG RETRIEVER
 * 
 * This module handles querying the vector database to find relevant chunks
 * for a given user message.
 * 
 * Used in every API call to augment the prompt with relevant context.
 */

import OpenAI from "openai";

// ============================================================================
// TYPES
// ============================================================================

export interface RetrievedChunk {
  id: string;
  text: string;
  similarity: number;
  metadata: {
    source: string;
    category: string;
    subcategory?: string;
    crimeType?: string;
    agent?: string;
    phase?: string;
  };
}

export interface RetrievalOptions {
  topK?: number;           // Number of chunks to retrieve (default: 5)
  minSimilarity?: number;  // Minimum similarity threshold (default: 0.5)
  filterCategory?: string; // Optional: only retrieve from specific category
  filterAgent?: string;    // Optional: only retrieve for specific agent
}

// ============================================================================
// EMBEDDING CREATION
// ============================================================================

export async function createQueryEmbedding(
  openai: OpenAI,
  query: string
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  
  return response.data[0].embedding;
}

// ============================================================================
// VECTOR DATABASE RETRIEVAL
// ============================================================================

// Cosine similarity calculation (for local JSON approach)
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Retrieve from Pinecone
async function retrieveFromPinecone(
  queryEmbedding: number[],
  options: RetrievalOptions
): Promise<RetrievedChunk[]> {
  const { Pinecone } = require("@pinecone-database/pinecone");
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "interrogation-room");
  
  // Build filter if specified
  const filter: Record<string, string> = {};
  if (options.filterCategory) filter.category = options.filterCategory;
  if (options.filterAgent) filter.agent = options.filterAgent;
  
  const results = await index.query({
    vector: queryEmbedding,
    topK: options.topK || 5,
    includeMetadata: true,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  });
  
  return results.matches
    .filter((match: any) => match.score >= (options.minSimilarity || 0.5))
    .map((match: any) => ({
      id: match.id,
      text: match.metadata.text,
      similarity: match.score,
      metadata: {
        source: match.metadata.source,
        category: match.metadata.category,
        subcategory: match.metadata.subcategory,
        crimeType: match.metadata.crimeType,
        agent: match.metadata.agent,
        phase: match.metadata.phase,
      },
    }));
}

// Option 2: Retrieve from Supabase
async function retrieveFromSupabase(
  queryEmbedding: number[],
  options: RetrievalOptions
): Promise<RetrievedChunk[]> {
  // Install: npm install @supabase/supabase-js
  // 
  // First, create a search function in Supabase:
  // ```sql
  // create or replace function search_chunks(
  //   query_embedding vector(1536),
  //   match_count int default 5,
  //   min_similarity float default 0.5
  // )
  // returns table (
  //   id text,
  //   text text,
  //   similarity float,
  //   source text,
  //   category text,
  //   subcategory text,
  //   crime_type text,
  //   agent text,
  //   phase text
  // )
  // language plpgsql
  // as $$
  // begin
  //   return query
  //   select
  //     chunks.id,
  //     chunks.text,
  //     1 - (chunks.embedding <=> query_embedding) as similarity,
  //     chunks.source,
  //     chunks.category,
  //     chunks.subcategory,
  //     chunks.crime_type,
  //     chunks.agent,
  //     chunks.phase
  //   from chunks
  //   where 1 - (chunks.embedding <=> query_embedding) > min_similarity
  //   order by chunks.embedding <=> query_embedding
  //   limit match_count;
  // end;
  // $$;
  // ```
  //
  // const { createClient } = require("@supabase/supabase-js");
  // 
  // const supabase = createClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!
  // );
  // 
  // const { data, error } = await supabase.rpc("search_chunks", {
  //   query_embedding: queryEmbedding,
  //   match_count: options.topK || 5,
  //   min_similarity: options.minSimilarity || 0.5,
  // });
  // 
  // if (error) throw error;
  // 
  // return data.map((row: any) => ({
  //   id: row.id,
  //   text: row.text,
  //   similarity: row.similarity,
  //   metadata: {
  //     source: row.source,
  //     category: row.category,
  //     subcategory: row.subcategory,
  //     crimeType: row.crime_type,
  //     agent: row.agent,
  //     phase: row.phase,
  //   },
  // }));
  
  console.warn("Supabase retrieval not configured. Using local JSON fallback.");
  return retrieveFromJsonFile(queryEmbedding, options);
}

// Option 3: Retrieve from local JSON file (development)
async function retrieveFromJsonFile(
  queryEmbedding: number[],
  options: RetrievalOptions
): Promise<RetrievedChunk[]> {
  const fs = require("fs");
  const path = require("path");
  
  const embeddingsPath = path.join(__dirname, "embeddings.json");
  
  // Check if embeddings file exists
  if (!fs.existsSync(embeddingsPath)) {
    console.warn("embeddings.json not found. Run embed-chunks.ts first.");
    return [];
  }
  
  const chunks: Array<{
    id: string;
    embedding: number[];
    text: string;
    metadata: RetrievedChunk["metadata"];
  }> = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));
  
  // Calculate similarity for each chunk
  const results = chunks
    .map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      metadata: chunk.metadata,
    }))
    .filter((chunk) => {
      // Apply filters
      if (options.filterCategory && chunk.metadata.category !== options.filterCategory) {
        return false;
      }
      if (options.filterAgent && chunk.metadata.agent !== options.filterAgent && chunk.metadata.agent !== "both") {
        return false;
      }
      if (chunk.similarity < (options.minSimilarity || 0.5)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, options.topK || 5);
  
  return results;
}

// ============================================================================
// MAIN RETRIEVAL FUNCTION
// ============================================================================

// Configuration - using Pinecone
const VECTOR_DB: "pinecone" | "supabase" | "json-file" = "pinecone";

/**
 * Retrieve relevant chunks for a user query.
 * 
 * @param openai - OpenAI client instance
 * @param query - The user's message
 * @param options - Retrieval options
 * @returns Array of relevant chunks, sorted by similarity
 */
export async function retrieveRelevantChunks(
  openai: OpenAI,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  // Step 1: Create embedding for the query
  const queryEmbedding = await createQueryEmbedding(openai, query);
  
  // Step 2: Search vector database
  let results: RetrievedChunk[];
  
  switch (VECTOR_DB) {
    case "pinecone":
      results = await retrieveFromPinecone(queryEmbedding, options);
      break;
    case "supabase":
      results = await retrieveFromSupabase(queryEmbedding, options);
      break;
    case "json-file":
    default:
      results = await retrieveFromJsonFile(queryEmbedding, options);
      break;
  }
  
  return results;
}

// ============================================================================
// CONTEXT BUILDER
// ============================================================================

/**
 * Build a context string from retrieved chunks to inject into the prompt.
 * 
 * @param chunks - Retrieved chunks
 * @returns Formatted context string
 */
export function buildContextString(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "";
  }
  
  const contextParts = chunks.map((chunk, index) => {
    return `[CONTEXT ${index + 1}] (${chunk.metadata.category}${chunk.metadata.crimeType ? ` - ${chunk.metadata.crimeType}` : ""})\n${chunk.text}`;
  });
  
  return `
## RELEVANT CONTEXT FOR THIS SITUATION:

${contextParts.join("\n\n---\n\n")}

## END OF CONTEXT
`;
}

