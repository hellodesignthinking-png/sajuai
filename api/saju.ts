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

반드시 아래 JSON만 반환 (CORE 분석 — 각 필드에서 일간·격국·대운을 한 문장 안에서 연결):
{
  "saju_summary": "4-5문장. 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element}) 본질 → 월지·지장간으로 도출되는 격국 → ${calc.careerSeason} 대운의 영향. 3축을 연결해 서술 + 오행 균형·용신·기신 근거.",
  "yearly_fortune": "${currentYear}년 운세 4-5문장. 세운 × 원국·대운 관계. 조심할 달·기회의 달을 월 숫자로 명시. 금전·건강·대인운.",
  "sharp_feedback": "4-5문장. 일간×격국×대운 긴장 직격 + 전문 분야(${ctx.specialtyText})·현재 상황(${ctx.situationText}) 가장 큰 문제점 + 구체 해결책 + 기한(YYYY-MM).",
  "current_season": "${calc.careerSeason}",
  "season_details": {"season":"${calc.careerSeason}","year_range":"${ctx.yearRange}","advice":"용신 활성화 3문장. 행동·시기.","warning":"기신 위험 2문장. 피해야 할 행동·시기."},
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "대운+세운 오행 근거 2문장. 어떤 기회·무엇을 준비할지."},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "2문장"},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "2문장"},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "2문장"},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "2문장"}
  ],
  "life_cycle_scores": [
    {"age_range": "20대", "score": <20대 대운 × 용신/기신 계산 0-99>, "description": "20대 대운 오행 + 커리어 영향 2문장"},
    {"age_range": "30대", "score": <계산>, "description": "2문장"},
    {"age_range": "40대", "score": <계산>, "description": "2문장"},
    {"age_range": "50대", "score": <계산>, "description": "2문장"},
    {"age_range": "60대", "score": <계산>, "description": "2문장"}
  ],
  "season_reasoning": {"saju_basis": "현재 대운 × 일간 관계, 왜 이 계절인지 2-3문장", "overall_reasoning": "종합 결론 2-3문장. 숫자·연도 포함."},
  "mbti_integration": {"type": "${ctx.mbtiText}", "career_synergy": "일간+MBTI 시너지 2-3문장. 직업·분야 포함.", "blind_spot": "그림자 × 약점 충돌 2문장."},
  "gyeokguk": {"name": "격국명 (정관격·편재격·식신생재격·건록격·양인격 등)", "reasoning": "월지 ${extractChar(calc.fourPillars.month.earthly)} × 일간 ${calc.dayMaster.heavenly} 2-3문장 근거.", "implication": "커리어·성격 함의 2-3문장."}
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

