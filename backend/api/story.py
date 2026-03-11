import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional

router = APIRouter(prefix="/story", tags=["story"])

# Replace with your actual API key or use environment variables
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_ACTUAL_API_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)

class StoryInput(BaseModel):
    name: str
    mbti: str
    pillars: Dict[str, str]
    elements: Dict[str, float]
    pro_oracle: Optional[Dict] = None
    vitality: Optional[Dict] = None
    face_metrics: Optional[Dict] = None
    palm_metrics: Optional[Dict] = None

@router.post("/generate")
async def generate_story(data: StoryInput):
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        primary_element = max(data.elements, key=lambda k: data.elements[k])
        
        gyeokguk = data.pro_oracle.get('gyeokguk', 'Unknown') if data.pro_oracle else 'Unknown'
        yongsin = data.pro_oracle.get('yongsin', 'Unknown') if data.pro_oracle else 'Unknown'

        prompt = f"""
        당신은 운명의 모든 실타래를 엮는 '운명의 실잣는 이 (The Weaver of Fate)'이자 30년 경력의 명리 대가입니다.
        사용자의 신체 계측, 사주 격국, 용신, 심리 데이터를 바탕으로 단 하나의 완벽한 서술을 작성하세요.

        데이터 셋:
        - 이름: {data.name}
        - MBTI: {data.mbti}
        - 오행: {primary_element} ({data.elements[primary_element]}%)
        - 격국(格局): {gyeokguk}
        - 용신(用神): {yongsin}
        - 바이오 리듬(Vitality): {data.vitality.get('score', 100) if data.vitality else 100}%
        - 관상 하이라이트: {data.face_metrics}
        - 손금 하이라이트: {data.palm_metrics}

        [서술 가이드라인: 기-승-전-결]
        1. [기: 선천적 그릇]: 사주 격국({gyeokguk})과 용신({yongsin})을 바탕으로 대가의 관점에서 그릇의 크기와 용도를 논합니다.
        2. [승: 현재의 발현]: 관상 비율과 MBTI의 상관관계를 다룹니다. (예: "창의적인 {data.mbti} 성향이 이목구비의 어느 기운에서 발현되는가")
        3. [전: 변화의 실마리]: 손바닥의 선과 언덕의 발달도, 그리고 용신의 흐름을 통해 다가올 운명의 변화를 짚어줍니다.
        4. [결: 마스터 가이드]: 3D 디지털 트윈 스캔과 현재 운세를 결합하여 가장 강력한 행운의 비기를 남깁니다.

        [주의사항]
        - 반드시 "당신의 3D 디지털 트윈 계측치가 증명하듯..." 같은 문구를 사용해 기술적 신뢰감을 부여하세요.
        - 언어: 한국어. 문체: 고풍스러우면서도 통찰력 있는 모던 오리엔탈 스타일.
        - ⚠️ 중요: 사용자의 MBTI({data.mbti})를 절대 기준으로 삼고 다른 MBTI를 유추하거나 언급하지 마세요. (MBTI 정합성 유지)
        - 오리지널 애니메이션/영화 캐릭터를 한 명 매칭하여 서술에 포함해 주세요. 이 캐릭터는 사용자의 사주와 MBTI 시너지에 완벽히 부합해야 합니다.

        마크다운 형식으로 출력해 주세요.
        """
        
        response = model.generate_content(prompt)
        return {"story": response.text}
    except Exception as e:
        # Fallback story in case of API issues
        return {
            "story": f"## {data.name}님을 위한 운명의 조언\n\n현재 우주의 기운이 {primary_element}의 흐름을 따라 강하게 요동치고 있습니다. {data.mbti}의 지혜와 {gyeokguk}의 기운을 믿고 나아가세요. 당신의 앞길에 밝은 별빛이 함께하기를 기원합니다."
        }
