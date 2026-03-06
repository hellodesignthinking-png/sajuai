from typing import Dict, List, Optional

class FateCRM:
    """
    Strategic Relationship Management (CRM) based on Destiny.
    """
    @staticmethod
    def analyze_contact_synergy(my_data: Dict, contact_data: Dict) -> Dict:
        # 1. Element Synergy (Gung-hab)
        my_yongsin = my_data.get("yongsin", "Fire")
        contact_primary = contact_data.get("primary_element", "Wood")
        
        synergy_score = 70.0
        relationship_type = "Strategic Partner"
        
        if contact_primary == my_yongsin:
            synergy_score += 20
            relationship_type = "Heavenly Supporter (귀인)"
        elif contact_primary == "Water" and my_yongsin == "Fire":
            synergy_score -= 15
            relationship_type = "Careful Caution (관리 대상)"
            
        return {
            "synergy_score": synergy_score,
            "relationship_type": relationship_type,
            "business_fit": "High" if synergy_score > 80 else "Moderate",
            "interaction_tip": "Focus on shared goals" if synergy_score > 80 else "Keep formal boundaries"
        }

    @staticmethod
    def get_focus_recommendation(contacts: List[Dict]) -> Dict:
        # Suggest the best person to meet this month based on scores
        best_contact = max(contacts, key=lambda x: x.get("score", 0)) if contacts else None
        return {
            "focus_name": best_contact["name"] if best_contact else "N/A",
            "reason": "Highest synergy with your current cycle.",
            "action": "Schedule a lunch or strategy meeting."
        }
