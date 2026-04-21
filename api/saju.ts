import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calcSaju, extractChar, type SajuCalcResult } from './saju-calc.js';

function extractJSON(text: string): string {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }
  if (start > 0) cleaned = cleaned.slice(start);

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    let fixed = cleaned;
    const lastComma = fixed.lastIndexOf(',');
    const lastClose = Math.max(fixed.lastIndexOf('}'), fixed.lastIndexOf(']'));
    if (lastComma > lastClose) {
      fixed = fixed.slice(0, lastComma);
    }
    const quoteCount = (fixed.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) fixed += '"';
    const openBrackets = (fixed.match(/\[/g) || []).length - (fixed.match(/\]/g) || []).length;
    const openBraces = (fixed.match(/\{/g) || []).length - (fixed.match(/\}/g) || []).length;
    for (let i = 0; i < openBrackets; i++) fixed += ']';
    for (let i = 0; i < openBraces; i++) fixed += '}';
    return fixed;
  }
}

export const config = {
  maxDuration: 60,
};

function buildCalcDataBlock(calc: SajuCalcResult, birthYear: number, lang: 'ko' | 'en'): string {
  const fp = calc.fourPillars;
  const dm = calc.dayMaster;
  const fe = calc.fiveElements;
  const seasonKo = { spring: '봄(春)', summer: '여름(夏)', autumn: '가을(秋)', winter: '겨울(冬)' };
  const seasonEn = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

  const hourStr = fp.hour
    ? `${fp.hour.heavenly}${fp.hour.earthly}`
    : (lang === 'ko' ? '시간 모름' : 'unknown');

  const luckLines = calc.majorLucks.map(l => {
    const isCurrent = calc.currentLuck && l.startAge === calc.currentLuck.startAge;
    const mark = isCurrent ? (lang === 'ko' ? ' ← 현재 대운 ★' : ' ← CURRENT ★') : '';
    return `  ${l.startAge}~${l.endAge}세 (${l.startYear}~${l.endYear}): ${l.heavenly}${l.earthly} [${l.stemElement}/${l.branchElement}]${mark}`;
  }).join('\n');

  const goldenLines = calc.goldenYears.map((g, i) =>
    `  ${i + 1}위: ${g.year}년 (${g.score}점)`
  ).join('\n');

  if (lang === 'ko') {
    return `
★ 코드 계산 사주 원국 (이 값을 반드시 그대로 사용) ★

[사주 원국]
- 년주: ${fp.year.heavenly} ${fp.year.earthly} (${extractChar(fp.year.heavenly)}${extractChar(fp.year.earthly)})
- 월주: ${fp.month.heavenly} ${fp.month.earthly} (${extractChar(fp.month.heavenly)}${extractChar(fp.month.earthly)})
- 일주: ${fp.day.heavenly} ${fp.day.earthly} (${extractChar(fp.day.heavenly)}${extractChar(fp.day.earthly)})  ← 일간
- 시주: ${hourStr}
- 일간: ${dm.heavenly} [${dm.element}, ${dm.yinYang}]

[오행] 목:${fe.wood} 화:${fe.fire} 토:${fe.earth} 금:${fe.metal} 수:${fe.water}
[용신]: ${calc.favorableElement} | [기신]: ${calc.unfavorableElement}

[대운]
${luckLines}

[커리어 계절]: ${seasonKo[calc.careerSeason]} — current_season = "${calc.careerSeason}" 절대 변경 금지
[전성기 Top5]
${goldenLines}
※ top5_golden_years year 값은 반드시 위 연도 사용`;
  } else {
    return `
★ Pre-calculated Four Pillars (use exactly) ★

[Four Pillars]
- Year: ${fp.year.heavenly} ${fp.year.earthly} (${extractChar(fp.year.heavenly)}${extractChar(fp.year.earthly)})
- Month: ${fp.month.heavenly} ${fp.month.earthly} (${extractChar(fp.month.heavenly)}${extractChar(fp.month.earthly)})
- Day: ${fp.day.heavenly} ${fp.day.earthly} (${extractChar(fp.day.heavenly)}${extractChar(fp.day.earthly)})  ← Day Master
- Hour: ${hourStr}
- Day Master: ${dm.heavenly} [${dm.element}, ${dm.yinYang}]

[Five Elements] Wood:${fe.wood} Fire:${fe.fire} Earth:${fe.earth} Metal:${fe.metal} Water:${fe.water}
[Favorable]: ${calc.favorableElement} | [Unfavorable]: ${calc.unfavorableElement}

[Major Luck Cycles]
${luckLines}

[Career Season]: ${seasonEn[calc.careerSeason]} — use "${calc.careerSeason}" for current_season, NEVER change
[Top 5 Golden Years]
${goldenLines}
※ Use EXACTLY these years for top5_golden_years`;
  }
}

