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

// Shared context block used by both Core and Deep prompts so each call has
// the full V63 persona + saju data without repeating everything twice.
interface PromptCtx {
  age: number;
  hourText: string;
  genderText: string;
  mbtiText: string;
  calText: string;
  yearRange: string;
  goldenYearsList: string;
  situationText: string;
  specialtyText: string;
}
function buildPromptCtx(input: any, calc: SajuCalcResult, currentYear: number, lang: 'ko' | 'en'): PromptCtx {
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
  const situationText = (input.currentSituation ?? '').toString().trim() || (lang === 'ko' ? '(미입력)' : '(not provided)');
  const specialtyText = (input.specialty ?? '').toString().trim() || (lang === 'ko' ? '(미입력)' : '(not provided)');
  return { age, hourText, genderText, mbtiText, calText, yearRange, goldenYearsList, situationText, specialtyText };
}

function buildSharedHeaderKo(input: any, calc: SajuCalcResult, ctx: PromptCtx): string {
  const seasonKo: Record<string, string> = {
    spring: '봄(씨앗·Start) — 전공 선택·신기술 습득·기획',
    summer: '여름(성장·Action) — 네트워크 확장·실행·에너지 발산',
    autumn: '가을(수확·Result) — 성과·승진·전문성 확립·재물',
    winter: '겨울(내실·Wisdom) — 연구·멘토링·다음 시즌 준비',
  };
  return `[V63 Core-Sync: 인생 사계절 커리어 오라클]
너는 명리학 마스터 오라클이다. 장엄하면서 논리적이고 실용적인 말투.
이 리포트는 단순 점술이 아니라 "커리어 전략 보고서" 수준의 분석이다.

[해석 3대 축 — 반드시 상관관계로 서술]
1. 일간(Identity) ${calc.dayMaster.heavenly}(${calc.dayMaster.element}) — 이 사람의 본질
2. 격국(Career Type) — 월지 ${extractChar(calc.fourPillars.month.earthly)}의 지장간(본기·중기·여기) × 일간 관계로 도출
3. 대운(Season) — 현재 "${seasonKo[calc.careerSeason]}"

핵심 원칙: 각 데이터를 따로 읽지 말고 "${calc.dayMaster.heavenly}의 ${calc.dayMaster.element} 기운이 현재 '${calc.careerSeason}' 대운을 만나 [격국]으로 발현되므로…" 같은 **상관 서술**로 커리어·전공·관계를 통합 해석하라.

[미션]
1. Zero Mock — 범용 문구 절대 금지. 만세력·지장간 합충변화(合冲變化) 실제 반영.
2. 4계절 타이밍 — "확장할 때"인지 "수축할 때"인지 구체적 시점(Timing) 제시.
3. 전공·직업 매핑 — 오행 + 십성(비겁·식상·재성·관성·인성)으로 최적 전공·직업·조직 정치력 도출.
4. 생존 전략 — "버릴 습관"과 "취할 에너지"를 Action Plan으로.

[사용자]
- 생년월일시: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일 ${ctx.hourText} (${ctx.calText}), ${ctx.genderText}, MBTI: ${ctx.mbtiText}, ${ctx.age}세
- 전문 분야: ${ctx.specialtyText}
- 현재 상황: ${ctx.situationText}

${buildCalcDataBlock(calc, input.birthYear, 'ko')}

[고정 규칙]
1. current_season = "${calc.careerSeason}" 그대로 사용
2. top5_golden_years 연도 = [${ctx.goldenYearsList}] 그대로 사용
3. 모든 필드에 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element}), 용신 ${calc.favorableElement}, 기신 ${calc.unfavorableElement} 직접 인용
4. 전문 분야(${ctx.specialtyText})·현재 상황(${ctx.situationText})을 구체적으로 반영 — 일반론 금지
5. 점수는 대운/세운 오행 × 용신·기신 관계로 계산, 고정 예시값 복사 금지
6. 모든 텍스트 필드는 구체적 행동·날짜·숫자 포함, 추상적 조언 금지`;
}

