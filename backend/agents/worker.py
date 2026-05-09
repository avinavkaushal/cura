from config import WORKER_MODEL
from schemas import InventoryAlert
from agents.core import call_local_swarm

def draft_rfq_message(alert: InventoryAlert) -> str:
    """
    Agent 1: The Worker
    Role: Drafts human-readable WhatsApp messages blazingly fast.
    """
    print(f"⚡ [Worker Agent - {WORKER_MODEL}] Drafting RFQ for {alert.item_name}...")
    
    prompt = f"""
    You are the Procurement Agent for an orphanage. 
    Draft a professional WhatsApp message to our vendor '{alert.vendor_name}'.
    We currently have {alert.current_stock} of {alert.item_name}, but we need {alert.required_stock} total.
    Ask for their best wholesale price and delivery time for the remaining amount. 
    Keep it brief, polite, and direct.
    Output ONLY the exact message text. Do not include quotes or conversational filler.
    """
    
    # Calls the central communications layer with the fast 4B model
    return call_local_swarm(prompt, target_model=WORKER_MODEL)