import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

let initialized = false;

export function initLangfuse() {
  if (initialized) return;
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    console.log("Langfuse: Keys not configured, skipping initialization");
    return;
  }

  const sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
  });

  sdk.start();
  initialized = true;
  console.log("Langfuse: Tracing initialized");
}
