import json
from config import VALIDATOR_MODEL
from schemas import InventoryAlert, ValidationResult
from agents.core import call_local_swarm

def validate_rfq(draft: str, alert: InventoryAlert) -> ValidationResult:
    """
    Agent 2: The Manager
    Role: Audits the worker's draft, enforces safety constraints, and guarantees strict JSON output.
    """
    print(f"🛡️ [Manager Agent - {VALIDATOR_MODEL}] Auditing the draft...")
    
    prompt = f"""
    Review this drafted WhatsApp message to a vendor: "{draft}"
    
    RULES:
    1. MUST mention the exact item: {alert.item_name}.
    2. MUST NOT commit to any payment, financial transaction, or final purchase.
    3. Tone must be professional and respectful.
    
    Respond strictly in JSON format with exactly two keys:
    "is_approved": boolean (true if all rules are met, false otherwise),
    "feedback": "string explaining your reasoning"
    """
    
    # Calls the 12B model and strictly enforces JSON formatting at the API level
    raw_response = call_local_swarm(prompt, target_model=VALIDATOR_MODEL, json_format=True)
    
    try:
        # Defensive programming: Strip markdown formatting just in case the model leaks it
        cleaned_response = raw_response.strip().replace("```json", "").replace("```", "")
        result_dict = json.loads(cleaned_response)
        
        return ValidationResult(
            is_approved=result_dict.get("is_approved", False),
            feedback=result_dict.get("feedback", "No feedback provided."),
            final_message=draft if result_dict.get("is_approved") else None
        )
    except json.JSONDecodeError:
        print(f"⚠️ JSON Parsing failed. Raw output: {raw_response}")
        # Failsafe: If the AI breaks the JSON, we reject the message to be safe
        return ValidationResult(is_approved=False, feedback="Failed to parse Validator output.", final_message=None)