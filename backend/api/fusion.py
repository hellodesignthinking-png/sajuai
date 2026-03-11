"""
V36-Backend: 하이퍼-퓨전 엔진 (Hyper-Fusion Engine)

다인원 데이터(사주 + 관상 + 손금 + MBTI + 고민)를 융합하여
- 캐릭터 타로 프롬프트
- 3단계 고민 해결 로드맵
- 팀 오행 상생 분석
- 싱크로율 계산
을 생성하는 핵심 API 엔드포인트.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
import json
import re

from .solar_correction import get_corrected_hour
from .synthesis_engine import ConflictResolver, SyncScoreCalculator

router = APIRouter(prefix="/fusion", tags=["fusion"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

# ── Pydantic 스키마 ──────────────────────────────────────────────────────────

class FaceStats(BaseModel):
    symmetry: Optional[float] = 0.0        # 좌우 대칭도 (0~100)
    golden_ratio: Optional[float] = 0.0    # 황금비율 근접도
    eyes_sharpness: Optional[float] = 0.0  # 눈의 날카로움
    jaw_strength: Optional[float] = 0.0   # 턱선 강인함
    forehead_ratio: Optional[float] = 0.0  # 이마 비율 (상정)
    mid_face_ratio: Optional[float] = 0.0  # 중정 비율
    lower_face_ratio: Optional[float] = 0.0  # 하정 비율
    raw: Optional[Dict[str, Any]] = {}

class PalmStats(BaseModel):
    life_line_depth: Optional[float] = 0.0   # 생명선 깊이
    head_line_length: Optional[float] = 0.0  # 지혜선 길이
    heart_line_curve: Optional[float] = 0.0  # 감정선 곡률
    fate_line_present: Optional[bool] = False  # 운명선 존재 여부
    raw: Optional[Dict[str, Any]] = {}

class MemberData(BaseModel):
    name: str
    gender: str = "M"
    birthDate: str = ""       # YYYY-MM-DD
    birthTime: str = ""       # HH:MM
    birthPlace: str = "서울"
    isLunar: bool = False
    mbti: str = ""
    concern: str = ""
    faceStats: Optional[FaceStats] = None
    palmStats: Optional[PalmStats] = None
    saju: Optional[Dict[str, Any]] = {}   # 이미 계산된 사주 기둥

class FusionRequest(BaseModel):
    mode: str  # 'personal' | 'synergy' | 'business'
    category: Optional[str] = None  # V41: '총운' | '재물' | '인연' | '건강' | '택일'
    members: List[MemberData]

# ── 헬퍼: 관상 수치 → 텍스트 요약 ───────────────────────────────────────────

def face_stats_to_text(fs: Optional[FaceStats], name: str) -> str:
    if not fs:
        return f"{name}: 관상 데이터 미제공"
    
    lines = []
    if fs.symmetry is not None:
        level = "매우 높음" if fs.symmetry > 85 else "보통" if fs.symmetry > 65 else "낮음"
        lines.append(f"  · 좌우 대칭도 {fs.symmetry:.1f}% ({level})")
    if fs.eyes_sharpness:
        lines.append(f"  · 눈의 날카로움(예리함) {fs.eyes_sharpness:.1f}%")
    if fs.jaw_strength:
        lines.append(f"  · 턱선 강인함(의지력) {fs.jaw_strength:.1f}%")
    if fs.forehead_ratio is not None:
        sanjong = "발달" if fs.forehead_ratio > 0.35 else "보통"
        lines.append(f"  · 이마(상정): {sanjong} — 지적 직관력 {'강' if sanjong == '발달' else '보통'}")
    if fs.golden_ratio is not None:
        lines.append(f"  · 황금비율 근접도 {fs.golden_ratio:.1f}%")
    
    return f"{name}의 관상:\n" + "\n".join(lines) if lines else f"{name}: 관상 상세 없음"


def palm_stats_to_text(ps: Optional[PalmStats], name: str) -> str:
    if not ps:
        return f"{name}: 손금 데이터 미제공"
    lines = []
    if ps.life_line_depth:
        lines.append(f"  · 생명선: 깊이 {ps.life_line_depth:.1f} (생명력/체력)")
    if ps.head_line_length:
        lines.append(f"  · 지혜선: 길이 {ps.head_line_length:.1f} (사고의 깊이)")
    if ps.heart_line_curve:
        lines.append(f"  · 감정선: 곡률 {ps.heart_line_curve:.1f} (감수성)")
    if ps.fate_line_present is not None:
        lines.append(f"  · 운명선: {'존재' if ps.fate_line_present else '미미함'}")
    return f"{name}의 손금:\n" + "\n".join(lines) if lines else f"{name}: 손금 상세 없음"


# ── 프롬프트 빌더 ─────────────────────────────────────────────────────────────

def build_fusion_prompt(data: FusionRequest, solar_corrections: List[dict]) -> str:
    mode_map = {
        "personal": "개인 운명 심층 분석",
        "synergy":  "연애/인맥 궁합 및 영혼 싱크로율",
        "business": "비즈니스 팀 빌딩 & 상생 구조 분석"
    }
    # V41: 5대 카테고리 목적 지향 분석
    category_map = {
        "총운": "[총운/명반] 생애 주기 & 아키타입 타로 — 사주 + 자미두수 내부 계산 + 관상 12궁 매핑",
        "재물": "[재물/성공] 3단계 비즈니스 로드맵 — 손금 재운선 + MBTI 성취욕 + 사주 재성 분석",
        "인연": "[인연/결혼] 영혼 싱크로율 & 갈등 해결법 — 2인 관상 궁합 + 점성술 호환 + 감정선 분석",
        "건강": "[건강/기질] 신체 에너지 밸런스 — 사주 오행 허실 + 관상 기색 + 생명선 깊이",
        "택일": "[택일/방향] 행운의 좌표 & 이동 방향 가이드 — 기문둔갑 원리 + 오행 방위 + 대운 타이밍"
    }
    mode_text = mode_map.get(data.mode, "개인 분석")
    category_text = category_map.get(data.category or "", "")
    focus_instruction = f"\n⭐ 분석 집중 카테고리: {category_text}\n" if category_text else ""

    member_blocks = []
    for i, m in enumerate(data.members):
        sc = solar_corrections[i] if i < len(solar_corrections) else {}
        corrected_time = sc.get("true_solar_time", f"{m.birthDate} {m.birthTime}")
        correction_min = sc.get("total_correction_min", 0)

        saju_str = json.dumps(m.saju, ensure_ascii=False) if m.saju else "미계산"
        face_text = face_stats_to_text(m.faceStats, m.name)
        palm_text = palm_stats_to_text(m.palmStats, m.name)

        block = f"""
