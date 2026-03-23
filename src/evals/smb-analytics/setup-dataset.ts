/**
 * Uploads the SMB Analytics eval dataset to Langfuse.
 * Run once, or re-run to update items.
 *
 * Usage:  npx tsx src/evals/smb-analytics/setup-dataset.ts
 */

import { config as dotenvConfig } from "dotenv";
import path from "path";
dotenvConfig({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import { LangfuseClient } from "@langfuse/client";
import { smbAnalyticsDataset } from "./dataset";

const DATASET_NAME = "smb-analytics-evals";

async function main() {
  const langfuse = new LangfuseClient();

  console.log(`Creating dataset "${DATASET_NAME}" in Langfuse...`);

  try {
    await langfuse.api.datasets.create({
      name: DATASET_NAME,
      description: "SMB Analytics Advisor eval dataset — 25 test cases covering session start, single-tool, multi-tool, multi-turn, email, edge cases, safety, and advice.",
      metadata: {
        system: "smb-analytics",
        version: "1.0",
        createdAt: new Date().toISOString(),
      },
    });
    console.log("  Dataset created.");
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number; body?: string };
    if (err.statusCode === 409 || err.message?.includes("already exists") || err.body?.includes("already exists")) {
      console.log("  Dataset already exists, will update items.");
    } else {
      throw e;
    }
  }

  console.log(`\nUploading ${smbAnalyticsDataset.length} test cases...\n`);

  for (const tc of smbAnalyticsDataset) {
    await langfuse.api.datasetItems.create({
      datasetName: DATASET_NAME,
      input: {
        testCaseId: tc.id,
        category: tc.category,
        merchant: tc.merchant,
        userInput: tc.input,
        conversationHistory: tc.conversationHistory || null,
      },
      expectedOutput: {
        expectedTools: tc.expectedTools,
        expectedNoTool: tc.expectedNoTool || false,
        referenceNotes: tc.referenceNotes,
        evalCriteria: tc.evalCriteria,
      },
      metadata: {
        category: tc.category,
        merchant: tc.merchant,
        id: tc.id,
      },
    });
    console.log(`  + ${tc.id} [${tc.category}]`);
  }

  console.log(`\nDone. ${smbAnalyticsDataset.length} items uploaded to "${DATASET_NAME}".`);
  console.log(`Now run:  npm run eval -- --name "your-experiment-name"\n`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