function buildBasicPrompt(input: any, calc: SajuCalcResult, currentYear: number, lang: 'ko' | 'en' = 'ko'): string {
  const age = currentYear - input.birthYear;
  const hourText = input.birthHour === -1
    ? (lang === 'en' ? 'unknown' : '시간 모름')
    : `${input.birthHour}${lang === 'en' ? ':00' : '시'}`;
  const genderText = lang === 'en'
    ? (input.gender === 'male' ? 'Male' : 'Female')
    : (input.gender === 'male' ? '남성' : '여성');
  const mbtiText = input.mbti === '모름' ? (lang === 'en' ? 'Unknown' : 'MBTI 모름') : input.mbti;
  const calText = lang === 'en'
    ? (input.calendarType === 'lunar' ? 'Lunar' : 'Solar')
    : (input.calendarType === 'lunar' ? '음력' : '양력');
  const yearRange = calc.currentLuck
    ? `${calc.currentLuck.startYear}-${calc.currentLuck.endYear}`
    : `${currentYear}-${currentYear + 9}`;
  const goldenYearsList = calc.goldenYears.map(g => g.year).join(', ');

  if (lang === 'en') {
    return `You are Zhuge Liang, career strategist. Sharp and honest, no flattery.
Analyze using Saju + Western Astrology + Numerology.

User: Born ${input.birthYear}-${input.birthMonth}-${input.birthDay} ${hourText} (${calText}), ${genderText}, MBTI: ${mbtiText}, Age: ${age}
${buildCalcDataBlock(calc, input.birthYear, 'en')}

Rules:
1. current_season MUST be "${calc.careerSeason}"
2. top5_golden_years years MUST be [${goldenYearsList}]
3. All fields must cite day master ${calc.dayMaster.heavenly}(${calc.dayMaster.element}), favorable ${calc.favorableElement}, unfavorable ${calc.unfavorableElement}

Return ONLY valid JSON:
{
  "sharp_feedback": "2-3 sentences. Name day master, core tension, one action.",
  "current_season": "${calc.careerSeason}",
  "season_details": {
    "season": "${calc.careerSeason}",
    "year_range": "${yearRange}",
    "advice": "2 sentences on favorable element activation.",
    "warning": "1 sentence on unfavorable element risk."
  },
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "대운 근거 1문장"},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "대운 근거 1문장"},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "대운 근거 1문장"},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "대운 근거 1문장"},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "대운 근거 1문장"}
  ],
  "life_cycle_scores": [
    {"age_range": "20s", "score": 65, "description": "luck cycle element and effect in 1 sentence"},
    {"age_range": "30s", "score": 80, "description": "1 sentence"},
    {"age_range": "40s", "score": 90, "description": "1 sentence"},
    {"age_range": "50s", "score": 75, "description": "1 sentence"},
    {"age_range": "60s", "score": 60, "description": "1 sentence"}
  ],
  "season_cycle": ${JSON.stringify(calc.seasonCycle.map(s => ({...s, label: s.season === 'spring' ? 'Seeding' : s.season === 'summer' ? 'Growth' : s.season === 'autumn' ? 'Harvest' : 'Preparation'})))},
  "season_guidance": {
    "season_title": "title",
    "core_message": "2 sentences tied to day master.",
    "actions": ["favorable element action 1 sentence", "gap element action 1 sentence", "luck cycle strength 1 sentence"],
    "warnings": ["unfavorable element warning 1 sentence", "season trap 1 sentence"],
    "transition_warning": "1 sentence",
    "content_direction": "1 sentence",
    "avoid_content": "1 sentence"
  },
  "yearly_strategy": {
    "quarter_scores": [
      {"q": "Q1 (Jan-Mar)", "score": 72, "strategy": "element basis + 1 action"},
      {"q": "Q2 (Apr-Jun)", "score": 85, "strategy": "element basis + 1 action"},
      {"q": "Q3 (Jul-Sep)", "score": 68, "strategy": "element basis + 1 action"},
      {"q": "Q4 (Oct-Dec)", "score": 90, "strategy": "element basis + 1 action"}
    ],
    "d_day": {"date": "${currentYear}-06-21", "description": "why this date matters in 1 sentence"},
    "missions": [
      {"type": "Immediate", "content": "this week action 1-2 sentences"},
      {"type": "Short-term", "content": "3-month mission 1-2 sentences"},
      {"type": "Long-term", "content": "12-month project 1-2 sentences"}
    ]
  },
  "networking_guide": {
    "current_season_tip": "1 sentence",
    "people_to_meet": [
      {"type": "person type embodying lacking element", "reason": "1 sentence", "how": "1 sentence"},
      {"type": "person type for secondary gap", "reason": "1 sentence", "how": "1 sentence"}
    ],
    "avoid": "1 sentence"
  },
  "growth_missions": [
    {"type": "crisis", "label": "Crisis to Overcome", "content": "1-2 sentences", "action": "1 sentence"},
    {"type": "person", "label": "Person to Meet", "content": "1-2 sentences", "action": "1 sentence"},
    {"type": "skill", "label": "Skill to Acquire", "content": "1-2 sentences", "action": "1 sentence"}
  ],
  "mbti_integration": {
    "type": "${mbtiText}",
    "career_synergy": "day master + MBTI synergy 2 sentences",
    "blind_spot": "weakness 1 sentence"
  },
  "season_reasoning": {
    "saju_basis": "current luck cycle + day master relationship 2 sentences",
    "overall_reasoning": "conclusion from all 3 frameworks 2 sentences"
  }
}`;
  }

  const situationText = (input.currentSituation ?? '').toString().trim() || (lang === 'ko' ? '(미입력)' : '(not provided)');
  const specialtyText = (input.specialty ?? '').toString().trim() || (lang === 'ko' ? '(미입력)' : '(not provided)');

  return `[V63: Oracle Genesis — 4계절 커리어 동기화]
너는 명리학 마스터 오라클이다. 논문처럼 논리적이면서 장엄하고 실용적인 말투를 유지하라.
이 리포트는 단순 점술이 아니라 "커리어 전략 보고서" 수준의 분석이어야 한다.

[미션]
1. 진짜 데이터만 사용: "당신은 운이 좋습니다" 같은 범용 문구 절대 금지. 반드시 연주·월주·일주·시주 만세력과 지장간(地藏干)의 합충변화(合冲變化)를 100% 반영하라.
2. 격국(格局) 정밀 정의: 일간(${calc.dayMaster.heavenly})과 월지(${extractChar(calc.fourPillars.month.earthly)})의 관계, 지장간 본기·중기·여기를 근거로 격국을 도출하라 (정관격·편재격·식신생재격·건록격·양인격 등).
3. 인생의 4계절 커리어 로드맵: 현재 대운과 세운을 분석해 사용자가 지금 "봄(씨앗)·여름(성장)·가을(수확)·겨울(내실)" 중 어디에 있는지 명시하고 전략을 제시하라.
   - 봄(입춘~곡우): 전공 선택·새 기술 습득·진로 변경의 적기. 교육·기획·창의
   - 여름(입하~대서): 사회활동 폭발·네트워크 확장. 마케팅·실행력
   - 가을(입추~상강): 성과·승진·전문성 확립. 관리·금융·법률·전문 자격
   - 겨울(입동~대한): 지식 심화·리스크 관리. 연구·전략·멘토링
4. 커리어·전공 동기화: 오행 분포와 십성(비겁·식상·재성·관성·인성)으로 최적 전공·직업·조직 내 정치력을 진단하라.
5. 생존·성장 전략: "성공한다"가 아니라 "버려야 할 습관"과 "취해야 할 에너지"를 구체적 Action Plan으로 제시하라.

[사용자 입력]
- 생년월일시: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일 ${hourText} (${calText})
- 성별: ${genderText}, MBTI: ${mbtiText}, 나이: ${age}세
- 전문 분야: ${specialtyText}
- 현재 상황: ${situationText}

${buildCalcDataBlock(calc, input.birthYear, 'ko')}

[고정 규칙 — 절대 위반 금지]
1. current_season = "${calc.careerSeason}" 그대로 사용
2. top5_golden_years 연도 = [${goldenYearsList}] 그대로 사용
3. 모든 텍스트 필드에 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element}), 용신 ${calc.favorableElement}, 기신 ${calc.unfavorableElement} 최소 1회 이상 직접 인용
4. growth_missions, networking_guide, yearly_strategy, career_sync, relationship_code, survival_strategy는 반드시 "전문 분야(${specialtyText})"와 "현재 상황(${situationText})"을 구체적으로 반영. 일반론 금지.
5. 점수(score)는 대운/세운 오행과 용신·기신 관계를 계산해 0-99 범위로 산출. 고정된 예시값 복사 금지.
6. d_day.date는 올해 세운 중 용신이 가장 강해지는 월·일(YYYY-MM-DD)로 계산. 고정 날짜 금지.
7. 모든 텍스트 필드 최소 3문장 이상. 구체적 행동·날짜·숫자 포함. 추상적 조언 금지.

반드시 아래 JSON만 반환:
{
  "saju_summary": "사주 총평 5-7문장. 이 사람의 사주 원국 구조를 해설하라. 일간의 성격, 오행 균형/불균형, 강점과 약점, 타고난 재능과 한계를 구체적으로 설명. 용신과 기신이 왜 그렇게 결정되는지 근거 포함.",
  "yearly_fortune": "올해(${currentYear}년) 운세 5-7문장. 올해 세운의 천간지지가 이 사람의 원국/대운과 어떤 관계인지. 올해 특별히 조심할 달, 기회가 오는 달을 구체적으로 명시. 금전운/건강운/대인운을 각각 언급.",
  "sharp_feedback": "5-7문장. 일간과 핵심 긴장 구도를 직격하라. 이 사람의 가장 큰 커리어 문제점을 정면으로 지적하고, 구체적 해결책과 기한을 제시.",
  "current_season": "${calc.careerSeason}",
  "season_details": {
    "season": "${calc.careerSeason}",
    "year_range": "${yearRange}",
    "advice": "용신 활성화 조언 3-5문장. 구체적 행동과 시기 포함.",
    "warning": "기신 위험 경고 3문장. 구체적으로 피해야 할 행동과 시기."
  },
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "대운+세운 오행 근거 3문장. 구체적으로 어떤 분야에서 기회가 오는지, 무엇을 미리 준비해야 하는지."},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "대운 근거 3문장"},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "대운 근거 3문장"},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "대운 근거 3문장"},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "대운 근거 3문장"}
  ],
  "life_cycle_scores": [
    {"age_range": "20대", "score": <20대를 포함하는 대운의 천간지지 오행이 용신/기신과 어떤 관계인지 계산한 0-99 점수>, "description": "20대 대운 오행과 용신 관계를 명시하고 커리어에 미치는 영향, 핵심 행동 지침 3문장"},
    {"age_range": "30대", "score": <같은 방식으로 계산>, "description": "30대 대운 오행 + 커리어 영향 + 행동 지침 3문장"},
    {"age_range": "40대", "score": <계산값>, "description": "40대 대운 기반 3문장"},
    {"age_range": "50대", "score": <계산값>, "description": "50대 대운 기반 3문장"},
    {"age_range": "60대", "score": <계산값>, "description": "60대 대운 기반 3문장"}
  ],
  "season_cycle": ${JSON.stringify(calc.seasonCycle)},
  "season_guidance": {
    "season_title": "현재 대운 오행 연결 제목",
    "core_message": "일간과 계절 요구 3-5문장. 왜 지금이 이 계절인지 구체적으로.",
    "actions": ["용신 활용 구체적 행동 2-3문장", "부족 오행 보충 방법 2-3문장", "대운 강점 활용 전략 2-3문장"],
    "warnings": ["기신 경고 2-3문장", "이 계절 함정 2-3문장"],
    "transition_warning": "다음 대운 전환 대비 3문장",
    "content_direction": "일간 강점 살리는 방향 2-3문장",
    "avoid_content": "충돌 패턴 2-3문장"
  },
  "yearly_strategy": {
    "quarter_scores": [
      {"q": "Q1 (1-3월)", "score": <올해 세운 천간지지 + Q1 월령(寅卯辰) 오행을 용신/기신과 계산한 0-99 점수>, "strategy": "현재 전문 분야(${specialtyText})에서 Q1에 취할 구체적 행동 + 주의사항 3문장"},
      {"q": "Q2 (4-6월)", "score": <같은 방식 계산>, "strategy": "현재 상황(${situationText})을 반영한 Q2 구체적 행동 3문장"},
      {"q": "Q3 (7-9월)", "score": <계산값>, "strategy": "Q3 오행 근거 + 전문 분야 맞춤 행동 3문장"},
      {"q": "Q4 (10-12월)", "score": <계산값>, "strategy": "Q4 오행 근거 + 현재 상황에 대한 실행 권고 3문장"}
    ],
    "d_day": {"date": "<올해 ${currentYear}년 중 용신이 가장 강해지는 월·일 YYYY-MM-DD>", "description": "이 날짜가 이 원국·전문 분야에 특별한 이유 + 그날 해야 할 것 3문장"},
    "missions": [
      {"type": "즉시", "content": "이번 주 실행 미션 3문장. 현재 상황(${situationText})과 전문 분야(${specialtyText})에 바로 적용 가능한 행동+기한+기대효과"},
      {"type": "단기", "content": "3개월 미션 3문장. 전문 분야 성장 관점에서 제시"},
      {"type": "장기", "content": "12개월 프로젝트 3문장. 커리어 전환/확장 관점"}
    ]
  },
  "networking_guide": {
    "current_season_tip": "현재 계절(${calc.careerSeason})·현재 상황(${situationText})·전문 분야(${specialtyText})에 맞춘 네트워킹 전략 3문장",
    "people_to_meet": [
      {"type": "부족 오행을 체현하는 ${specialtyText} 연관 직군/역할", "reason": "전문 분야 성장에 왜 필요한지 2-3문장", "how": "현재 상황에서 접근 가능한 구체적 방법 2문장"},
      {"type": "두 번째 부족 오행 + 전문 분야 인접 유형", "reason": "2-3문장", "how": "2문장"}
    ],
    "avoid": "기신 증폭 유형 + 왜 피해야 하는지 2-3문장"
  },
  "growth_missions": [
    {"type": "crisis", "label": "극복할 위기", "content": "이 사주의 구조적 약점 + 현재 상황(${situationText})에서 실제로 발생 가능한 위기 3문장", "action": "전문 분야 안에서 취할 구체적 극복 방법 2문장"},
    {"type": "person", "label": "만나야 할 사람", "content": "부족한 오행을 보완해줄 ${specialtyText} 관련 사람의 특징 3문장", "action": "만나는 구체적 방법 2문장"},
    {"type": "skill", "label": "배워야 할 것", "content": "용신 오행을 강화하면서 ${specialtyText} 커리어를 확장하는 스킬 3문장", "action": "학습 방법과 기한 2문장"}
  ],
  "mbti_integration": {
    "type": "${mbtiText}",
    "career_synergy": "일간+MBTI 시너지 분석 3-5문장. 구체적 직업/분야 추천 포함.",
    "blind_spot": "일간의 그림자와 MBTI 약점이 충돌하는 패턴 3문장. 구체적 시나리오."
  },
  "season_reasoning": {
    "saju_basis": "현재 대운 천간지지가 일간과 어떤 관계인지, 왜 이 계절인지 3-5문장",
    "overall_reasoning": "사주+점성술+수비학 종합 결론 3-5문장. 구체적 숫자와 연도 포함."
  },
  "gyeokguk": {
    "name": "월지 본기·지장간 기반 격국명 (예: 정관격, 편재격, 식신생재격, 건록격, 양인격 등)",
    "reasoning": "월지 ${extractChar(calc.fourPillars.month.earthly)}의 본기·중기·여기 지장간과 일간 ${calc.dayMaster.heavenly}의 관계를 3-5문장으로 근거 제시",
    "implication": "이 격국이 커리어와 성격에 미치는 실질적 함의 3-5문장. 장점과 함정 모두 포함."
  },
  "career_sync": {
    "season_label": "봄: 씨앗의 시기 / 여름: 성장의 시기 / 가을: 수확의 시기 / 겨울: 내실의 시기 중 하나를 current_season(${calc.careerSeason})에 맞춰 선택",
    "season_focus": "현재 계절에서 이 사용자가 해야 할 일 3문장. 전문 분야(${specialtyText})와 연결.",
    "recommended_majors": ["오행·십성 근거 전공 1", "전공 2", "전공 3"],
    "recommended_jobs": ["직업군 1", "직업군 2", "직업군 3"],
    "reasoning": "왜 이 전공·직업인지. 오행 분포와 십성(비겁/식상/재성/관성/인성) 근거로 3-5문장. 현재 전문 분야(${specialtyText})와의 연결 또는 전환 가능성 포함."
  },
  "relationship_code": {
    "leadership_style": "일간·격국 기반 리더십 특성 2-3문장. 장점·약점 모두.",
    "partnership_style": "협업·파트너십 스타일 2-3문장. 어떤 사람과 일할 때 빛나는지.",
    "political_navigation": "조직 내 정치력·처세 진단 2-3문장. 현재 상황(${situationText})에 맞춘 조언.",
    "ten_gods_balance": "비겁·식상·재성·관성·인성 중 어떤 십성이 강하고 약한지, 그것이 관계에 어떻게 드러나는지 3-5문장",
    "synergy_people": "시너지 내는 사람 유형 2-3문장. 오행·십성 근거.",
    "friction_people": "충돌하는 사람 유형 2-3문장. 기신 오행과 연결."
  },
  "survival_strategy": {
    "habits_to_abandon": ["버려야 할 습관 1 (구체적 행동)", "습관 2", "습관 3"],
    "energy_to_embrace": ["취해야 할 에너지 1 (용신 오행과 연결된 구체적 행동)", "에너지 2", "에너지 3"],
    "immediate_action": "이번 주 당장 실행할 것 2-3문장. 현재 상황(${situationText})에서 실현 가능한 것.",
    "ninety_day_plan": "90일 생존·성장 계획 3문장. 전문 분야(${specialtyText}) 안에서 측정 가능한 목표.",
    "one_year_vision": "1년 후 되어야 할 모습 3문장. 현재 계절(${calc.careerSeason})에서 다음 계절로 넘어가는 준비 포함."
  },
  "career_pentagon": {
    "leadership": <일간 강약·관성 기반 0-100 점수>,
    "execution": <식상·재성 기반 0-100 점수>,
    "analysis": <인성·수오행 기반 0-100 점수>,
    "creativity": <식상·목화오행 기반 0-100 점수>,
    "empathy": <인성·토수오행 기반 0-100 점수>,
    "notes": "오각형의 강점 축과 약점 축을 해석해 커리어 포지셔닝 조언 2-3문장"
  }
}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const { action, input, mainResult, lang = 'ko' } = req.body;

  try {
    if (action === 'analyze') {
      if (!input) return res.status(400).json({ error: 'input is required' });

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      });

      const currentYear = new Date().getFullYear();

      const calcResult = calcSaju({
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        birthHour: input.birthHour ?? -1,
        gender: input.gender ?? 'male',
        calendarType: input.calendarType ?? 'solar',
        currentYear,
      });
      console.log(`[api/saju] Calc: ${calcResult.fourPillars.year.heavenly}${calcResult.fourPillars.month.heavenly}${calcResult.fourPillars.day.heavenly} | season=${calcResult.careerSeason} | golden=${calcResult.goldenYears.map(g=>g.year).join(',')}`);

      const basicPrompt = buildBasicPrompt(input, calcResult, currentYear, lang);

      const callOnce = async (prompt: string, label: string): Promise<any> => {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
          return JSON.parse(extractJSON(text));
        } catch (parseErr) {
          console.warn(`[api/saju] ${label} parse failed:`, (parseErr as Error).message);
          return null;
        }
      };

      const basicParsed = await callOnce(basicPrompt, 'Basic');
      if (!basicParsed) {
        return res.status(500).json({ error: '분석 결과 생성에 실패했습니다. 다시 시도해주세요.' });
      }

      // 코드 계산값으로 강제 덮어쓰기
      basicParsed.current_season = calcResult.careerSeason;
      basicParsed.season_cycle = calcResult.seasonCycle;
      if (basicParsed.top5_golden_years && calcResult.goldenYears.length === 5) {
        basicParsed.top5_golden_years = basicParsed.top5_golden_years.map((g: any, i: number) => ({
          ...g,
          year: calcResult.goldenYears[i].year,
          score: calcResult.goldenYears[i].score,
        }));
      }

      // 코드 계산으로 saju_detail 구성
      const fp = calcResult.fourPillars;
      const codeSajuDetail = {
        four_pillars: {
          year: { heavenly: extractChar(fp.year.heavenly), earthly: extractChar(fp.year.earthly), meaning: basicParsed.saju_detail?.four_pillars?.year?.meaning ?? '' },
          month: { heavenly: extractChar(fp.month.heavenly), earthly: extractChar(fp.month.earthly), meaning: basicParsed.saju_detail?.four_pillars?.month?.meaning ?? '' },
          day: { heavenly: extractChar(fp.day.heavenly), earthly: extractChar(fp.day.earthly), meaning: basicParsed.saju_detail?.four_pillars?.day?.meaning ?? '' },
          hour: fp.hour ? { heavenly: extractChar(fp.hour.heavenly), earthly: extractChar(fp.hour.earthly), meaning: basicParsed.saju_detail?.four_pillars?.hour?.meaning ?? '' } : { heavenly: '?', earthly: '?', meaning: '시간 미상' },
        },
        day_master: {
          element: calcResult.dayMaster.element + '(' + (calcResult.dayMaster.element === '목' ? '木' : calcResult.dayMaster.element === '화' ? '火' : calcResult.dayMaster.element === '토' ? '土' : calcResult.dayMaster.element === '금' ? '金' : '水') + ')',
          character: calcResult.dayMaster.heavenly + ' ' + calcResult.dayMaster.yinYang,
          description: basicParsed.saju_detail?.day_master?.description ?? '',
        },
        five_elements: calcResult.fiveElements,
        favorable_element: calcResult.favorableElement,
        unfavorable_element: calcResult.unfavorableElement,
        personality_summary: basicParsed.saju_detail?.personality_summary ?? basicParsed.sharp_feedback ?? '',
        current_luck_period: calcResult.currentLuck ? {
          period: `${calcResult.currentLuck.startYear}-${calcResult.currentLuck.endYear}`,
          element: calcResult.currentLuck.stemElement,
          influence: basicParsed.saju_detail?.current_luck_period?.influence ?? '',
        } : null,
      };

      return res.status(200).json({
        saju_summary: basicParsed.saju_summary ?? null,
        yearly_fortune: basicParsed.yearly_fortune ?? null,
        sharp_feedback: basicParsed.sharp_feedback ?? '분석이 완료되었습니다.',
        top5_golden_years: basicParsed.top5_golden_years ?? [],
        life_cycle_scores: basicParsed.life_cycle_scores ?? [],
        current_season: basicParsed.current_season ?? 'spring',
        season_details: basicParsed.season_details ?? { season: 'spring', year_range: '', advice: '', warning: '' },
        yearly_strategy: basicParsed.yearly_strategy ?? { quarter_scores: [], d_day: { date: '', description: '' }, missions: [] },
        mbti_integration: basicParsed.mbti_integration ?? { type: '', career_synergy: '', blind_spot: '' },
        season_cycle: basicParsed.season_cycle ?? [],
        season_guidance: basicParsed.season_guidance ?? null,
        networking_guide: basicParsed.networking_guide ?? null,
        growth_missions: basicParsed.growth_missions ?? [],
        saju_detail: codeSajuDetail,
        season_reasoning: basicParsed.season_reasoning ?? null,
        gyeokguk: basicParsed.gyeokguk ?? null,
        career_sync: basicParsed.career_sync ?? null,
        relationship_code: basicParsed.relationship_code ?? null,
        survival_strategy: basicParsed.survival_strategy ?? null,
        career_pentagon: basicParsed.career_pentagon ?? null,
        _calc_meta: {
          four_pillars_raw: {
            year: calcResult.fourPillars.year.heavenly + calcResult.fourPillars.year.earthly,
            month: calcResult.fourPillars.month.heavenly + calcResult.fourPillars.month.earthly,
            day: calcResult.fourPillars.day.heavenly + calcResult.fourPillars.day.earthly,
            hour: calcResult.fourPillars.hour
              ? calcResult.fourPillars.hour.heavenly + calcResult.fourPillars.hour.earthly
              : null,
          },
          solar_birth_date: calcResult.solarBirthDate,
          career_season: calcResult.careerSeason,
          season_relationship: calcResult.seasonRelationship,
        },
      });
    }

    if (action === 'validate') {
      if (!input || !mainResult) {
        return res.status(400).json({ error: 'input and mainResult are required' });
      }

      const validationModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      });

      const currentYear = new Date().getFullYear();
      const age = currentYear - input.birthYear;
      const top5Years = mainResult.top5_golden_years.map((g: any) => g.year).join(', ');
      const currentSeason = mainResult.current_season;

      const prompt = lang === 'ko'
        ? `사주 전문가로서 아래 데이터를 검증하라. 생년: ${input.birthYear}, 나이: ${age}세, 성별: ${input.gender === 'male' ? '남' : '여'}.
메인 AI가 계산한 전성기 연도: [${top5Years}], 현재 계절: ${currentSeason}.
위 수치가 사주·점성술 원리상 타당한지 독립적으로 재계산하여 아래 JSON만 반환하라:
{"agreement_score": 95, "top5_match": true, "season_match": true, "notes": "검증 의견 한 문장"}`
        : `As a saju/astrology expert, verify this data. Birth year: ${input.birthYear}, Age: ${age}, Gender: ${input.gender}.
Main AI calculated golden years: [${top5Years}], current season: ${currentSeason}.
Independently recalculate if these values are valid per saju/astrology principles. Return only this JSON:
{"agreement_score": 95, "top5_match": true, "season_match": true, "notes": "one sentence verification note"}`;

      try {
        const result = await validationModel.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(extractJSON(text));

        const confidence = parsed.agreement_score ?? 80;
        const validated = parsed.top5_match && parsed.season_match;
        const message = lang === 'ko'
          ? `AI 교차 검증 완료 ✓ ${confidence}% 일치`
          : `AI Cross-Validation Complete ✓ ${confidence}% Agreement`;

        return res.status(200).json({ confidence, validated, message });
      } catch (verr) {
        console.warn('[api/saju] validate failed:', (verr as Error).message);
        const message = lang === 'ko'
          ? 'AI 교차 검증을 수행할 수 없습니다.'
          : 'AI cross-validation unavailable.';
        return res.status(200).json({ confidence: 0, validated: false, message });
      }
    }

    return res.status(400).json({ error: 'action must be "analyze" or "validate"' });
  } catch (err: any) {
    console.error('[api/saju] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