━━━ [인물 {i+1}] {m.name} ({m.gender})  ━━━
▸ 출생: {m.birthDate} {m.birthTime} / {m.birthPlace} (KST)
▸ 진태양시 보정: {corrected_time} (경도 보정 {correction_min:+.1f}분)
▸ MBTI: {m.mbti or '미입력'}
▸ 사주 기둥: {saju_str}
▸ {face_text}
▸ {palm_text}
▸ 핵심 고민: "{m.concern or '(고민 미입력)'}"
"""
        member_blocks.append(block)

    members_text = "\n".join(member_blocks)

    tarot_card_instruction = ""
    if data.members:
        m0 = data.members[0]
        fs0 = m0.faceStats
        eye_sharp = fs0.eyes_sharpness if fs0 and fs0.eyes_sharpness is not None else 0
        jaw_strong = fs0.jaw_strength if fs0 and fs0.jaw_strength is not None else 0

        eye_desc = f"날카로운 눈매(sharpness {eye_sharp:.0f}%)" if eye_sharp > 70 else "온화한 눈매"
        jaw_desc = f"강인한 턱선" if jaw_strong > 70 else "유연한 턱선"
        tarot_card_instruction = f"""
▸ Character Tarot Design Prompt (영어, Midjourney/DALL-E 용):
   "{m0.name}'s destiny archetype as a classic Rider-Waite tarot card character,
    anime-style illustration, {eye_desc}, {jaw_desc},
    wearing ornate golden ceremonial robes,
    mystical background with celestial constellations,
    card frame engraved with golden Celtic borders,
    dramatic lighting, deep indigo and gold color palette,
    ultra detailed, museum quality, 4k"
"""

    prompt = f"""
[System Instruction: Grand Oracle Fusion — V41]
당신은 동서양 10가지 이상의 점술(사주명리, 자미두수, 타로, 서양점성술, 숙요, 기문둔갑, 손금, 관상, MBTI 심리학, 육임)에 정통한 'Fate-Sync 그랜드 마스터 오라클'입니다.

■ 핵심 운영 원칙 (Grand Oracle Protocol):
1. [진태양시] 진태양시가 보정된 시각으로 사주 시주(時柱)를 재해석하세요.
2. [교차 검증] 사주 + 관상 + 손금 + MBTI + 점성술이 동시에 가리키는 공통 운명적 징조를
   '확정적 미래'로 제시하세요. 단 하나의 도구만 지시하면 '잠재적 가능성'으로 표기하세요.
