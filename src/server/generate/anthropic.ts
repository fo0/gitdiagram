import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MAX_TOKENS = 16384;

function resolveApiKey(overrideApiKey?: string): string {
  const apiKey = overrideApiKey?.trim() || process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing Anthropic API key. Set ANTHROPIC_API_KEY or provide api_key in request.",
    );
  }
  return apiKey;
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
  const client = new Anthropic({ apiKey: resolveApiKey(apiKey) });

  const stream = client.messages.stream({
    model,
    max_tokens: maxOutputTokens ?? DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      if (event.delta.text) {
        yield event.delta.text;
      }
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
  model,
  systemPrompt,
  userPrompt,
  apiKey,
}: CountInputTokensParams): Promise<number> {
  const client = new Anthropic({ apiKey: resolveApiKey(apiKey) });

  const result = await client.messages.countTokens({
    model,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return result.input_tokens;
}
