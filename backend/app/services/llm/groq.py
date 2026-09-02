import logging

from groq import Groq

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_DEFAULT_MODEL = "llama-3.3-70b-versatile"


class GroqAdapter:
    """The only file in the app that imports the Groq SDK directly."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None

    def generate(self, prompt: str, *, system: str | None = None, model: str = _DEFAULT_MODEL) -> str:
        """Send a prompt to Groq and return the generated text."""
        if self._client is None:
            raise RuntimeError("GROQ_API_KEY is not configured")
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        logger.info("Groq generate: model=%s prompt_len=%d", model, len(prompt))
        response = self._client.chat.completions.create(model=model, messages=messages)
        return response.choices[0].message.content or ""