3. [12궁 얼굴 매핑] 관상 수치 데이터에서 자미두수의 12궁(명궁·재백궁·관록궁 등)과
   대응되는 안면 부위를 해석에 포함하세요:
   • 이마(상정) → 관록궁/부모궁 (지적 직관, 초년운)
   • 눈(중정) → 명궁/관록궁 (핵심 기질, 사회적 지위)
   • 코 → 재백궁 (재물운, 자존감)
   • 입/턱(하정) → 전택궁/전구궁 (만년운, 실행력)
4. [행성구 & 점성술] 손금 수치에서:
   • 생명선 → 태양 기운 (생명력/자아)
   • 지혜선 → 수성 기운 (지적 능력/소통)
   • 감정선 → 금성 기운 (사랑/감수성)
   운명선이 발달 → 목성 기운 강 (리더십/야망)
5. [트라이어드 키워드] [기질(MBTI) + 운때(사주) + 외형(관상)] 교차점에서 3개 키워드 생성.
   예: "냉철한(INTJ/금기운) + 편재운 + 날카로운 눈매" → #냉철한_재력가 (Unique)
7. [V44 & V45: Soul-Sync Fusion] 사용자의 자미두수 주성(Star), MBTI, 사주 지배 오행을 결합하여 '단 하나의 페르소나'를 창조하세요.
   • Star-Soul: 영혼의 본질 (Why - 목적)
   • MBTI: 세상과 소통하는 현대적 도구 (How - 수단)
   • Energy: 현재 흐르고 있는 우주적 동력 (When - 타이밍)
   이 셋의 시너지를 분석하여 `soulSyncAnalysis` 객체에 담으세요.
8. [V45: Destiny Flex Masterpiece] 사용자가 SNS에 공유할 수 있는 '박물관급 예술 작품'의 구성 요소를 생성하세요. 고유 시리얼 번호(`FS-V45-####`)를 포함하세요.

{focus_instruction}
분석 대상 ({len(data.members)}명):
{members_text}
{tarot_card_instruction}

━━━ 필수 출력 JSON 구조 (다른 텍스트 없이 JSON만 출력) ━━━
{{
  "mode": "{data.mode}",
  "category": "{data.category or '총운'}",
  "synergyScore": 88,
  "characterTarotPrompt": "영어 DALL-E 프롬프트",
  "tarotCardName": "THE MAGICIAN",
  "fusionNarrative": "오행/관상/MBTI/점성술을 융합한 운명 서사 (300자 이상)",
  "overallSummary": "핵심 시너지 요약",
  "businessAdvice": "충돌 지점 및 개운법",
  "loveAdvice": "연애 시너지 (synergy 모드)",
  "worryResolution": "## Step 1: 인식\\n...\\n\\n## Step 2: 타이밍\\n...\\n\\n## Step 3: 실행\\n...",
  "oracleKeywords": ["키워드1", "키워드2", "키워드3"],
  "soulSyncAnalysis": {{
    "personaTitle": "예술적 아키타입 칭호 (예: 천상의 지휘관)",
    "personaSubtitle": "영문 칭호 (예: The Celestial Commander)",
    "personaLogic": "자미두수 주성과 MBTI 인지 기능이 융합된 심층 논리 (150자 내외)",
    "energyMessage": "현재 사주 오행이 이 결합체에 주는 가속/제동의 힘 (100자 내외)",
    "oracleGambit": "MBTI의 약점을 명리학적으로 보완하는 마스터의 한 수 (150자 내외)",
    "synergyScore": 95,
    "grandMasterpieceSerial": "FS-V45-XXXX (X는 숫자/영문 랜덤)"
  }},
  "solarCorrectionSummary": "진태양시 보정 요약",
  "grandOracleReport": {{
    "분류": "{data.category or '총운'}",
    "교차검증결론": "모든 점술이 일치하는 확정적 운명 징조",
    "인생흐름": "[총운] 생애 주기 분석 및 현재 대운 위치",
    "직업성공": "[재물] 사주 재성 + 손금 재운선 기반 성공 전략",
    "관계본질": "[인연] 관상 궁합 + 감정선 기반 관계 본질",
    "건강에너지": "[건강] 오행 허실 + 생명선 기반 신체 에너지",
    "택일방향": "[택일] 현재 행운 방위 및 이동 추천 방향",
    "12궁매핑": "관상 수치와 자미두수 12궁의 일치도 분석",
    "행성구분석": "손금 수치와 서양 점성술 행성 기운 대응 분석"
  }},
  "people": [
    {{
      "name": "{data.members[0].name if data.members else ''}",
      "summary": "핵심 기질 요약 (2~3문장)",
      "element": "화",
      "dayMasterElement": "화",
      "strengths": ["강점1", "강점2", "강점3"],
      "weaknesses": ["약점1", "약점2"],
      "roleInRelation": "Leader",
      "cautionsForOther": ["조심할 점1"],
      "cartoonInfo": {{
        "characterName": "타로 캐릭터명(한/영)",
        "characterDescription": "캐릭터 외형 및 기질 묘사",
        "originWork": "운명 원형 카드",
        "synergyScore": 88,
        "cartoonImageUrl": null
      }}
    }}
  ],
  "detailedScores": {{
    "communication": 80,
    "trust": 90,
    "problemSolving": 85,
    "overallStability": 88
  }},
  "pros": "장점 상세",
  "cons": "단점/주의사항 상세",
  "remedy": "개운 처방 (오행 보완 방법)"
}}

