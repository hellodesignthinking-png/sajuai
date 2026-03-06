from typing import Dict, List

class RemedyEngine:
    """
    Wellness Alchemy: Prescribing items, colors, and directions to balance elements.
    """
    REMEDIES = {
        "Wood": {
            "color": "Green",
            "item": "Wooden beads, Plants",
            "food": "Sour flavors, Leafy greens",
            "direction": "East"
        },
        "Fire": {
            "color": "Red",
            "item": "Candles, Sharp accessories",
            "food": "Bitter flavors, Spicy food",
            "direction": "South"
        },
        "Earth": {
            "color": "Yellow/Brown",
            "item": "Stones, Ceramics",
            "food": "Sweet flavors, Grains",
            "direction": "Center/Local"
        },
        "Metal": {
            "color": "White/Gold",
            "item": "Metal jewelry, Scissors",
            "food": "Pungent flavors, Root vegetables",
            "direction": "West"
        },
        "Water": {
            "color": "Black/Blue",
            "item": "Fish tanks, Glass crystals",
            "food": "Salty flavors, Seafood",
            "direction": "North"
        }
    }

    @staticmethod
    def get_prescriptive_remedy(yongsin: str) -> Dict:
        remedy = RemedyEngine.REMEDIES.get(yongsin, RemedyEngine.REMEDIES["Earth"])
        return {
            "yongsin": yongsin,
            "remedy": remedy,
            "feng_shui_tip": f"Facing {remedy['direction']} today will enhance your {yongsin} energy."
        }
