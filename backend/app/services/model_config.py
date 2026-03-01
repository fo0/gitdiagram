from __future__ import annotations

import os

from app.services.llm_provider import get_provider

DEFAULT_OPENAI_MODEL = "gpt-5.2"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6"


def get_model() -> str:
    provider = get_provider()

    if provider == "anthropic":
        model = os.getenv("ANTHROPIC_MODEL", "").strip()
        return model or DEFAULT_ANTHROPIC_MODEL

    model = os.getenv("OPENAI_MODEL", "").strip()
    return model or DEFAULT_OPENAI_MODEL
