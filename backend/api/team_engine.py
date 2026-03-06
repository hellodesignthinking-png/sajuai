from typing import Dict, List

class TeamOracle:
    """
    B2B Team Synergy: Analyzes group dynamics for optimal productivity.
    """
    @staticmethod
    def analyze_team_harmony(members: List[Dict]) -> Dict:
        # 1. Element Distribution in Team
        distribution = {"Wood": 0, "Fire": 0, "Earth": 0, "Metal": 0, "Water": 0}
        for m in members:
            primary = m.get("primary_element", "Earth")
            distribution[primary] += 1
            
        # 2. Logic: Needs balance. Too much Fire = Conflict, Too much Water = Stagnation
        team_harmony_score = 85.0
        recommendation = "A well-balanced creative team."
        
        if distribution["Fire"] > len(members) / 2:
            team_harmony_score -= 20
            recommendation = "Too much heat. Assign a 'Water' or 'Earth' mediator for balance."
            
        return {
            "harmony_score": team_harmony_score,
            "distribution": distribution,
            "recommendation": recommendation,
            "best_pairing": f"{members[0]['name']} & {members[1]['name']} are a Power Duo (Hab)." if len(members) > 1 else "N/A"
        }