function buildSharedHeaderEn(input: any, calc: SajuCalcResult, ctx: PromptCtx): string {
  return `You are Zhuge Liang, career strategist. Sharp and honest, no flattery.
Analyze using Saju + Four Seasons career framework.

User: Born ${input.birthYear}-${input.birthMonth}-${input.birthDay} ${ctx.hourText} (${ctx.calText}), ${ctx.genderText}, MBTI: ${ctx.mbtiText}, Age: ${ctx.age}
Specialty: ${ctx.specialtyText} | Current situation: ${ctx.situationText}
${buildCalcDataBlock(calc, input.birthYear, 'en')}

Rules:
1. current_season MUST be "${calc.careerSeason}"
2. top5_golden_years years MUST be [${ctx.goldenYearsList}]
3. Cite day master ${calc.dayMaster.heavenly}(${calc.dayMaster.element}), favorable ${calc.favorableElement}, unfavorable ${calc.unfavorableElement}
4. Reflect specialty & current situation — no generic advice
5. Scores must be derived from luck/year-pillar × favorable/unfavorable; never copy template values`;
}

// ────────────────────────────────────────────────────────────────
// PROMPT A — Core analysis (saju_summary, yearly_fortune, sharp_feedback,
// season_details, top5_golden_years, life_cycle_scores, season_reasoning,
// mbti_integration, gyeokguk). Roughly half the fields so it fits in
// ≤8K output tokens and completes well under Vercel's 60s cap.
// ────────────────────────────────────────────────────────────────
function buildCorePrompt(input: any, calc: SajuCalcResult, currentYear: number, lang: 'ko' | 'en'): string {
  const ctx = buildPromptCtx(input, calc, currentYear, lang);
  if (lang === 'en') {
    return `${buildSharedHeaderEn(input, calc, ctx)}

Return ONLY valid JSON matching this shape (CORE analysis only):
{
  "saju_summary": "5-7 sentences on the chart structure, day master, element balance.",
  "yearly_fortune": "5-7 sentences on ${currentYear} year pillar × chart relationship, months of risk/opportunity.",
  "sharp_feedback": "5-7 sentences naming core tension + concrete fix + deadline.",
  "current_season": "${calc.careerSeason}",
  "season_details": {"season":"${calc.careerSeason}","year_range":"${ctx.yearRange}","advice":"3-5 sentences on favorable element activation.","warning":"3 sentences on unfavorable element risk."},
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "3 sentences on luck+year-pillar element grounds"},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "3 sentences"},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "3 sentences"},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "3 sentences"},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "3 sentences"}
  ],
  "life_cycle_scores": [
    {"age_range": "20s", "score": <computed 0-99>, "description": "3 sentences on 20s luck cycle × favorable element"},
    {"age_range": "30s", "score": <computed>, "description": "3 sentences"},
    {"age_range": "40s", "score": <computed>, "description": "3 sentences"},
    {"age_range": "50s", "score": <computed>, "description": "3 sentences"},
    {"age_range": "60s", "score": <computed>, "description": "3 sentences"}
  ],
  "season_reasoning": {"saju_basis": "3-5 sentences on current luck × day master.", "overall_reasoning": "3-5 sentences conclusion with numbers/years."},
  "mbti_integration": {"type": "${ctx.mbtiText}", "career_synergy": "3-5 sentences on day-master + MBTI synergy with specific roles.", "blind_spot": "3 sentences on shadow patterns."},
  "gyeokguk": {"name": "e.g., 정관격 / Proper Officer Structure", "reasoning": "3-5 sentences citing month-branch hidden stems.", "implication": "3-5 sentences on career/personality implications."}
}`;
  }
  return `${buildSharedHeaderKo(input, calc, ctx)}

반드시 아래 JSON만 반환 (CORE 분석 — 각 필드에서 일간·격국·대운을 반드시 한 문장 안에서 연결하라):
{
  "saju_summary": "5-7문장. [구조] 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element})의 본질 → 월지·지장간 관계로 도출되는 격국 → 현재 ${calc.careerSeason} 대운이 원국에 미치는 영향. 이 3축을 연결해 서술하고 오행 균형·용신·기신을 근거로 제시.",
  "yearly_fortune": "올해(${currentYear}) 운세 5-7문장. 세운 천간지지가 원국·대운과 맺는 관계. 조심할 달·기회의 달을 월 숫자로 명시. 금전·건강·대인운 각각.",
  "sharp_feedback": "5-7문장. 일간×격국×대운이 만나 생기는 핵심 커리어 긴장을 직격. 지금 전문 분야(${ctx.specialtyText})·현재 상황(${ctx.situationText})에서 가장 큰 문제점 + 구체적 해결책 + 기한(YYYY-MM) 제시.",
  "current_season": "${calc.careerSeason}",
  "season_details": {"season":"${calc.careerSeason}","year_range":"${ctx.yearRange}","advice":"용신 활성화 3-5문장. 행동·시기 포함.","warning":"기신 위험 경고 3문장. 구체적으로 피해야 할 행동과 시기."},
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "대운+세운 오행 근거 3문장. 어떤 분야에서 기회가 오는지, 무엇을 미리 준비해야 하는지."},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "대운 근거 3문장"},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "대운 근거 3문장"},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "대운 근거 3문장"},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "대운 근거 3문장"}
  ],
  "life_cycle_scores": [
    {"age_range": "20대", "score": <20대 대운 × 용신/기신 계산 0-99>, "description": "20대 대운 오행 + 커리어 영향 + 행동 지침 3문장"},
    {"age_range": "30대", "score": <계산>, "description": "3문장"},
    {"age_range": "40대", "score": <계산>, "description": "3문장"},
    {"age_range": "50대", "score": <계산>, "description": "3문장"},
    {"age_range": "60대", "score": <계산>, "description": "3문장"}
  ],
  "season_reasoning": {"saju_basis": "현재 대운 천간지지 × 일간 관계, 왜 이 계절인지 3-5문장", "overall_reasoning": "종합 결론 3-5문장. 구체적 숫자·연도 포함."},
  "mbti_integration": {"type": "${ctx.mbtiText}", "career_synergy": "일간+MBTI 시너지 3-5문장. 구체적 직업·분야 포함.", "blind_spot": "일간 그림자 × MBTI 약점 충돌 패턴 3문장."},
  "gyeokguk": {"name": "월지 본기·지장간 기반 격국명 (정관격·편재격·식신생재격·건록격·양인격 등)", "reasoning": "월지 ${extractChar(calc.fourPillars.month.earthly)} 본기·중기·여기 × 일간 ${calc.dayMaster.heavenly} 관계를 3-5문장 근거 제시.", "implication": "커리어·성격 함의 3-5문장. 장점·함정 포함."}
}`;
}

