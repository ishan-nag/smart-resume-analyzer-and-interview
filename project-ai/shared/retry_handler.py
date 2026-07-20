"""Shared retry wrapper with exponential backoff for Groq API calls."""

import time
import json
import re
from groq import Groq

DEFAULT_MAX_RETRIES = 3
DEFAULT_RETRY_DELAY = 1.0
DEFAULT_BACKOFF_FACTOR = 2.0


def call_with_retry(
    client: Groq,
    messages: list,
    model: str,
    temperature: float = 0.5,
    max_tokens: int = 1024,
    max_retries: int = DEFAULT_MAX_RETRIES,
    retry_delay: float = DEFAULT_RETRY_DELAY,
    backoff_factor: float = DEFAULT_BACKOFF_FACTOR,
    caller_label: str = "LLMCall",
) -> str | None:
    """Sends a message to the Groq API with automatic retry on failure. Returns raw text or None."""
    attempt = 0
    current_delay = retry_delay

    while attempt < max_retries:
        attempt += 1
        try:
            print(f"[{caller_label}] API call attempt {attempt}/{max_retries}...")

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            raw_text = response.choices[0].message.content.strip()
            raw_text = re.sub(r"```json|```", "", raw_text).strip()

            print(f"[{caller_label}] API call succeeded on attempt {attempt}.")
            return raw_text

        except Exception as e:
            error_message = str(e)

            if "rate_limit" in error_message.lower() or "429" in error_message:
                print(f"[{caller_label}] Rate limit hit. Waiting {current_delay}s before retry...")
            elif "decommissioned" in error_message.lower():
                print(f"[{caller_label}] ERROR: Model is decommissioned. Update the model name in shared/groq_client.py")
                return None
            else:
                print(f"[{caller_label}] Attempt {attempt} failed: {error_message}")

            if attempt < max_retries:
                print(f"[{caller_label}] Retrying in {current_delay}s...")
                time.sleep(current_delay)
                current_delay *= backoff_factor

    print(f"[{caller_label}] All {max_retries} attempts failed. Returning None.")
    return None


def parse_json_response(raw_text: str | None, caller_label: str = "LLMCall") -> dict | list | None:
    """Safely parses JSON from LLM response. Returns parsed object or None on failure."""
    if raw_text is None:
        print(f"[{caller_label}] No response to parse (raw_text is None).")
        return None

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        print(f"[{caller_label}] JSON parse error: {e}")
        print(f"[{caller_label}] Raw text was: {raw_text[:200]}...")
        return None


if __name__ == "__main__":
    """Quick test — verifies retry handler works with a simple API call."""
    import os
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    try:
        from shared.groq_client import get_groq_client, MODEL_CONFIGS
    except ImportError:
        from groq_client import get_groq_client, MODEL_CONFIGS

    print("[RetryHandler] Testing retry handler with a simple API call...")

    client = get_groq_client()
    config = MODEL_CONFIGS["question_generator"]

    response = call_with_retry(
        client=client,
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Always respond with only valid JSON."},
            {"role": "user", "content": 'Respond with this exact JSON: {"status": "ok", "message": "retry handler works"}'}
        ],
        model=config["model"],
        temperature=config["temperature"],
        max_tokens=64,
        caller_label="RetryHandlerTest",
    )

    result = parse_json_response(response, "RetryHandlerTest")

    if result:
        print(f"[RetryHandler] SUCCESS! Response: {result}")
    else:
        print("[RetryHandler] FAILED: Could not get a valid response.")
