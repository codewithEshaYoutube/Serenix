from __future__ import annotations

import httpx

from app.config import get_settings


class QwenServiceError(RuntimeError):
    pass


class QwenService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def analyze(self, prompt: str) -> str:
        if not self.settings.qwen_api_key:
            raise QwenServiceError("QWEN_API_KEY is not configured.")

        url = f"{self.settings.qwen_base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.settings.qwen_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.settings.qwen_model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a strict compliance analysis service that returns JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=self.settings.qwen_timeout_seconds) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise QwenServiceError("Qwen API request timed out.") from exc
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            raise QwenServiceError(f"Qwen API returned HTTP {status_code}.") from exc
        except httpx.HTTPError as exc:
            raise QwenServiceError("Qwen API request failed.") from exc

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise QwenServiceError("Qwen API returned an unexpected response shape.") from exc
