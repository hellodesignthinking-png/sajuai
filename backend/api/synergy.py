from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import google.generativeai as genai
import os
import json

router = APIRouter(prefix="/synergy", tags=["synergy"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_ACTUAL_API_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)

class MemberData(BaseModel):
    name: str
    birthDate: Optional[str] = "알수없음"
    birthTime: Optional[str] = "알수없음"
    birthPlace: Optional[str] = "알수없음"
    mbti: Optional[str] = "알수없음"
    concern: Optional[str] = "알수없음"
    faceStats: Optional[dict] = {}
    palmStats: Optional[dict] = {}
    faceImageBase64: Optional[str] = None
    saju: Optional[Dict[str, Any]] = {}

class SynergyRequest(BaseModel):
    mode: str
    members: List[MemberData]

@router.post("/analyze-synergy")
async def analyze_synergy(data: SynergyRequest):
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        face_harmony_text = "관상 데이터 부족"
        face_harmony_score = 80
            
        members_data_str = ""
        for i, member in enumerate(data.members):
            members_data_str += f"""
            [사람{i+1}]
            이름: {member.name}
            출생지: {member.birthPlace} (진태양시 보정용)
            MBTI: {member.mbti}
            사주: {member.saju}
            고민: {member.concern}
            관상 요약: {member.faceStats}
            손금 요약: {member.palmStats}
            """

        system_prompt = f"""
        당신은 30년 경력의 명리학자이자 비즈니스 팀 빌딩 마스터인 '마스터 오라클'입니다.
        입력된 {len(data.members)}명의 4차원 데이터(사주 오행 합/충, MBTI 상성, 관상의 기운, 손금의 활동성)를 교차 분석하세요.
        모드: {data.mode}

        [분석 가이드라인]
        1. 사주 만세력 산출 시, 출생지(birthPlace) 데이터를 기반으로 한국 표준시와 해당 지역 경도의 오차를 반영(진태양시 보정)하여 보다 정밀한 오행을 산출하세요.
        2. 사주 오행과 MBTI를 결합하여 팀 내 역할을 반드시 'Leader', 'Strategist', 'Supporter', 'Engine' 중 하나로 수학적(오행 점수 기준)으로 할당하세요.
        3. 단순한 결과 나열이 아닌, 사용자의 '고민(concern)'을 분석의 핵심 키워드로 삼아, 이를 해결하기 위한 '3단계 실행 대안(Alternative Solution)'을 리포트에 포함하세요.

        [데이터]
        {members_data_str}
        관상 조화도 측정 결과: {face_harmony_text} (점수: {face_harmony_score})

        반드시 다음 JSON 구조로 응답하세요:
        {{
            "mode": "{data.mode}",
            "synergyScore": 88,
            "overallSummary": "융합되었을 때 발생하는 강력한 운명적 시너지와 장점 (Pros)",
            "businessAdvice": "팀의 비즈니스 충돌 지점(Cons) 및 개운법(보완, Remedy)과 피해야 할 행동(Warning)",
            "loveAdvice": "연애 시너지 조언 (연애 모드일 경우)",
            "worryResolution": "입력된 고민(concern)에 대한 AI 마스터의 '운명 행동 로드맵'. 반드시 3단계로 구성하라: 1단계(인식) - 심리학적 관점(MBTI 인지 기능)으로 문제의 본질을 진단, 2단계(시기) - 명리학적 시기(현재 대운/세운에서 관성·재성·인성의 기운 흐름)를 근거로 최적의 행동 타이밍 제시, 3단계(실행) - MBTI 성향에 맞는 구체적 행동 계획을 사주 오행의 보완법과 결합하여 제시. 각 단계를 '\\n'으로 명확히 구분하라.",
            "faceHarmonyScore": {face_harmony_score},
            "faceHarmonyAnalysis": "{face_harmony_text}",
            "people": [
                {{
                    "name": "{data.members[0].name}",
                    "summary": "핵심 기질 요약",
                    "strengths": ["장점1", "장점2"],
                    "weaknesses": ["단점1", "단점2"],
                    "roleInRelation": "Leader / Strategist / Supporter / Engine 중 하나 할당",
                    "cautionsForOther": ["상대를 위해 조심할 점"],
                    "cartoonInfo": {{
                        "characterName": "타로 캐릭터 명",
                        "description": "운명적 일치 요약"
                    }}
                }}
            ],
            "detailedScores": {{
                "communication": 80,
                "trust": 90,
                "problemSolving": 85,
                "overallStability": 88
            }}
        }}

        (people 배열은 members 배열 길이에 맞게 모두 작성해주세요)
        """
        
        # Parse JSON output robustly
        response = model.generate_content(system_prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[-1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[-1].split("```")[0]
            
        try:
            result_json = json.loads(text.strip())
        except Exception as e:
            result_json = {
                "mode": data.mode,
                "synergyScore": 85,
                "overallSummary": f"오류 발생: {str(e)}",
                "people": [{"name": m.name, "summary": "N/A", "strengths": [], "weaknesses": [], "roleInRelation": "N/A", "keys":[]} for m in data.members],
                "detailedScores": {"communication": 80, "trust": 80, "problemSolving": 80, "overallStability": 80}
            }
            
        return {"result": result_json}
    except Exception as e:
        return {"result": {"overallSummary": f"API 오류: {str(e)}"}}
