/**
 * Thin facade that re-exports LLM functions from the configured provider.
 *
 * Controlled by `LLM_PROVIDER` env var:
 *   - "openai"    → OpenAI  (default)
 *   - "anthropic" → Anthropic Claude
 */

import type { ReasoningEffort } from "./openai";

export type { ReasoningEffort };

function getProvider(): string {
  return (process.env.LLM_PROVIDER ?? "openai").trim().toLowerCase();
}

// Re-export estimateTokens (identical heuristic in both modules).
export { estimateTokens } from "./openai";

interface StreamCompletionParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  reasoningEffort?: ReasoningEffort;
  maxOutputTokens?: number;
}

export async function* streamCompletion(
  params: StreamCompletionParams,
): AsyncGenerator<string, void, void> {
  if (getProvider() === "anthropic") {
    const { streamCompletion: sc } = await import("./anthropic");
    yield* sc(params);
  } else {
    const { streamCompletion: sc } = await import("./openai");
    yield* sc(params);
  }
}

interface CountInputTokensParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  reasoningEffort?: ReasoningEffort;
}

export async function countInputTokens(
  params: CountInputTokensParams,
): Promise<number> {
  if (getProvider() === "anthropic") {
    const { countInputTokens: cit } = await import("./anthropic");
    return cit(params);
  } else {
    const { countInputTokens: cit } = await import("./openai");
    return cit(params);
  }
}
