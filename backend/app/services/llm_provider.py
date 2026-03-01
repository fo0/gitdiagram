"""Thin factory that returns the configured LLM service.

Controlled by the ``LLM_PROVIDER`` environment variable:
  - ``"openai"``    → OpenAIService  (default)
  - ``"anthropic"`` → AnthropicService
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.anthropic_service import AnthropicService
    from app.services.openai_service import OpenAIService

LLMService = "OpenAIService | AnthropicService"


def get_provider() -> str:
    return os.getenv("LLM_PROVIDER", "openai").strip().lower()


@lru_cache(maxsize=1)
def get_llm_service() -> OpenAIService | AnthropicService:
    provider = get_provider()
    if provider == "anthropic":
        from app.services.anthropic_service import AnthropicService

        return AnthropicService()

    from app.services.openai_service import OpenAIService

    return OpenAIService()
