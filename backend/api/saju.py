from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
from .saju_engine import SajuEngine

router = APIRouter(prefix="/saju", tags=["saju"])
engine = SajuEngine()

class SajuInput(BaseModel):
    year: int
    month: int
    day: int
    hour: Optional[int] = None
    is_lunar: bool = False
    is_male: bool = True

@router.post("/analyze")
async def analyze_saju(data: SajuInput):
    pillars = engine.get_pillars(
        year=data.year,
        month=data.month,
        day=data.day,
        hour=data.hour,
        is_lunar=data.is_lunar
    )
    
    elements = engine.analyze_five_elements(pillars)
    day_stem = engine.get_day_stem(pillars["day"])
    daeun = engine.calculate_daeun(pillars["year"], pillars["month"], data.is_male)
    trend = engine.get_fortune_trend(daeun["daeun_cycles"])
    
    # Professional Oracle Additions
    gyeokguk = engine.determine_gyeokguk(pillars["month"])
    yongsin = engine.find_yongsin(elements, "Spring") # Simplified season
    interactions = engine.analyze_interactions(pillars)
    
    return {
        "pillars": pillars,
        "day_stem": day_stem,
        "five_elements": elements,
        "daeun": daeun,
        "fortune_trend": trend,
        "pro_oracle": {
            "gyeokguk": gyeokguk,
            "yongsin": yongsin,
            "interactions": interactions
        },
        "summary": f"Structure: {gyeokguk}, Useful God: {yongsin}"
    }
