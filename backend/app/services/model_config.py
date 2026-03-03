from __future__ import annotations

import os

from app.services.llm_provider import get_provider

DEFAULT_OPENAI_MODEL = "gpt-5.2"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6"
DEFAULT_LITELLM_MODEL = "gpt-4o"


def get_model() -> str:
    provider = get_provider()

    if provider == "anthropic":
        model = os.getenv("ANTHROPIC_MODEL", "").strip()
        return model or DEFAULT_ANTHROPIC_MODEL

    if provider == "litellm":
        model = os.getenv("LITELLM_MODEL", "").strip()
        return model or DEFAULT_LITELLM_MODEL

    model = os.getenv("OPENAI_MODEL", "").strip()
    return model or DEFAULT_OPENAI_MODEL
