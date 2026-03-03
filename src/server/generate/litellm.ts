import OpenAI from "openai";

const DEFAULT_MAX_TOKENS = 16384;

function resolveApiKey(overrideApiKey?: string): string {
  const apiKey = overrideApiKey?.trim() || process.env.LITELLM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing LiteLLM API key. Set LITELLM_API_KEY or provide api_key in request.",
    );
  }
  return apiKey;
}

function getBaseUrl(): string {
  const baseUrl = process.env.LITELLM_BASE_URL?.trim()?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error(
      "Missing LITELLM_BASE_URL. Set the env var to your LiteLLM proxy URL.",
    );
  }
  return baseUrl;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

interface StreamCompletionParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  reasoningEffort?: string; // accepted but ignored for API compat
  maxOutputTokens?: number;
}

export async function* streamCompletion({
  model,
  systemPrompt,
  userPrompt,
  apiKey,
  maxOutputTokens,
}: StreamCompletionParams): AsyncGenerator<string, void, void> {
  const client = new OpenAI({
    apiKey: resolveApiKey(apiKey),
    baseURL: getBaseUrl(),
  });

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxOutputTokens ?? DEFAULT_MAX_TOKENS,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

interface CountInputTokensParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  reasoningEffort?: string; // accepted but ignored for API compat
}

export async function countInputTokens({
  systemPrompt,
  userPrompt,
}: CountInputTokensParams): Promise<number> {
  // LiteLLM proxies generally don't expose a token-counting endpoint,
  // so we fall back to the simple heuristic.
  return estimateTokens(systemPrompt + userPrompt);
}
