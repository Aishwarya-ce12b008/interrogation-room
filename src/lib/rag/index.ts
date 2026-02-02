/**
 * RAG Module
 * 
 * Retrieval-Augmented Generation for the interrogation room.
 * 
 * Usage:
 * ```typescript
 * import { retrieveRelevantChunks, buildContextString } from "@/lib/rag";
 * 
 * // In your API route:
 * const chunks = await retrieveRelevantChunks(openai, userMessage);
 * const context = buildContextString(chunks);
 * 
 * // Then inject `context` into your system prompt
 * ```
 */

export { chunks, CHUNK_COUNT, getChunksByCategory, getChunksByCrime, getChunksByAgent } from "./chunks";
export { retrieveRelevantChunks, buildContextString, createQueryEmbedding } from "./retriever";
export type { RetrievedChunk, RetrievalOptions } from "./retriever";

