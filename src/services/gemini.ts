import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserInput, AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

function buildPrompt(input: UserInput, currentYear: number): string {
  const age = currentYear - input.birthYear;
  const hourText = input.birthHour === -1 ? '시간 모름' : `${input.birthHour}시`;
  const genderText = input.gender === 'male' ? '남성' : '여성';
  const mbtiText = input.mbti === '모름' ? 'MBTI 불명' : input.mbti;
  const calText = input.calendarType === 'lunar' ? '음력' : '양력';

  return `너는 커리어 전략 AI 책사 제갈량이다. 듣기 좋은 말 말고 날카롭고 솔직하게 계산해라.
사주(四柱), 서양 점성술(Western Astrology), 수비학(Numerology)을 종합 분석한다.

[사용자 정보]
생년월일시: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일 ${hourText} (${calText})
출생지: ${input.birthPlace || '한국'}
성별: ${genderText}
MBTI: ${mbtiText}
현재 연도: ${currentYear} / 현재 나이: ${age}세

아래 JSON 스키마에 정확히 맞춰 응답하라. 모든 score는 0-100 사이 정수여야 한다.
계절 주기는 12년(봄3년·여름3년·가을3년·겨울3년) 기준이며, Top5 전성기 최고점이 가을에 해당한다.

응답 스키마 (이 구조 그대로, 예시값 교체하여 반환):
{
  "top5_golden_years": [
    {"year": 2029, "score": 94, "reason": "목성 귀환 + 사주 정관대운 최고점"},
    {"year": 2032, "score": 87, "reason": "토성 귀환 + 편재운 활성화"},
    {"year": 2026, "score": 81, "reason": "태양 귀환 주기 + 역마살 발동"},
    {"year": 2037, "score": 77, "reason": "2번째 목성 귀환 + 인수운"},
    {"year": 2041, "score": 71, "reason": "중년 전환점, 새로운 분야 개척"}
  ],
  "life_cycle_scores": [
    {"age_range": "20대", "score": 62, "description": "기반 구축기. 방향 설정이 전부다."},
    {"age_range": "30대", "score": 78, "description": "성장 폭발기. 기회를 잡아라."},
    {"age_range": "40대", "score": 91, "description": "전성기. 심은 것이 결실을 맺는다."},
    {"age_range": "50대", "score": 74, "description": "수확기. 레거시를 쌓아라."},
    {"age_range": "60대", "score": 58, "description": "정리기. 다음 세대에 무엇을 남길지 생각하라."}
  ],
  "current_season": "summer",
  "season_details": {
    "season": "summer",
    "year_range": "2025-2027",
    "advice": "지금은 양적 확장의 시기다. 더 넓게 더 크게 나아가라.",
    "warning": "완벽주의를 버려라. 70% 완성도로 실행하는 것이 100%를 기다리는 것보다 낫다."
  },
  "yearly_strategy": {
    "quarter_scores": [
      {"q": "Q1 (1-3월)", "score": 71, "strategy": "기반 다지기. 스킬 업그레이드에 집중."},
      {"q": "Q2 (4-6월)", "score": 86, "strategy": "네트워킹 황금기. 적극적으로 나서라."},
      {"q": "Q3 (7-9월)", "score": 67, "strategy": "내실 다지기. 무리한 도전 자제."},
      {"q": "Q4 (10-12월)", "score": 89, "strategy": "연말 승부수. 올해의 결정을 내려라."}
    ],
    "d_day": {
      "date": "${currentYear}-06-21",
      "description": "에너지가 정점에 달하는 날. 중요한 결정을 이 날로 맞추거나 기점으로 삼아라."
    },
    "missions": [
      {"type": "즉시", "content": "LinkedIn 프로필을 전면 개편하라. 지금 당신의 스토리가 약하다."},
      {"type": "단기", "content": "3개월 내 핵심 역량을 외부에 증명할 결과물을 만들어라."},
      {"type": "장기", "content": "1년 내 당신을 대표하는 프로젝트 하나를 완성하라."}
    ]
  },
  "mbti_integration": {
    "type": "${mbtiText}",
    "career_synergy": "사주 특성과 MBTI 강점의 시너지를 2-3문장으로 분석하라.",
    "blind_spot": "MBTI 약점이 사주와 어떻게 충돌하는지 솔직하게 2문장으로 지적하라."
  },
  "sharp_feedback": "날카롭고 솔직한 3문장. 이 사람의 가장 큰 문제점과 해결책을 직설적으로.",
  "season_cycle": [
    {"season": "spring", "start_year": 2018, "end_year": 2020, "label": "과거 봄", "is_current": false},
    {"season": "summer", "start_year": 2021, "end_year": 2023, "label": "과거 여름", "is_current": false},
    {"season": "autumn", "start_year": 2024, "end_year": 2026, "label": "현재 가을", "is_current": true},
    {"season": "winter", "start_year": 2027, "end_year": 2029, "label": "다음 겨울", "is_current": false},
    {"season": "spring", "start_year": 2030, "end_year": 2032, "label": "다음 봄", "is_current": false}
  ],
  "season_guidance": {
    "season_title": "가을 — 수확과 질적 성장",
    "core_message": "지금까지 심은 씨앗의 결실을 거둘 때다. 양보다 질, 속도보다 방향.",
    "actions": [
      "시스템을 구축하라. 당신 없이도 돌아가는 구조를 만들어야 한다.",
      "전략가 파트너를 찾아라. 혼자 하는 시대는 끝났다.",
      "선택과 집중. 지금 하는 것 중 버릴 것을 버려야 진짜 수확이 온다."
    ],
    "warnings": [
      "여름의 방식으로 가을을 살면 안 된다. 이제는 양적 확장 대신 질적 깊이다.",
      "새로운 시작에 흔들리지 마라. 지금은 마무리와 수확의 시기다."
    ],
    "transition_warning": "2027년 후반부터 겨울로 전환된다. 지금부터 내실을 다져야 겨울을 버틸 수 있다.",
    "content_direction": "전문성과 인사이트. 당신이 쌓아온 경험을 콘텐츠로 만들어라.",
    "avoid_content": "화려한 성공 스토리. 지금은 깊이이지 넓이가 아니다."
  },
  "networking_guide": {
    "current_season_tip": "가을에는 함께 전략을 짤 파트너와 당신의 성과를 알아봐줄 사람이 필요하다.",
    "people_to_meet": [
      {
        "type": "전략가형 파트너",
        "reason": "가을은 혼자 수확하는 시기가 아니다. 함께 시스템을 만들 사람이 필요하다.",
        "how": "같은 분야에서 5년 이상 경력자 중 전략적 사고를 하는 사람을 찾아라."
      },
      {
        "type": "여름을 겪은 선배",
        "reason": "당신이 지금 거두는 것이 가치 있는지 검증해줄 수 있는 사람.",
        "how": "업계 커뮤니티에서 10년차 이상 선배에게 먼저 다가가라."
      }
    ],
    "avoid": "아직 여름인 사람들. 그들의 에너지에 끌려가면 당신의 가을을 망친다."
  },
  "growth_missions": [
    {
      "type": "crisis",
      "label": "극복할 위기",
      "content": "완벽주의로 인한 실행 지연. 준비가 충분하다는 확신이 올 때까지 기다리다 기회를 놓친다.",
      "action": "이번 달 70% 완성도로 무언가 하나를 세상에 내놓아라."
    },
    {
      "type": "person",
      "label": "만나야 할 사람",
      "content": "당신보다 3-5년 앞서 같은 길을 걷고 있는 사람. 그들의 실수로부터 배워라.",
      "action": "LinkedIn에서 찾아 커피챗을 요청하라. 거절당해도 10번은 시도하라."
    },
    {
      "type": "skill",
      "label": "배워야 할 것",
      "content": "데이터 기반 의사결정. 감이 아닌 숫자로 말하는 능력이 지금 당신에게 없다.",
      "action": "3개월 내 주요 성과 지표를 숫자로 측정하는 시스템을 만들어라."
    }
  ]
}`;
}

