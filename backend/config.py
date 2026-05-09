import os
from dotenv import load_dotenv

# Load environment variables (for safety)
load_dotenv()

# --- Swarm Configuration ---
LOCAL_LLM_URL = "http://localhost:11434/api/chat" 
WORKER_MODEL = "gemma4:e4b"       # The fast drafter
VALIDATOR_MODEL = "gemma3:12b"    # The deep reasoning manager

# --- Dispatcher Configuration ---
# Your personal test number (Must include country code, e.g., +91...)
TEST_PHONE_NUMBER = os.getenv("TEST_PHONE_NUMBER", "+919832414358")