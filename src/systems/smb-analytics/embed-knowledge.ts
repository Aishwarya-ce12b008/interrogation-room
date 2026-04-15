/**
 * SMB Knowledge Base Embedding Script
 *
 * Generates embeddings for all SMB knowledge chunks and uploads to Pinecone.
 * Uses the same index as interrogation but with system="smb-analytics" metadata
 * for filtered retrieval.
 *
 * Usage:
 *   npx tsx src/systems/smb-analytics/embed-knowledge.ts
 *
 * Prerequisites:
 *   - OPENAI_API_KEY in .env.local
 *   - PINECONE_API_KEY in .env.local
 *   - PINECONE_INDEX_NAME in .env.local (default: "interrogation-room")
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { smbKnowledgeChunks, SMB_CHUNK_COUNT } from "./knowledge-base";

async function main() {
  console.log("Starting SMB knowledge base embedding...\n");

  const openaiKey = process.env.OPENAI_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || "interrogation-room";

  if (!openaiKey) {
    console.error("OPENAI_API_KEY not set in .env.local");
    process.exit(1);
  }
  if (!pineconeKey) {
    console.error("PINECONE_API_KEY not set in .env.local");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const pinecone = new Pinecone({ apiKey: pineconeKey });
  const index = pinecone.index(indexName);

  console.log(`Found ${SMB_CHUNK_COUNT} chunks to embed`);
  console.log(`Target Pinecone index: "${indexName}"\n`);

  const vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, string>;
  }> = [];

  for (let i = 0; i < smbKnowledgeChunks.length; i++) {
    const chunk = smbKnowledgeChunks[i];
    console.log(`  [${i + 1}/${SMB_CHUNK_COUNT}] Embedding: ${chunk.id}`);

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk.text,
      });

      vectors.push({
        id: chunk.id,
        values: response.data[0].embedding,
        metadata: {
          text: chunk.text,
          source: chunk.metadata.source,
          category: chunk.metadata.category,
          merchantName: chunk.metadata.merchantName,
          system: chunk.metadata.system,
        },
      });

      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`  Failed to embed ${chunk.id}:`, err);
    }
  }

  console.log(`\nEmbedded ${vectors.length}/${SMB_CHUNK_COUNT} chunks`);
  console.log(`Uploading to Pinecone...\n`);

  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(`  Uploaded batch ${Math.floor(i / batchSize) + 1} (${batch.length} vectors)`);
  }

  console.log(`\nDone! ${vectors.length} vectors uploaded to "${indexName}"`);
}

main().catch(console.error);
