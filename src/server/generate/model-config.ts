const DEFAULT_OPENAI_MODEL = "gpt-5.2";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

function readEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getProvider(): string {
  return readEnvValue("LLM_PROVIDER") ?? "openai";
}

export function getModel(): string {
  const provider = getProvider().toLowerCase();

  if (provider === "anthropic") {
    return readEnvValue("ANTHROPIC_MODEL") ?? DEFAULT_ANTHROPIC_MODEL;
  }

  return readEnvValue("OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL;
}
