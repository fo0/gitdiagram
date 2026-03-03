from __future__ import annotations

from typing import AsyncGenerator, Literal
import math
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

from app.utils.format_message import format_user_message

load_dotenv()

ReasoningEffort = Literal["low", "medium", "high"]


class LiteLLMService:
    """OpenAI-compatible service that talks to a LiteLLM proxy.

    Uses the standard ``chat.completions`` endpoint (not OpenAI Responses API)
    so it works with any LiteLLM-backed provider.

    Env vars:
      - ``LITELLM_API_KEY``   – API key for the LiteLLM proxy
      - ``LITELLM_BASE_URL``  – Base URL of the proxy (e.g. http://localhost:4000)
    """

    DEFAULT_MAX_TOKENS = 16384

    def __init__(self):
        self.default_api_key = os.getenv("LITELLM_API_KEY")
        self.base_url = (os.getenv("LITELLM_BASE_URL") or "").strip().rstrip("/")
        if not self.base_url:
            raise ValueError(
                "Missing LITELLM_BASE_URL. Set the env var to your LiteLLM proxy URL."
            )

    def _resolve_api_key(self, override_api_key: str | None = None) -> str:
        api_key = (override_api_key or self.default_api_key or "").strip()
        if not api_key:
            raise ValueError(
                "Missing LiteLLM API key. Set LITELLM_API_KEY or provide api_key in request."
            )
        return api_key

    @staticmethod
    def estimate_tokens(text: str) -> int:
        return math.ceil(len(text) / 4)

    @staticmethod
    def _build_messages(system_prompt: str, user_prompt: str) -> list[dict]:
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

    def _create_client(self, api_key: str) -> AsyncOpenAI:
        return AsyncOpenAI(
            api_key=api_key,
            base_url=self.base_url,
            max_retries=2,
            timeout=600,
        )

    async def stream_completion(
        self,
        *,
        model: str,
        system_prompt: str,
        data: dict[str, str | None],
        api_key: str | None = None,
        reasoning_effort: ReasoningEffort | None = None,
        max_output_tokens: int | None = None,
    ) -> AsyncGenerator[str, None]:
        user_prompt = format_user_message(data)
        resolved_api_key = self._resolve_api_key(api_key)
        messages = self._build_messages(system_prompt, user_prompt)

        client = self._create_client(resolved_api_key)
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            max_tokens=max_output_tokens or self.DEFAULT_MAX_TOKENS,
        )
        try:
            async for chunk in stream:
                choice = chunk.choices[0] if chunk.choices else None
                if choice and choice.delta and choice.delta.content:
                    yield choice.delta.content
        finally:
            await stream.close()
            await client.close()

    async def count_input_tokens(
        self,
        *,
        model: str,
        system_prompt: str,
        data: dict[str, str | None],
        api_key: str | None = None,
        reasoning_effort: ReasoningEffort | None = None,
    ) -> int:
        """Estimate input tokens using the heuristic fallback.

        LiteLLM proxies generally don't expose a token-counting endpoint,
        so we fall back to the simple ``len / 4`` heuristic.
        """
        user_prompt = format_user_message(data)
        total_text = system_prompt + user_prompt
        return self.estimate_tokens(total_text)
