from typing import Dict, List, Optional

class ConflictResolver:
    """
    Handles contradictions between different data modalities.
    Example: Saju indicates introversion (Water), but MBTI is Extraverted (E).
    """
    @staticmethod
    def resolve(saju_elements: Dict[str, float], mbti: str, face_metrics: Dict) -> Dict:
        insights = []
        
        # 1. Saju vs MBTI (Introversion/Extraversion)
        water_score = saju_elements.get("Water", 0)
        fire_score = saju_elements.get("Fire", 0)
        mbti_e = mbti.startswith("E")
        
        if water_score > 40 and mbti_e:
            insights.append({
                "type": "contradiction",
                "area": "Social Persona",
                "message": "Your innate nature is calm like water, but you've developed a vibrant 'social persona' for the world."
            })
        elif fire_score > 40 and not mbti_e:
            insights.append({
                "type": "hidden_passion",
                "area": "Inner Energy",
                "message": "You burn with silent fire. Your depth hides an intense passion that only careful eyes can see."
            })
            
        # 2. Face (Sanjong) vs MBTI (Planning/J)
        # Mid-face (Middle ratio) long = Social achievement, success drive
        is_j = mbti.endswith("J")
        mid_ratio = face_metrics.get("sanjong", {}).get("middle_ratio", 1.0)
        
        if mid_ratio > 1.2 and not is_j:
            insights.append({
                "type": "potential",
                "area": "Career",
                "message": "Your facial structure suggests great leadership potential, though your free-spirited nature (P) seeks new paths."
            })
            
        return insights

class SyncScoreCalculator:
    @staticmethod
    def calculate(saju: Dict, mbti: str, face: Dict, palm: Dict) -> float:
        # Simplified formula for "Destiny Synchronicity"
        # In a real app, this would be a weighted consistency check
        base = 70.0
        # Bonus for consistency
        if "Water" in saju and "I" in mbti: base += 5
        if "Fire" in saju and "E" in mbti: base += 5
        
        return min(99.9, base + (len(mbti) * 2))

class VitalityCorrection:
    """
    Adjusts destiny scores based on real-time bio-data (Heart Rate, Sleep).
    """
    @staticmethod
    def adjust_score(base_score: float, heart_rate_variability: float, sleep_efficiency: float) -> Dict:
        # HRV contributes to 'Fortune Resilience', Sleep to 'Energy'
        vitality = (heart_rate_variability * 0.6) + (sleep_efficiency * 40.0)
        vitality = min(100.0, max(0.0, vitality))
        
        # If vitality is low, even a 'Peak' fortune needs a caution label
        corrected_score = base_score * (0.8 + (vitality / 500.0))
        
        return {
            "vitality_score": round(vitality, 1),
            "corrected_score": round(corrected_score, 1),
            "recommendation": "High energy day! Carpe Diem." if vitality > 80 else "Spirit is willing but body needs rest."
        }

async def get_integrated_synthesis(data: Dict, bio_data: Optional[Dict] = None) -> Dict:
    resolver = ConflictResolver()
    conflicts = resolver.resolve(data['elements'], data['mbti'], data['face_metrics'])
    base_sync_score = SyncScoreCalculator.calculate(data['elements'], data['mbti'], data['face_metrics'], data['palm_metrics'])
    
    vitality_data = {"vitality_score": 100.0, "corrected_score": base_sync_score}
    if bio_data:
        vitality_data = VitalityCorrection.adjust_score(
            base_sync_score, 
            bio_data.get('hrv', 0.8), 
            bio_data.get('sleep', 0.8)
        )
    
    return {
        "sync_score": vitality_data["corrected_score"],
        "vitality": vitality_data["vitality_score"],
        "conflict_insights": conflicts,
        "recommendation": vitality_data.get("recommendation"),
        "matrix_status": "synced"
    }
