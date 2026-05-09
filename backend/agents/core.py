import requests
from config import LOCAL_LLM_URL

def call_local_swarm(prompt: str, target_model: str, json_format: bool = False) -> str:
    """
    The base communication layer for the local AI Swarm.
    Routes prompts to the correct Gemma model via Ollama.
    """
    payload = {
        "model": target_model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    
    # This is crucial for the Manager Agent to ensure strict data parsing
    if json_format:
        payload["format"] = "json"

    try:
        response = requests.post(LOCAL_LLM_URL, json=payload)
        response.raise_for_status()
        return response.json().get("message", {}).get("content", "")
    except requests.exceptions.RequestException as e:
        print(f"❌ Swarm Connection Error ({target_model}): {e}")
        raise ValueError(f"Failed to connect to {target_model}. Make sure Ollama is running! Error: {e}")