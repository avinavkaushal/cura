from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import our newly modularized architecture
from schemas import InventoryAlert, ApprovalPayload
from agents.worker import draft_rfq_message
from agents.manager import validate_rfq
from services.dispatcher import send_whatsapp_message

app = FastAPI(title="CURA AI Core - Local Swarm Edition", version="1.0")

# Secure CORS for Avinav's Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/trigger-procurement")
async def trigger_procurement_loop(alert: InventoryAlert):
    try:
        # Step 1: Worker drafts the message (Gemma 4B)
        draft = draft_rfq_message(alert)
        
        # Step 2: Manager audits the message (Gemma 12B)
        validation = validate_rfq(draft, alert)
        
        if not validation.is_approved:
            print("❌ Validation Failed. Returning error to frontend.")
            return {"status": "failed_validation", "details": validation}
            
        # Step 3: THE MAGIC FORK (Full Autonomy vs Human-in-the-Loop)
        if alert.automation_mode == "auto":
            print("🤖 [FULL AUTONOMY MODE] Bypassing human approval queue...")
            # Instantly dispatch via PyWhatKit without waiting for a click!
            dispatch_result = send_whatsapp_message(validation.final_message, alert.vendor_name)
            return {
                "status": "auto_dispatched", 
                "vendor": alert.vendor_name,
                "dispatch_info": dispatch_result
            }
        
        # If "human" mode, return to the React Manager Queue
        print("🛑 [HUMAN MODE] Returning draft to React Manager Queue...")
        return {
            "status": "ready_for_human_approval", 
            "vendor": alert.vendor_name,
            "message_to_send": validation.final_message,
            "agent_reasoning": validation.feedback
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/approve-and-send")
async def approve_and_send(payload: ApprovalPayload):
    """Endpoint hit when Jeevika or Avinav clicks 'Approve & Process' on the frontend"""
    try:
        result = send_whatsapp_message(payload.final_message, payload.vendor_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))