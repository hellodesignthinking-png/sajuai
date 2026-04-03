import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserInput, AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);

function buildPrompt(input: UserInput, currentYear: number): string {
  const age = currentYear - input.birthYear;
  const hourText = input.birthHour === -1 ? '시간 모름' : `${input.birthHour}시`;
  const genderText = input.gender === 'male' ? '남성' : '여성';
  const mbtiText = input.mbti === '모름' ? 'MBTI 모름' : input.mbti;
  const calText = input.calendarType === 'lunar' ? '음력' : '양력';

  return `너는 나의 커리어 전략을 짜주는 책사 제갈량이다.
좋은 말만 하지 말고 날카롭고 솔직하게 계산해라.
사주(四柱), 서양 점성술(Western Astrology), 수비학(Numerology)을 종합하여 분석한다.

사용자 정보:
- 생년월일시: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일 ${hourText} (${calText})
- 출생지: ${input.birthPlace || '한국'}
- 성별: ${genderText}
- MBTI: ${mbtiText}
- 현재 연도: ${currentYear}
- 현재 나이: ${age}세

반드시 아래 JSON 스키마에 맞춰 응답하라. score는 반드시 정수(0-100)여야 한다.

{
  "top5_golden_years": [
    {"year": 2028, "score": 95, "reason": "목성 귀환과 사주 정관운이 겹치는 최고 전성기"},
    {"year": 2031, "score": 88, "reason": "화성-금성 합 + 편재운으로 사업·승진 최적"},
    {"year": 2026, "score": 82, "reason": "태양 귀환 + 생기복덕 방위 활성화"},
    {"year": 2035, "score": 78, "reason": "토성 귀환으로 커리어 재정립의 시기"},
    {"year": 2040, "score": 74, "reason": "중년 전환점, 새로운 분야 개척 가능"}
  ],
  "life_cycle_scores": [
    {"age_range": "20대", "score": 65, "description": "기반 구축기. 방향 설정이 중요하다."},
    {"age_range": "30대", "score": 80, "description": "성장 폭발기. 기회를 잡아라."},
    {"age_range": "40대", "score": 90, "description": "전성기. 지금까지 심은 것이 결실을 맺는다."},
    {"age_range": "50대", "score": 75, "description": "수확기. 레거시를 쌓아라."},
    {"age_range": "60대", "score": 60, "description": "정리기. 다음 세대에 무엇을 남길지 생각하라."}
  ],
  "current_season": "spring",
  "season_details": {
    "season": "spring",
    "year_range": "2024-2027",
    "advice": "지금은 씨앗을 뿌려야 할 때다. 단기 수익보다 장기 투자에 집중하라.",
    "warning": "봄의 들뜬 기운에 흔들리지 마라. 방향이 틀리면 봄에 심은 씨앗이 잡초가 된다."
  },
  "season_cycle": [
    {"season": "winter", "start_year": 2021, "end_year": 2024, "label": "준비기", "is_current": false},
    {"season": "spring", "start_year": 2024, "end_year": 2027, "label": "씨앗기", "is_current": true},
    {"season": "summer", "start_year": 2027, "end_year": 2030, "label": "성장기", "is_current": false},
    {"season": "autumn", "start_year": 2030, "end_year": 2033, "label": "수확기", "is_current": false}
  ],
  "season_guidance": {
    "season_title": "봄 — 씨앗을 뿌리는 시기",
    "core_message": "지금 심은 씨앗이 3년 후의 수확을 결정한다. 급하게 결실을 바라지 말고 뿌리를 깊게 내려라.",
    "actions": ["핵심 역량 하나를 집중적으로 키워라", "업계 멘토 3명을 확보하라", "온라인 존재감을 구축하라"],
    "warnings": ["단기 수익에 유혹받지 마라", "너무 많은 방향에 에너지를 분산하지 마라"],
    "transition_warning": "2027년 여름으로 전환 시 급격한 에너지 소모가 예상된다. 지금부터 체력을 비축하라.",
    "content_direction": "배움의 과정을 보여주는 콘텐츠. 성장 스토리, 시행착오, 배움의 기록.",
    "avoid_content": "완성된 척, 전문가인 척하는 콘텐츠. 봄에는 진정성이 더 중요하다."
  },
  "yearly_strategy": {
    "quarter_scores": [
      {"q": "Q1 (1-3월)", "score": 72, "strategy": "기반 다지기. 스킬 업그레이드에 집중할 것."},
      {"q": "Q2 (4-6월)", "score": 85, "strategy": "네트워킹 황금기. 적극적으로 나서라."},
      {"q": "Q3 (7-9월)", "score": 68, "strategy": "내실 다지기. 무리한 도전 자제."},
      {"q": "Q4 (10-12월)", "score": 90, "strategy": "연말 승부수. 올해의 결정을 내려라."}
    ],
    "d_day": {
      "date": "${currentYear}-06-21",
      "description": "하지(夏至). 에너지가 정점에 달하는 날. 중요한 결정을 이 시기를 기점으로 삼아라."
    },
    "missions": [
      {"type": "즉시", "content": "LinkedIn 프로필을 전면 개편하라. 지금 당신의 스토리가 약하다."},
      {"type": "단기", "content": "3개월 내 핵심 역량 하나를 외부에 증명할 결과물을 만들어라."},
      {"type": "장기", "content": "1년 내 당신을 대표하는 프로젝트 하나를 완성하라."}
    ]
  },
  "networking_guide": {
    "current_season_tip": "봄에는 멘토가 전부다. 이미 수확을 경험한 사람 곁에 있어야 한다.",
    "people_to_meet": [
      {"type": "업계 5-10년 선배", "reason": "당신이 가려는 길을 이미 걸어본 사람", "how": "LinkedIn 연결 후 커피챗 요청. 질문 3개만 가져가라."},
      {"type": "같은 성장 단계의 동료", "reason": "함께 성장하는 동반자가 필요하다", "how": "같은 고민을 하는 커뮤니티에서 찾아라."}
    ],
    "avoid": "지금 당장 성과가 없는 당신을 이용하려는 사람. 빠른 수익을 약속하는 사람은 봄에 독이다."
  },
  "growth_missions": [
    {
      "type": "crisis",
      "label": "극복할 위기",
      "content": "방향 없는 성실함의 함정. 열심히 하지만 방향이 없으면 에너지만 소진된다.",
      "action": "이번 주 안에 3년 후 목표를 한 문장으로 정의하라."
    },
    {
      "type": "person",
      "label": "만나야 할 사람",
      "content": "당신보다 3-5년 앞선 업계 선배. 그들의 실수에서 배우면 시간을 아낄 수 있다.",
      "action": "LinkedIn에서 목표 직무의 시니어 3명에게 DM을 보내라."
    },
    {
      "type": "skill",
      "label": "배워야 할 것",
      "content": "데이터로 말하는 능력. 앞으로의 커리어에서 숫자로 성과를 증명하지 못하면 도태된다.",
      "action": "SQL 또는 Python 기초 강좌를 오늘 등록하라."
    }
  ],
  "mbti_integration": {
    "type": "${mbtiText}",
    "career_synergy": "사주의 특성과 MBTI의 강점이 어떻게 시너지를 내는지 2-3문장으로 분석",
    "blind_spot": "MBTI의 약점이 사주의 어떤 면과 충돌하는지 솔직하게 2문장으로 지적"
  },
  "sharp_feedback": "날카롭고 솔직한 두세 문장. 듣기 좋은 말이 아닌 진짜 조언. 이 사람의 가장 큰 문제점과 해결책을 직설적으로."
}`;
}

export async function analyzeCareer(input: UserInput): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 설정해주세요.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const currentYear = new Date().getFullYear();
  const prompt = buildPrompt(input, currentYear);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const parsed = JSON.parse(text) as AnalysisResult;

  // Ensure Phase 2 fields have fallbacks
  return {
    ...parsed,
    season_cycle: parsed.season_cycle ?? [],
    season_guidance: parsed.season_guidance ?? null,
    networking_guide: parsed.networking_guide ?? null,
    growth_missions: parsed.growth_missions ?? [],
  };
}