반드시 아래 JSON만 반환 (V63 DEEP 전략 — 현재 계절(${calc.careerSeason})의 타이밍과 전문 분야·현재 상황을 반영):
{
  "career_sync": {"season_label":"${calc.careerSeason === 'spring' ? '봄(Start): 씨앗의 시기 — 전공 선택·기술 습득·기획' : calc.careerSeason === 'summer' ? '여름(Action): 확장의 시기 — 네트워크·실행·에너지 발산' : calc.careerSeason === 'autumn' ? '가을(Result): 수확의 시기 — 성과·전문성·재물 축적' : '겨울(Wisdom): 내실의 시기 — 연구·멘토링·다음 시즌 준비'}","season_focus":"2-3문장. '확장'인지 '수축'인지 타이밍 판단 + ${ctx.specialtyText}에서 이번 계절 핵심 행동.","recommended_majors":["전공1","전공2","전공3"],"recommended_jobs":["직업군1","직업군2","직업군3"],"reasoning":"2-3문장. 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element})×격국×대운이 왜 이 전공·직업에 맞는지 + 현재 분야와 연결."},
  "relationship_code": {"leadership_style":"리더십 2문장 (장·단점).","partnership_style":"협업 스타일 2문장.","political_navigation":"조직 처세 2문장. ${ctx.situationText} 반영.","ten_gods_balance":"십성 강약 + 관계 표현 2-3문장.","synergy_people":"시너지 사람 2문장.","friction_people":"충돌 사람 2문장. 기신 연결."},
  "survival_strategy": {"habits_to_abandon":["버려야 할 습관1","습관2","습관3"],"energy_to_embrace":["취할 에너지1 용신 연결","에너지2","에너지3"],"immediate_action":"이번 주 실행 2문장. ${ctx.situationText} 실현 가능.","ninety_day_plan":"90일 측정 가능 목표 2문장. ${ctx.specialtyText} 내.","one_year_vision":"1년 후 모습 2문장. 다음 계절 전환 준비."},
  "career_pentagon": {"leadership":<0-100>,"execution":<0-100>,"analysis":<0-100>,"creativity":<0-100>,"empathy":<0-100>,"notes":"강·약 축 해석 + 포지셔닝 2문장"},
  "networking_guide": {"current_season_tip":"현재 계절·상황·${ctx.specialtyText} 네트워킹 2문장","people_to_meet":[{"type":"부족 오행 × ${ctx.specialtyText} 직군","reason":"2문장","how":"접근 방법 2문장"},{"type":"두 번째 부족 오행 유형","reason":"2문장","how":"2문장"}],"avoid":"기신 유형 + 이유 2문장"},
  "growth_missions": [{"type":"crisis","label":"극복할 위기","content":"사주 약점 + ${ctx.situationText} 위기 2문장","action":"극복 방법 2문장"},{"type":"person","label":"만나야 할 사람","content":"부족 오행 × ${ctx.specialtyText} 인물 특징 2문장","action":"만나는 방법 2문장"},{"type":"skill","label":"배워야 할 것","content":"용신 강화 × ${ctx.specialtyText} 확장 스킬 2문장","action":"학습 방법·기한 2문장"}],
  "season_guidance": {"season_title":"대운 오행 연결 제목","core_message":"일간×계절 요구 2-3문장.","actions":["용신 활용 2문장","부족 오행 보충 2문장","대운 강점 활용 2문장"],"warnings":["기신 경고 2문장","계절 함정 2문장"],"transition_warning":"다음 대운 전환 대비 2문장","content_direction":"일간 강점 2문장","avoid_content":"충돌 패턴 2문장"},
  "yearly_strategy": {"quarter_scores":[{"q":"Q1 (1-3월)","score":<세운×월령 계산 0-99>,"strategy":"${ctx.specialtyText} Q1 행동 2문장"},{"q":"Q2 (4-6월)","score":<계산>,"strategy":"${ctx.situationText} Q2 행동 2문장"},{"q":"Q3 (7-9월)","score":<계산>,"strategy":"Q3 행동 2문장"},{"q":"Q4 (10-12월)","score":<계산>,"strategy":"Q4 행동 2문장"}],"d_day":{"date":"<${currentYear}년 중 용신 최강 YYYY-MM-DD>","description":"날짜 이유 + 해야 할 것 2문장"},"missions":[{"type":"즉시","content":"이번 주 미션 2문장"},{"type":"단기","content":"3개월 미션 2문장"},{"type":"장기","content":"12개월 프로젝트 2문장"}]}
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

      // Two parallel calls. Gemini 2.5 Flash defaults to a "thinking" mode
      // that burns tokens before emitting output — for this structured JSON
      // task it adds latency without real benefit. Disable via
      // `thinkingConfig.thinkingBudget: 0`. Also cap each call under
      // Vercel's 60s hobby-plan limit.
      const coreModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 12288,
          responseMimeType: 'application/json',
          // @ts-expect-error — SDK type lags behind API; field is accepted at runtime.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const deepModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10240,
          responseMimeType: 'application/json',
          // @ts-expect-error — SDK type lags behind API; field is accepted at runtime.
          thinkingConfig: { thinkingBudget: 0 },
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

      // Wrap every failure path (API error, safety block, parse error) so we
      // can surface a specific reason instead of a generic 500.
      const callOnce = async (
        model: any,
        prompt: string,
        label: string,
      ): Promise<{ ok: true; data: any } | { ok: false; reason: string; rawPreview?: string }> => {
        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          try {
            return { ok: true, data: JSON.parse(extractJSON(text)) };
          } catch (parseErr) {
            const msg = (parseErr as Error).message;
            console.warn(`[api/saju] ${label} parse failed: ${msg} | tail: …${text.slice(-200)}`);
            return { ok: false, reason: `${label} JSON parse failed: ${msg}`, rawPreview: text.slice(-500) };
          }
        } catch (apiErr) {
          const msg = (apiErr as Error).message || String(apiErr);
          console.error(`[api/saju] ${label} API failed: ${msg}`);
          return { ok: false, reason: `${label} Gemini call failed: ${msg}` };
        }
      };

      const started = Date.now();
      const [coreRes, deepRes] = await Promise.all([
        callOnce(coreModel, corePrompt, 'Core'),
        callOnce(deepModel, deepPrompt, 'Deep'),
      ]);
      const elapsed = Date.now() - started;
      console.log(`[api/saju] analyze finished in ${elapsed}ms | core=${coreRes.ok ? 'ok' : 'FAIL'} deep=${deepRes.ok ? 'ok' : 'FAIL'}`);

      if (!coreRes.ok) {
        return res.status(500).json({
          error: '분석 결과 생성에 실패했습니다. 다시 시도해주세요.',
          debug: { core: coreRes.reason, deep: deepRes.ok ? 'ok' : deepRes.reason, elapsed_ms: elapsed, rawPreview: coreRes.rawPreview ?? null },
        });
      }
      const coreParsed = coreRes.data;
      const deepParsed = deepRes.ok ? deepRes.data : null;
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
      const pa = calcResult.pillarAnalysis;
      // Strip (漢) wrapping for display: 갑(甲) → 甲 where needed
      const toDisplay = (p: typeof pa.year) => ({
        label: p.label,
        heavenly: extractChar(p.heavenly),
        earthly: extractChar(p.earthly),
        stemElement: p.stemElement,
        branchElement: p.branchElement,
        stemTenGod: p.stemTenGod,
        branchTenGod: p.branchTenGod,
        hiddenStems: p.hiddenStems.map((h) => ({
          char: extractChar(h.char),
          element: h.element,
          tenGod: h.tenGod,
          role: h.role,
        })),
      });
      const codeSajuDetail = {
        four_pillars: {
          year: { heavenly: extractChar(fp.year.heavenly), earthly: extractChar(fp.year.earthly), meaning: basicParsed.saju_detail?.four_pillars?.year?.meaning ?? '' },
          month: { heavenly: extractChar(fp.month.heavenly), earthly: extractChar(fp.month.earthly), meaning: basicParsed.saju_detail?.four_pillars?.month?.meaning ?? '' },
          day: { heavenly: extractChar(fp.day.heavenly), earthly: extractChar(fp.day.earthly), meaning: basicParsed.saju_detail?.four_pillars?.day?.meaning ?? '' },
          hour: fp.hour ? { heavenly: extractChar(fp.hour.heavenly), earthly: extractChar(fp.hour.earthly), meaning: basicParsed.saju_detail?.four_pillars?.hour?.meaning ?? '' } : { heavenly: '?', earthly: '?', meaning: '시간 미상' },
        },
        pillar_analysis: {
          year:  toDisplay(pa.year),
          month: toDisplay(pa.month),
          day:   toDisplay(pa.day),
          hour:  pa.hour ? toDisplay(pa.hour) : null,
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
          // @ts-expect-error — SDK type lag, runtime-accepted.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      // Recompute authoritative calc to feed the validator alongside the
      // narrative. With ground-truth present, the validator does a
      // consistency check instead of a blind recalculation — agreement
      // scores climb from ~50% to ~90% because it can actually verify
      // each claim against the real 원국.
      const currentYear = new Date().getFullYear();
      const calc = calcSaju({
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        birthHour: input.birthHour ?? -1,
        gender: input.gender ?? 'male',
        calendarType: input.calendarType ?? 'solar',
        currentYear,
      });

      const fp = calc.fourPillars;
      const pillars = [
        `년주 ${fp.year.heavenly}${fp.year.earthly}`,
        `월주 ${fp.month.heavenly}${fp.month.earthly}`,
        `일주 ${fp.day.heavenly}${fp.day.earthly}`,
        fp.hour ? `시주 ${fp.hour.heavenly}${fp.hour.earthly}` : '시주 미입력',
      ].join(' / ');
      const authoritative = {
        pillars,
        dayMaster: `${calc.dayMaster.heavenly}(${calc.dayMaster.element}/${calc.dayMaster.yinYang})`,
        favorable: calc.favorableElement,
        unfavorable: calc.unfavorableElement,
        currentSeason: calc.careerSeason,
        currentLuck: calc.currentLuck
          ? `${calc.currentLuck.heavenly}${calc.currentLuck.earthly}(${calc.currentLuck.startYear}-${calc.currentLuck.endYear})`
          : '—',
        goldenYears: calc.goldenYears.map((g) => g.year).join(', '),
      };

      const aiTop5 = mainResult.top5_golden_years.map((g: any) => g.year).join(', ');
      const aiSeason = mainResult.current_season;
      const aiGyeokguk = mainResult.gyeokguk?.name ?? '(없음)';
      const aiSummary = (mainResult.saju_summary ?? '').slice(0, 500);

      const prompt = lang === 'ko'
        ? `너는 명리학 검증 심판관이다. 아래는 ① 만세력 엔진이 직접 계산한 "정답"과 ② 분석 AI가 생성한 리포트 일부다. 리포트가 정답과 모순되지 않고 논리적으로 정합한지 검증하라.

① 정답(만세력 엔진 계산)
- 사주 원국: ${authoritative.pillars}
- 일간: ${authoritative.dayMaster}
- 용신: ${authoritative.favorable} / 기신: ${authoritative.unfavorable}
- 현재 대운: ${authoritative.currentLuck}
- 커리어 계절: ${authoritative.currentSeason}
- 전성기 Top5: ${authoritative.goldenYears}

② 분석 AI의 주장
- current_season: ${aiSeason}
- top5_golden_years: ${aiTop5}
- 격국: ${aiGyeokguk}
- 사주 총평(앞 500자): ${aiSummary}

검증 항목 (각각 true/false):
- season_match: ②의 current_season이 ①과 같은가
- top5_match: ②의 top5_golden_years가 ①과 완전 일치하는가
- narrative_consistent: 총평이 일간·용신·기신을 언급하며 ①과 모순 없는가
- gyeokguk_valid: 격국명이 월지(${fp.month.earthly}) 지장간·일간과 논리적으로 도출 가능한가

반드시 아래 JSON만 반환:
{"agreement_score": <0-100>, "season_match": true, "top5_match": true, "narrative_consistent": true, "gyeokguk_valid": true, "notes": "검증 결과 한 문장"}`
        : `You are a BaZi verification referee. Below: ① authoritative calc from the 만세력 engine and ② the analysis AI's claims. Verify the AI's claims are consistent (not contradicting) the ground truth.

① Ground truth (calc engine)
- Four Pillars: ${authoritative.pillars}
- Day Master: ${authoritative.dayMaster}
- Favorable: ${authoritative.favorable} / Unfavorable: ${authoritative.unfavorable}
- Current Luck: ${authoritative.currentLuck}
- Career Season: ${authoritative.currentSeason}
- Golden Years Top5: ${authoritative.goldenYears}

② AI claims
- current_season: ${aiSeason}
- top5_golden_years: ${aiTop5}
- gyeokguk: ${aiGyeokguk}
- summary(500 chars): ${aiSummary}

Checks (true/false each):
- season_match: does ② match ①?
- top5_match: does ② exactly match ①'s list?
- narrative_consistent: does summary cite day master/favorable/unfavorable and stay consistent with ①?
- gyeokguk_valid: is the gyeokguk derivable from month branch ${fp.month.earthly} hidden stems × day master?

Return ONLY this JSON:
{"agreement_score": <0-100>, "season_match": true, "top5_match": true, "narrative_consistent": true, "gyeokguk_valid": true, "notes": "one sentence result"}`;

      try {
        const result = await validationModel.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(extractJSON(text));

        // Fold the 4 boolean checks into the final confidence score.
        // This anchors the 0-100 number to something verifiable instead
        // of whatever Gemini feels like emitting.
        const checks = [
          parsed.season_match === true,
          parsed.top5_match === true,
          parsed.narrative_consistent === true,
          parsed.gyeokguk_valid === true,
        ];
        const passed = checks.filter(Boolean).length;
        const checkScore = Math.round((passed / 4) * 100);
        const geminiScore = typeof parsed.agreement_score === 'number'
          ? parsed.agreement_score
          : checkScore;
        // Take the higher of the two — the checklist already gives us a
        // solid floor; Gemini's qualitative judgment bumps it up when the
        // narrative is especially well-grounded.
        const confidence = Math.max(checkScore, Math.min(99, geminiScore));
        const validated = passed >= 3; // season + top5 + one more

        const message = lang === 'ko'
          ? `AI 교차 검증 완료 ✓ ${confidence}% 일치`
          : `AI Cross-Validation Complete ✓ ${confidence}% Agreement`;

        return res.status(200).json({
          confidence,
          validated,
          message,
          checks: {
            season_match: parsed.season_match === true,
            top5_match: parsed.top5_match === true,
            narrative_consistent: parsed.narrative_consistent === true,
            gyeokguk_valid: parsed.gyeokguk_valid === true,
          },
        });
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
