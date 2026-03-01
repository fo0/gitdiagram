from __future__ import annotations

from typing import AsyncGenerator
import math
import os

from dotenv import load_dotenv

from app.utils.format_message import format_user_message

load_dotenv()


class AnthropicService:
    """Drop-in replacement for OpenAIService using the Anthropic Messages API."""

    DEFAULT_MAX_TOKENS = 16384

    def __init__(self):
        self.default_api_key = os.getenv("ANTHROPIC_API_KEY")

    def _resolve_api_key(self, override_api_key: str | None = None) -> str:
        api_key = (override_api_key or self.default_api_key or "").strip()
        if not api_key:
            raise ValueError(
                "Missing Anthropic API key. Set ANTHROPIC_API_KEY or provide api_key in request."
            )
        return api_key

    @staticmethod
    def estimate_tokens(text: str) -> int:
        return math.ceil(len(text) / 4)

    @staticmethod
    def _create_client(api_key: str):
        from anthropic import AsyncAnthropic

        return AsyncAnthropic(
            api_key=api_key,
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
        reasoning_effort: object = None,  # accepted but ignored for API compat
        max_output_tokens: int | None = None,
    ) -> AsyncGenerator[str, None]:
        user_prompt = format_user_message(data)
        resolved_api_key = self._resolve_api_key(api_key)
        client = self._create_client(resolved_api_key)

        try:
            async with client.messages.stream(
                model=model,
                max_tokens=max_output_tokens or self.DEFAULT_MAX_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            ) as stream:
                async for text in stream.text_stream:
                    if text:
                        yield text
        finally:
            await client.close()

    async def count_input_tokens(
        self,
        *,
        model: str,
        system_prompt: str,
        data: dict[str, str | None],
        api_key: str | None = None,
        reasoning_effort: object = None,  # accepted but ignored for API compat
    ) -> int:
        user_prompt = format_user_message(data)
        resolved_api_key = self._resolve_api_key(api_key)
        client = self._create_client(resolved_api_key)

        try:
            result = await client.messages.count_tokens(
                model=model,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            return result.input_tokens
        finally:
            await client.close()
