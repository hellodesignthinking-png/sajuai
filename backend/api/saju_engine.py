from typing import Dict, List, Tuple
from korean_lunar_calendar import KoreanLunarCalendar

# Ten Heavenly Stems (천간)
STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
# Twelve Earthly Branches (지지)
BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]

# Five Elements Mapping
ELEMENTS_MAP = {
    # Stems
    "갑": "목", "을": "목",
    "병": "화", "정": "화",
    "무": "토", "기": "토",
    "경": "금", "신": "금",
    "임": "수", "계": "수",
    # Branches
    "인": "목", "묘": "목",
    "사": "화", "오": "화",
    "진": "토", "미": "토", "술": "토", "축": "토",
    "신": "금", "유": "금",
    "해": "수", "자": "수"
}

class SajuEngine:
    def __init__(self):
        self.calendar = KoreanLunarCalendar()

    def get_pillars(self, year: int, month: int, day: int, hour: int = None, is_lunar: bool = False) -> Dict:
        """
        Calculates Saju Pillars (Year, Month, Day, Hour).
        Note: This is a simplified version using KoreanLunarCalendar logic for demonstration.
        For a production app, a full Manse-ryeok (만세력) library or API is recommended.
        """
        if is_lunar:
            self.calendar.setLunarDate(year, month, day, False)
            solar_date = self.calendar.getSolarIsoFormat()
        else:
            self.calendar.setSolarDate(year, month, day)
            
        # Extract Gapja (갑자) strings: "갑자", "을축" 등
        # KoreanLunarCalendar provides Korean Gapja strings for Year, Month, Day
        c = self.calendar
        year_pillar = c.getKoreanGapjaString().split()[0]
        month_pillar = c.getKoreanGapjaString().split()[1]
        day_pillar = c.getKoreanGapjaString().split()[2]
        
        # Hour calculation is more complex in Saju, simplified here
        # Typically based on the day stem and the hour range
        hour_pillar = self._calculate_hour_pillar(day_pillar[0], hour) if hour is not None else "모름"

        pillars = {
            "year": year_pillar,
            "month": month_pillar,
            "day": day_pillar,
            "hour": hour_pillar
        }
        
        return pillars

    def _calculate_hour_pillar(self, day_stem: str, hour: int) -> str:
        # Simplified hour pillar calculation logic (Si-du-beop)
        idx = (hour + 1) // 2 % 12
        branch = BRANCHES[idx]
        # Stem depends on Day Stem
        stem_start_idx = (STEMS.index(day_stem) % 5) * 2
        stem = STEMS[(stem_start_idx + idx) % 10]
        return f"{stem}{branch}"

    def analyze_five_elements(self, pillars: Dict[str, str]) -> Dict[str, float]:
        counts = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}
        total_count = 0
        
        for p in pillars.values():
            if p == "모름" or len(p) < 2: continue
            stem, branch = p[0], p[1]
            if stem in ELEMENTS_MAP:
                counts[ELEMENTS_MAP[stem]] += 1
                total_count += 1
            if branch in ELEMENTS_MAP:
                counts[ELEMENTS_MAP[branch]] += 1
                total_count += 1
            
        distribution = {k: (v / total_count * 100) if total_count > 0 else 0 for k, v in counts.items()}
        return distribution

    def get_day_stem(self, day_pillar: str) -> str:
        return day_pillar[0] if day_pillar else ""

    def calculate_daeun(self, year_pillar: str, month_pillar: str, is_male: bool) -> Dict:
        """
        Calculates Dae-un (10-year cycles).
        Logic: Forward/Backward rotation based on Year Stem polarity and Gender.
        """
        year_stem = year_pillar[0]
        # Yang stems: 갑, 병, 무, 경, 임
        is_yang_year = STEMS.index(year_stem) % 2 == 0
        
        # Forward if (Male & Yang Year) or (Female & Yin Year)
        is_forward = (is_male == is_yang_year)
        
        month_stem_idx = STEMS.index(month_pillar[0])
        month_branch_idx = BRANCHES.index(month_pillar[1])
        
        daeun_list = []
        for i in range(1, 11):
            offset = i if is_forward else -i
            stem = STEMS[(month_stem_idx + offset) % 10]
            branch = BRANCHES[(month_branch_idx + offset) % 12]
            daeun_list.append(f"{stem}{branch}")
            
        return {
            "is_forward": is_forward,
            "daeun_cycles": daeun_list,
            "start_age": 5 # Simplified start age for demo
        }

    def determine_gyeokguk(self, month_pillar: str) -> str:
        """
        Determines Gyeok-guk (格局) based on the month branch (월지).
        Simplified logic for demonstration.
        """
        month_branch = month_pillar[1]
        # Traditional matching: In-Sin-Sa-Hae (Growth), Ja-Oh-Myo-Yu (Peak), Jin-Sool-Chuk-Mi (Tomb)
        if month_branch in ["자", "오", "묘", "유"]:
            return "왕신격 (Peak Structure)"
        elif month_branch in ["인", "신", "사", "해"]:
            return "생신격 (Growth Structure)"
        else:
            return "잡기격 (Miscellaneous Structure)"

    def find_yongsin(self, elements: Dict[str, float], season: str) -> str:
        """
        Calculates Yong-sin (用神, Useful God).
        Focus on Eok-bu (Balance) and Jo-hoo (Season).
        """
        # 1. Jo-hoo (Seasonality)
        if season in ["Winter", "Summer"]:
            # Needs temperature balance
            return "Fire" if season == "Winter" else "Water"
        
        # 2. Eok-bu (Strength balance)
        weakest = min(elements, key=elements.get)
        return weakest

    def analyze_interactions(self, pillars: Dict[str, str]) -> List[str]:
        """
        Identifies Hab (합) and Chung (충).
        """
        interactions = []
        stems = [p[0] for p in pillars.values()]
        branches = [p[1] for p in pillars.values()]
        
        # Example: Ja-Oh Chung
        if "자" in branches and "오" in branches:
            interactions.append("자오충 (Ja-Oh Clash)")
        # Example: Gab-Gi Hab
        if "갑" in stems and "기" in stems:
            interactions.append("갑기합 (Gab-Gi Harmony)")
            
        return interactions
