from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List

router = APIRouter(prefix="/matching", tags=["matching"])

class MatchingInput(BaseModel):
    user1_elements: Dict[str, float]
    user1_mbti: str
    user2_elements: Dict[str, float]
    user2_mbti: str

@router.post("/calculate")
async def calculate_compatibility(data: MatchingInput):
    # 1. Element Harmony (Simplified: Wood-Fire good, Water-Fire bad etc.)
    # For now, we calculate a score based on element overlap and balance
    score = 75.0 # Mock score
    
    # 2. MBTI Compatibility Mock
    mbti_harmony = "Heavenly Match" if data.user1_mbti[1] != data.user2_mbti[1] else "Stable Partnership"
    
    description = (
        f"Two souls meet with {score}% synchronicity. "
        f"The {data.user1_mbti} and {data.user2_mbti} dynamic creates a {mbti_harmony}. "
        "Your elements complement each other like the moon and the tide."
    )
    
    return {
        "sync_rate": score,
        "mbti_harmony": mbti_harmony,
        "description": description,
        "status": "success"
    }
