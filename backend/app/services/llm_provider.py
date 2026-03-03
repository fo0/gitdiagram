"""Thin factory that returns the configured LLM service.

Controlled by the ``LLM_PROVIDER`` environment variable:
  - ``"openai"``    → OpenAIService  (default)
  - ``"anthropic"`` → AnthropicService
  - ``"litellm"``   → LiteLLMService  (OpenAI-compatible proxy)
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.anthropic_service import AnthropicService
    from app.services.litellm_service import LiteLLMService
    from app.services.openai_service import OpenAIService

    LLMService = OpenAIService | AnthropicService | LiteLLMService


def get_provider() -> str:
    return os.getenv("LLM_PROVIDER", "openai").strip().lower()


@lru_cache(maxsize=1)
def get_llm_service() -> OpenAIService | AnthropicService | LiteLLMService:
    provider = get_provider()
    if provider == "anthropic":
        from app.services.anthropic_service import AnthropicService

        return AnthropicService()

    if provider == "litellm":
        from app.services.litellm_service import LiteLLMService

        return LiteLLMService()

    from app.services.openai_service import OpenAIService

    return OpenAIService()
