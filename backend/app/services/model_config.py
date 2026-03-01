from __future__ import annotations

import os

DEFAULT_OPENAI_MODEL = "gpt-5.2"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6"


def get_provider() -> str:
    return os.getenv("LLM_PROVIDER", "openai").strip().lower()


def get_model() -> str:
    provider = get_provider()

    if provider == "anthropic":
        model = os.getenv("ANTHROPIC_MODEL", "").strip()
        return model or DEFAULT_ANTHROPIC_MODEL

    model = os.getenv("OPENAI_MODEL", "").strip()
    return model or DEFAULT_OPENAI_MODEL
