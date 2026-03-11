from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import google.generativeai as genai
import os
import json

router = APIRouter(prefix="/oracle-chat", tags=["chat"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: List[Dict[str, str]]
    current_message: str
    context: Dict[str, Any]

@router.post("/")
async def oracle_chat(data: ChatRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        
        context_summary = json.dumps(data.context, ensure_ascii=False)
        
        system_instruction = f"""
        당신은 'Fate-Sync'의 마스터 오라클입니다. 
        다음의 분석 결과({context_summary})를 완벽히 숙지하고 사용자의 질문에 답하세요.
        
        [가이드라인]
        1. 사용자의 사주({data.context.get('saju', {}).get('pillars', 'N/A')})와 관상/손금 분석 결과 데이터를 적극적으로 근거로 들어 답변할 것.
        2. 답변은 자애롭고 신비로운 어조를 유지하되, 실질적인 해결책을 줄 것.
        3. 리포트에 명시되지 않은 구체적 질문이라도 제공된 사주 원리를 바탕으로 대가답게 추론하여 답할 것.
        4. 한국어로 답변하세요.
        """
        
        # Build chat session with history
        history_parts = []
        for msg in data.history:
            role = "user" if msg['role'] == 'user' else "model"
            history_parts.append({"role": role, "parts": [msg['text']]})
            
        chat = model.start_chat(history=history_parts)
        
        response = chat.send_message(
            f"{system_instruction}\n\n사용자 질문: {data.current_message}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.8,
                top_p=0.9,
                max_output_tokens=1000,
            )
        )
        
        return {"reply": response.text}
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return {"reply": "우주의 기운이 잠시 흩어졌습니다. 다시 한 번 말씀해 주시겠습니까?"}
