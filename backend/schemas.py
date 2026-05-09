from pydantic import BaseModel
from typing import Optional, Literal

class InventoryAlert(BaseModel):
    item_name: str
    current_stock: int
    required_stock: int
    vendor_name: str
    # This matches the toggle switch on the frontend!
    automation_mode: Literal["human", "auto"] = "human" 

class ValidationResult(BaseModel):
    is_approved: bool
    feedback: str
    final_message: Optional[str] = None

class ApprovalPayload(BaseModel):
    final_message: str
    vendor_name: str