(people 배열은 members 수와 동일하게 모두 채워주세요)
"""
    return prompt


# ── JSON 파서 (마크다운 코드블록 제거) ───────────────────────────────────────

def safe_parse_json(text: str) -> dict:
    """Gemini 응답에서 JSON을 안전하게 파싱합니다."""
    # 코드블록 제거
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("```").strip()
    
    # 첫 번째 { 와 마지막 } 사이만 추출
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end+1]
    
    return json.loads(text)


# ── 기본 fallback 응답 ────────────────────────────────────────────────────────

def fallback_response(data: FusionRequest, error: str = "") -> dict:
    names = [m.name for m in data.members]
    return {
        "mode": data.mode,
        "synergyScore": 82,
        "characterTarotPrompt": "anime tarot card character, golden celestial robes, mystical",
        "tarotCardName": "THE HERMIT",
        "fusionNarrative": f"{'&'.join(names)}의 운명 데이터를 융합 중 오류가 발생했습니다. {error}",
        "overallSummary": "분석 요청이 처리되었습니다.",
        "businessAdvice": "재시도 해주세요.",
        "loveAdvice": "",
        "worryResolution": "## Step 1: 인식\n잠시 후 다시 시도해 주세요.",
        "oracleKeywords": ["재시도 필요"],
        "people": [
            {
                "name": m.name,
                "summary": "분석 준비 중",
                "element": "수", "dayMasterElement": "수",
                "strengths": [], "weaknesses": [],
                "roleInRelation": "Unknown",
                "cautionsForOther": [],
                "cartoonInfo": {
                    "characterName": m.name,
                    "characterDescription": "",
                    "originWork": "Fate-Sync",
                    "synergyScore": 82,
                    "cartoonImageUrl": None
                }
            }
            for m in data.members
        ],
        "detailedScores": {
            "communication": 80, "trust": 80,
            "problemSolving": 80, "overallStability": 80
        },
        "pros": "", "cons": "", "remedy": "",
        "solarCorrectionSummary": ""
    }


# ── 메인 엔드포인트 ───────────────────────────────────────────────────────────

@router.post("/analyze-fusion")
async def analyze_fusion(data: FusionRequest):
    """
    하이퍼-퓨전 분석 엔드포인트.
    
    1. 각 멤버의 진태양시를 보정
    2. 관상/손금/MBTI 수치를 텍스트로 변환
    3. Gemini Pro에 하이퍼-퓨전 프롬프트 전송
    4. JSON 파싱 후 반환
    """
    try:
        # 1. 진태양시 보정
        solar_corrections = []
        for m in data.members:
            correction = get_corrected_hour(
                birth_date=m.birthDate,
                birth_time=m.birthTime,
                city_name=m.birthPlace or "서울"
            )
            solar_corrections.append(correction)

        # 2. 프롬프트 생성
        prompt = build_fusion_prompt(data, solar_corrections)

        # 3. Gemini 호출
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={
                "temperature": 0.85,
                "top_p": 0.95,
                "max_output_tokens": 4096,
                "response_mime_type": "application/json",
            }
        )
        response = model.generate_content(prompt)
        raw_text = response.text

        # 4. JSON 파싱
        try:
            result_json = safe_parse_json(raw_text)
        except json.JSONDecodeError:
            result_json = fallback_response(data, "JSON 파싱 실패")

        # 5. solar_corrections 메타데이터 첨부
        result_json["_solarCorrections"] = solar_corrections

        return {"result": result_json}

    except Exception as e:
        return {"result": fallback_response(data, str(e))}


@router.post("/solar-correction")
async def solar_correction_only(
    birth_date: str,
    birth_time: str,
    city: str = "서울"
):
    """
    진태양시 보정만 수행하는 경량 엔드포인트.
    프론트엔드에서 실시간 보정값을 미리 보여줄 때 사용.
    """
    correction = get_corrected_hour(birth_date, birth_time, city)
    return correction