export async function analyzeCareer(input: UserInput): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error(
      'Gemini API 키가 없습니다. Vercel 환경변수 VITE_GEMINI_API_KEY를 확인해주세요.'
    );
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
    },
  });

  const currentYear = new Date().getFullYear();
  const prompt = buildPrompt(input, currentYear);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // With responseMimeType: 'application/json', the response should be clean JSON
    const parsed = JSON.parse(text) as AnalysisResult;

    // Validate required fields
    if (!parsed.top5_golden_years || !parsed.current_season) {
      throw new Error('AI 응답이 불완전합니다. 다시 시도해주세요.');
    }

    // Ensure Phase 2 fields exist (fallback for partial responses)
    if (!parsed.season_cycle) parsed.season_cycle = [];
    if (!parsed.season_guidance) {
      parsed.season_guidance = {
        season_title: '분석 중',
        core_message: '계절별 상세 분석을 불러오지 못했습니다.',
        actions: [],
        warnings: [],
        transition_warning: null,
        content_direction: '',
        avoid_content: '',
      };
    }
    if (!parsed.networking_guide) {
      parsed.networking_guide = {
        current_season_tip: '',
        people_to_meet: [],
        avoid: '',
      };
    }
    if (!parsed.growth_missions) parsed.growth_missions = [];

    return parsed;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('AI 응답을 파싱하는 데 실패했습니다. 다시 시도해주세요.');
    }
    // Re-throw with context
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Gemini API Error]', message);
    throw new Error(`분석 실패: ${message}`);
  }
}
