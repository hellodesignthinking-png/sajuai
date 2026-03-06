from typing import Dict, List, Optional

class CharacterEngine:
    """
    Synchronicity: Maps real-world Saju/Vision data to Manga/Anime archetypes.
    """
    CHARACTERS = [
        {
            "name": "Luffy (One Piece)",
            "archetype": "The Sun King",
            "element": "Fire",
            "mbti": "ENFP",
            "style_id": "shonen_brushed",
            "narrative_hook": "Luffy's determination to be free mirrors your Fire-dominant Saju."
        },
        {
            "name": "Tanjiro (Demon Slayer)",
            "archetype": "The Water Breather",
            "element": "Water",
            "mbti": "ENFJ",
            "style_id": "ufo_painting",
            "narrative_hook": "Just as Tanjiro's breathing calms his soul, your Water energy flows through your calm eye curvature."
        },
        {
            "name": "Saitama (One Punch Man)",
            "archetype": "The Stoic Metal",
            "element": "Metal",
            "mbti": "ISTP",
            "style_id": "murata_ink",
            "narrative_hook": "Simple yet absolute presence, mirroring the raw Metal strength in your palm's Life Line."
        }
    ]

    @staticmethod
    def find_sync_character(elements: Dict[str, float], mbti: str) -> Dict:
        primary = max(elements, key=elements.get)
        
        # Simple match for demo
        for char in CharacterEngine.CHARACTERS:
            if char['element'] == primary or char['mbti'][:2] == mbti[:2]:
                return char
        
        return CharacterEngine.CHARACTERS[0]

    @staticmethod
    def get_style_transfer_metadata(character_name: str) -> Dict:
        return {
            "style_engine": "IP-Adapter-FaceID",
            "base_model": "SDXL-Turbo",
            "lora_weights": f"weights/character_{character_name.lower().replace(' ', '_')}.safetensors",
            "prompt_template": "A high-quality 2D manga illustration of the user as {character_name}, sharp lines, high contrast."
        }
