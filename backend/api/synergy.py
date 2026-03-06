from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from .synergy_engine import SynergyEngine

router = APIRouter(prefix="/synergy", tags=["synergy"])
engine = SynergyEngine()

class SynergyInput(BaseModel):
    elements: Dict[str, float]
    mbti: str

@router.post("/report")
async def get_synergy_report(data: SynergyInput):
    primary = engine.get_primary_element(data.elements)
    report = engine.generate_report(primary, data.mbti)
    return {
        "primary_element": primary,
        "mbti": data.mbti,
        "report": report
    }
