from typing import Dict, List

class SynergyEngine:
    def __init__(self):
        # Mapping table for primary elements and MBTI archetypes
        self.element_descriptions = {
            "목": "Growing, creative, and idealistic (Wood).",
            "화": "Passionate, expressive, and energetic (Fire).",
            "토": "Stable, reliable, and supportive (Earth).",
            "금": "Decisive, analytical, and principled (Metal).",
            "수": "Adaptable, wise, and intuitive (Water)."
        }

    def generate_report(self, primary_element: str, mbti: str) -> str:
        description = self.element_descriptions.get(primary_element, "Unique mix of elements.")
        
        # Logic for MBTI + Element synergies
        if primary_element == "화" and "ENFP" in mbti:
            synergy = "Your fire element fuels your ENFP passion! You are a brilliant flame that inspires others with endless creativity."
        elif primary_element == "수" and "ISTJ" in mbti:
            synergy = "The calm wisdom of water meets the precision of ISTJ. You are like a deep, steady river—composed and profoundly reliable."
        elif primary_element == "목" and "N" in mbti:
            synergy = "The growth of wood aligns with your intuitive nature. You seek expansion and meaning in everything you do."
        elif primary_element == "금" and "T" in mbti:
            synergy = "The sharpness of metal enhances your logical thinking. You have a keen mind for cutting through complexity."
        elif primary_element == "토" and "J" in mbti:
            synergy = "The stability of earth anchors your structured approach. You are the foundation upon which great things are built."
        else:
            synergy = f"A harmonious blend of {primary_element} energy and your {mbti} personality. You possess a unique balance of intuition and character."

        return f"{description} {synergy}"

    def get_primary_element(self, elements: Dict[str, float]) -> str:
        if not elements: return ""
        # Fix: max() with key to get key with highest value
        return max(elements, key=lambda k: elements[k])
