/**
 * Thin facade that re-exports LLM functions from the configured provider.
 *
 * Controlled by `LLM_PROVIDER` env var:
 *   - "openai"    → OpenAI  (default)
 *   - "anthropic" → Anthropic Claude
 */

import { getProvider } from "./model-config";

export type ReasoningEffort = "low" | "medium" | "high";

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

interface StreamCompletionParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  reasoningEffort?: ReasoningEffort;
  maxOutputTokens?: number;
}

interface CountInputTokensParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  reasoningEffort?: ReasoningEffort;
}

type ProviderModule = {
  streamCompletion: (params: StreamCompletionParams) => AsyncGenerator<string, void, void>;
  countInputTokens: (params: CountInputTokensParams) => Promise<number>;
};

let _providerModule: ProviderModule | null = null;

async function getModule(): Promise<ProviderModule> {
  if (!_providerModule) {
    _providerModule =
      getProvider() === "anthropic"
        ? await import("./anthropic")
        : await import("./openai");
  }
  return _providerModule;
}

export async function* streamCompletion(
  params: StreamCompletionParams,
): AsyncGenerator<string, void, void> {
  const mod = await getModule();
  yield* mod.streamCompletion(params);
}

export async function countInputTokens(
  params: CountInputTokensParams,
): Promise<number> {
  const mod = await getModule();
  return mod.countInputTokens(params);
}
