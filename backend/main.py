import os
import json
import requests
import pywhatkit
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="CURA AI Core - Local Swarm Edition", version="1.0")

# --- Swarm Configuration ---
LOCAL_LLM_URL = "http://localhost:11434/api/chat" 
WORKER_MODEL = "gemma4:e4b"       # The fast drafter
VALIDATOR_MODEL = "gemma3:12b"    # The deep reasoning manager

# --- Data Models ---
class InventoryAlert(BaseModel):
    item_name: str
    current_stock: int
    required_stock: int
    vendor_name: str

class ValidationResult(BaseModel):
    is_approved: bool
    feedback: str
    final_message: str | None = None

class ApprovalPayload(BaseModel):
    final_message: str
    vendor_name: str

# --- Dynamic Local LLM Caller ---
def call_local_swarm(prompt: str, target_model: str, json_format: bool = False) -> str:
    payload = {
        "model": target_model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    if json_format:
        payload["format"] = "json"

    try:
        response = requests.post(LOCAL_LLM_URL, json=payload)
        response.raise_for_status()
        return response.json().get("message", {}).get("content", "")
    except Exception as e:
        print(f"❌ Swarm Connection Error ({target_model}): {e}")
        raise ValueError(f"Failed to connect to {target_model}: {e}")

# --- Agent 1: The Worker (Gemma 4B) ---
def draft_rfq_message(alert: InventoryAlert) -> str:
    print(f"⚡ [Worker Agent - {WORKER_MODEL}] Drafting RFQ for {alert.item_name}...")
    
    prompt = f"""
    You are the Procurement Agent for an orphanage. 
    Draft a professional WhatsApp message to our vendor '{alert.vendor_name}'.
    We currently have {alert.current_stock} of {alert.item_name}, but we need {alert.required_stock}.
    Ask for their best wholesale price and delivery time. Keep it brief and polite.
    Output ONLY the message text.
    """
    
    return call_local_swarm(prompt, target_model=WORKER_MODEL)

# --- Agent 2: The Manager (Gemma 3 12B) ---
def validate_rfq(draft: str, alert: InventoryAlert) -> ValidationResult:
    print(f"🛡️ [Manager Agent - {VALIDATOR_MODEL}] Auditing the draft...")
    
    prompt = f"""
    Review this drafted WhatsApp message to a vendor: "{draft}"
    
    RULES:
    1. MUST mention {alert.item_name}.
    2. MUST NOT commit to any payment.
    3. Tone must be respectful.
    
    Respond strictly in JSON format with two keys:
    "is_approved": true or false,
    "feedback": "your reasoning"
    """
    
    raw_response = call_local_swarm(prompt, target_model=VALIDATOR_MODEL, json_format=True)
    
    try:
        cleaned_response = raw_response.strip().replace("```json", "").replace("```", "")
        result_dict = json.loads(cleaned_response)
        
        return ValidationResult(
            is_approved=result_dict.get("is_approved", False),
            feedback=result_dict.get("feedback", "No feedback provided."),
            final_message=draft if result_dict.get("is_approved") else None
        )
    except json.JSONDecodeError:
        print(f"⚠️ JSON Parsing failed. Raw output: {raw_response}")
        return ValidationResult(is_approved=False, feedback="Failed to parse Validator output.")

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "CURA AI Backend running locally. Swarm is active."}

@app.post("/trigger-procurement")
async def trigger_procurement_loop(alert: InventoryAlert):
    try:
        # Step 1: Draft
        draft = draft_rfq_message(alert)
        print(f"\n📝 Draft Generated:\n{draft}\n")
        
        # Step 2: Validate
        validation = validate_rfq(draft, alert)
        print(f"✅ Validation Status: {validation.is_approved}")
        print(f"📋 Feedback: {validation.feedback}")
        
        if not validation.is_approved:
            return {"status": "failed_validation", "details": validation}
            
        # Step 3: Return payload ready for the frontend dispatcher
        return {
            "status": "ready_for_human_approval", 
            "vendor": alert.vendor_name,
            "message_to_send": validation.final_message
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/approve-and-send")
async def send_whatsapp_to_vendor(payload: ApprovalPayload):
    print(f"🚀 [Dispatcher] Ghost-typing RFQ to {payload.vendor_name}...")
    
    # ⚠️ Replace this with your personal phone number to test it! 
    # Must include the country code (+91 for India).
    test_number = "+919832414358" 

    try:
        # This will open a new tab, wait 15 seconds for WA Web to load, 
        # type the message, hit send, and close the tab 3 seconds later.
        pywhatkit.sendwhatmsg_instantly(
            phone_no=test_number,
            message=f"*[CURA AI Local Swarm]*\n\n{payload.final_message}",
            wait_time=15, 
            tab_close=True,
            close_time=3
        )
        
        print(f"✅ WhatsApp Ghost-Sent!")
        return {"status": "sent_via_browser_automation"}
        
    except Exception as e:
        print(f"❌ PyWhatKit Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))