// ────────────────────────────────────────────────────────────────
// PROMPT B — V63 Deep strategy (career_sync, relationship_code,
// survival_strategy, career_pentagon, season_guidance, yearly_strategy,
// networking_guide, growth_missions). Runs in parallel with Core.
// ────────────────────────────────────────────────────────────────
function buildDeepPrompt(input: any, calc: SajuCalcResult, currentYear: number, lang: 'ko' | 'en'): string {
  const ctx = buildPromptCtx(input, calc, currentYear, lang);
  if (lang === 'en') {
    return `${buildSharedHeaderEn(input, calc, ctx)}

Return ONLY valid JSON matching this shape (V63 DEEP strategy only):
{
  "career_sync": {"season_label":"Spring/Summer/Autumn/Winter: <phase> matching ${calc.careerSeason}","season_focus":"3 sentences tied to ${ctx.specialtyText}.","recommended_majors":["major1","major2","major3"],"recommended_jobs":["job1","job2","job3"],"reasoning":"3-5 sentences grounded in elements + ten gods + current field."},
  "relationship_code": {"leadership_style":"2-3 sentences.","partnership_style":"2-3 sentences.","political_navigation":"2-3 sentences tied to ${ctx.situationText}.","ten_gods_balance":"3-5 sentences.","synergy_people":"2-3 sentences.","friction_people":"2-3 sentences."},
  "survival_strategy": {"habits_to_abandon":["habit1","habit2","habit3"],"energy_to_embrace":["energy1","energy2","energy3"],"immediate_action":"2-3 sentences actionable this week.","ninety_day_plan":"3 sentences measurable 90-day target.","one_year_vision":"3 sentences transition to next season."},
  "career_pentagon": {"leadership":<0-100>,"execution":<0-100>,"analysis":<0-100>,"creativity":<0-100>,"empathy":<0-100>,"notes":"2-3 sentences positioning advice."},
  "season_guidance": {"season_title":"title tied to luck element","core_message":"3-5 sentences.","actions":["action 2-3 sentences","action 2-3 sentences","action 2-3 sentences"],"warnings":["warning 2-3","warning 2-3"],"transition_warning":"3 sentences","content_direction":"2-3 sentences","avoid_content":"2-3 sentences"},
  "yearly_strategy": {"quarter_scores":[{"q":"Q1 (Jan-Mar)","score":<0-99>,"strategy":"3 sentences"},{"q":"Q2 (Apr-Jun)","score":<0-99>,"strategy":"3 sentences"},{"q":"Q3 (Jul-Sep)","score":<0-99>,"strategy":"3 sentences"},{"q":"Q4 (Oct-Dec)","score":<0-99>,"strategy":"3 sentences"}],"d_day":{"date":"<YYYY-MM-DD when favorable element peaks in ${currentYear}>","description":"3 sentences"},"missions":[{"type":"Immediate","content":"3 sentences"},{"type":"Short-term","content":"3 sentences"},{"type":"Long-term","content":"3 sentences"}]},
  "networking_guide": {"current_season_tip":"3 sentences","people_to_meet":[{"type":"role embodying missing element","reason":"2-3 sentences","how":"2 sentences"},{"type":"secondary gap","reason":"2-3 sentences","how":"2 sentences"}],"avoid":"2-3 sentences"},
  "growth_missions": [{"type":"crisis","label":"Crisis","content":"3 sentences","action":"2 sentences"},{"type":"person","label":"Person to Meet","content":"3 sentences","action":"2 sentences"},{"type":"skill","label":"Skill","content":"3 sentences","action":"2 sentences"}]
}`;
  }
  return `${buildSharedHeaderKo(input, calc, ctx)}

반드시 아래 JSON만 반환 (V63 DEEP 전략 — 현재 계절(${calc.careerSeason})의 역할을 명확히 지키되, 각 필드에서 전문 분야·현재 상황을 구체적으로 반영하라):
{
  "career_sync": {"season_label":"${calc.careerSeason === 'spring' ? '봄(Start): 씨앗의 시기 — 전공 선택·기술 습득·기획' : calc.careerSeason === 'summer' ? '여름(Action): 확장의 시기 — 네트워크·실행·에너지 발산' : calc.careerSeason === 'autumn' ? '가을(Result): 수확의 시기 — 성과·전문성·재물 축적' : '겨울(Wisdom): 내실의 시기 — 연구·멘토링·다음 시즌 준비'} 그대로 사용","season_focus":"3문장. 지금이 '확장할 때'인지 '수축할 때'인지 명확한 타이밍 판단 + 전문 분야(${ctx.specialtyText})에서 이번 계절에 해야 할 핵심 행동.","recommended_majors":["전공1","전공2","전공3"],"recommended_jobs":["직업군1","직업군2","직업군3"],"reasoning":"3-5문장. 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element}) × 격국 × 현재 대운이 맞물려 이 전공·직업이 왜 맞는지 설명. 현재 전문 분야(${ctx.specialtyText})와 연결 또는 전환 가능성."},
  "relationship_code": {"leadership_style":"일간·격국 기반 리더십 2-3문장 (장점·약점).","partnership_style":"협업 스타일 2-3문장.","political_navigation":"조직 내 처세 2-3문장. 현재 상황(${ctx.situationText}) 반영.","ten_gods_balance":"비겁·식상·재성·관성·인성 중 강약 + 관계 표현 3-5문장.","synergy_people":"시너지 내는 사람 2-3문장. 오행·십성 근거.","friction_people":"충돌하는 사람 2-3문장. 기신 연결."},
  "survival_strategy": {"habits_to_abandon":["버려야 할 습관 1 구체적 행동","습관2","습관3"],"energy_to_embrace":["취해야 할 에너지 1 용신 연결 구체적 행동","에너지2","에너지3"],"immediate_action":"이번 주 실행 2-3문장. 현재 상황(${ctx.situationText})에서 실현 가능.","ninety_day_plan":"90일 측정 가능한 목표 3문장. 전문 분야(${ctx.specialtyText}) 안에서.","one_year_vision":"1년 후 모습 3문장. 다음 계절 전환 준비."},
  "career_pentagon": {"leadership":<0-100>,"execution":<0-100>,"analysis":<0-100>,"creativity":<0-100>,"empathy":<0-100>,"notes":"강점·약점 축 해석 + 커리어 포지셔닝 2-3문장"},
  "season_guidance": {"season_title":"현재 대운 오행 연결 제목","core_message":"일간과 계절 요구 3-5문장.","actions":["용신 활용 2-3문장","부족 오행 보충 2-3문장","대운 강점 활용 2-3문장"],"warnings":["기신 경고 2-3문장","계절 함정 2-3문장"],"transition_warning":"다음 대운 전환 대비 3문장","content_direction":"일간 강점 2-3문장","avoid_content":"충돌 패턴 2-3문장"},
  "yearly_strategy": {"quarter_scores":[{"q":"Q1 (1-3월)","score":<세운×월령 용신/기신 계산 0-99>,"strategy":"전문 분야(${ctx.specialtyText}) Q1 구체적 행동 + 주의사항 3문장"},{"q":"Q2 (4-6월)","score":<계산>,"strategy":"현재 상황(${ctx.situationText}) 반영 Q2 행동 3문장"},{"q":"Q3 (7-9월)","score":<계산>,"strategy":"Q3 오행 + 맞춤 행동 3문장"},{"q":"Q4 (10-12월)","score":<계산>,"strategy":"Q4 오행 + 실행 권고 3문장"}],"d_day":{"date":"<올해 ${currentYear}년 중 용신이 가장 강해지는 YYYY-MM-DD>","description":"이 날짜의 특별한 이유 + 해야 할 것 3문장"},"missions":[{"type":"즉시","content":"이번 주 실행 3문장. 현재 상황·전문 분야 바로 적용."},{"type":"단기","content":"3개월 미션 3문장. 전문 분야 성장."},{"type":"장기","content":"12개월 프로젝트 3문장. 커리어 전환/확장."}]},
  "networking_guide": {"current_season_tip":"현재 계절·상황·전문 분야 네트워킹 3문장","people_to_meet":[{"type":"부족 오행 × ${ctx.specialtyText} 연관 직군","reason":"전문 분야 성장에 왜 필요한지 2-3문장","how":"현재 상황에서 접근 가능한 구체적 방법 2문장"},{"type":"두 번째 부족 오행 × 인접 유형","reason":"2-3문장","how":"2문장"}],"avoid":"기신 증폭 유형 + 이유 2-3문장"},
  "growth_missions": [{"type":"crisis","label":"극복할 위기","content":"사주 구조적 약점 + 현재 상황 위기 3문장","action":"전문 분야 내 극복 방법 2문장"},{"type":"person","label":"만나야 할 사람","content":"부족 오행 보완 × ${ctx.specialtyText} 관련 사람 특징 3문장","action":"만나는 구체적 방법 2문장"},{"type":"skill","label":"배워야 할 것","content":"용신 강화 × ${ctx.specialtyText} 확장 스킬 3문장","action":"학습 방법·기한 2문장"}]
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

      // Smaller maxOutputTokens — we now make 2 parallel calls, each returns
      // ~half the fields. 8K is plenty per half and comfortably fits under
      // Vercel's 60s cap.
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
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

      const corePrompt = buildCorePrompt(input, calcResult, currentYear, lang);
      const deepPrompt = buildDeepPrompt(input, calcResult, currentYear, lang);

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

      // Run both halves in parallel — total wall time ≈ slowest single call.
      const [coreParsed, deepParsed] = await Promise.all([
        callOnce(corePrompt, 'Core'),
        callOnce(deepPrompt, 'Deep'),
      ]);
      if (!coreParsed) {
        return res.status(500).json({ error: '분석 결과 생성에 실패했습니다. 다시 시도해주세요.' });
      }
      // Merge core + deep; fields don't overlap between the two prompts.
      const basicParsed: any = { ...coreParsed, ...(deepParsed ?? {}) };

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
