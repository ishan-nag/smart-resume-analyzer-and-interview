"""Shared singleton Groq API client with model configuration."""

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(override=True)

_groq_client = None


def get_groq_client() -> Groq:
    """Returns a shared Groq client instance (singleton). Raises ValueError if GROQ_API_KEY missing."""
    global _groq_client

    if _groq_client is not None:
        return _groq_client

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "[GroqClient] ERROR: GROQ_API_KEY not found.\n"
            "Please add it to your .env file:\n"
            "    GROQ_API_KEY=your_key_here\n"
            "Get your free API key at: https://console.groq.com"
        )

    _groq_client = Groq(api_key=api_key)
    print("[GroqClient] Groq client initialized successfully.")

    return _groq_client


def reset_groq_client() -> None:
    """Resets the cached Groq client. Forces re-initialization on next call."""
    global _groq_client
    _groq_client = None
    print("[GroqClient] Groq client reset.")


DEFAULT_MODEL = "llama-3.3-70b-versatile"

MODEL_CONFIGS = {
    "question_generator": {
        "model":       DEFAULT_MODEL,
        "temperature": 0.95,
        "max_tokens":  1024,
    },
    "answer_evaluator": {
        "model":       DEFAULT_MODEL,
        "temperature": 0.3,
        "max_tokens":  1024,
    },
    "ats_scorer": {
        "model":       DEFAULT_MODEL,
        "temperature": 0.3,
        "max_tokens":  256,
    },
    "resume_analyzer": {
        "model":       DEFAULT_MODEL,
        "temperature": 0.3,
        "max_tokens":  1500,
    },
}
