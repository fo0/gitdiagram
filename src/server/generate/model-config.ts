const DEFAULT_OPENAI_MODEL = "gpt-5.2";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
const DEFAULT_LITELLM_MODEL = "gpt-4o";

function readEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getProvider(): string {
  return (readEnvValue("LLM_PROVIDER") ?? "openai").toLowerCase();
}

export function getModel(): string {
  const provider = getProvider();

  if (provider === "anthropic") {
    return readEnvValue("ANTHROPIC_MODEL") ?? DEFAULT_ANTHROPIC_MODEL;
  }

  if (provider === "litellm") {
    return readEnvValue("LITELLM_MODEL") ?? DEFAULT_LITELLM_MODEL;
  }

  return readEnvValue("OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL;
}
