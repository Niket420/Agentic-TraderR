from functools import lru_cache

from app.services.llm.groq import GroqAdapter


class LLMService:
    """The only interface the rest of the app should use to talk to an LLM.

    Swapping Groq for another provider or a local model later means
    changing only this file (and its adapter), not research/agent logic.
    """

    def __init__(self, adapter: GroqAdapter) -> None:
        self._adapter = adapter

    def generate(self, prompt: str, *, system: str | None = None) -> str:
        """Generate text from the configured LLM provider."""
        return self._adapter.generate(prompt, system=system)


@lru_cache
def get_llm_service() -> LLMService:
    """Return a process-wide singleton LLMService instance."""
    return LLMService(GroqAdapter())


llm_service = get_llm_service()
