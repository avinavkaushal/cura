import pywhatkit
from config import TEST_PHONE_NUMBER

def send_whatsapp_message(final_message: str, vendor_name: str) -> dict:
    """
    Service Layer: Handles physical browser automation to send WhatsApp messages.
    """
    print(f"🚀 [Dispatcher] Ghost-typing RFQ to {vendor_name}...")
    
    try:
        # Opens browser, waits 15s for WA Web to load, types, hits send, closes tab after 3s.
        pywhatkit.sendwhatmsg_instantly(
            phone_no=TEST_PHONE_NUMBER,
            message=f"*[CURA AI Local Swarm]*\n\n{final_message}",
            wait_time=15, 
            tab_close=True,
            close_time=3
        )
        
        print(f"✅ WhatsApp Ghost-Sent to {vendor_name}!")
        return {"status": "sent_via_browser_automation"}
        
    except Exception as e:
        print(f"❌ PyWhatKit Error: {e}")
        raise Exception(f"Failed to dispatch WhatsApp message: {str(e)}")