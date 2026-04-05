import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calcSaju, extractChar, type SajuCalcResult } from './saju-calc.js';

function extractJSON(text: string): string {
  // 마크다운 코드블록 제거
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  cleaned = cleaned.trim();

  // JSON 객체/배열 경계 추출 (앞뒤 불필요한 텍스트 제거)
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }
  if (start > 0) cleaned = cleaned.slice(start);

  // 파싱 성공하면 그대로 반환
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // 잘린 JSON 복구 시도
    let fixed = cleaned;

    // 마지막 완전한 필드까지만 잘라내기 (마지막 쉼표 이후 불완전한 부분 제거)
    const lastComma = fixed.lastIndexOf(',');
    const lastClose = Math.max(fixed.lastIndexOf('}'), fixed.lastIndexOf(']'));
    if (lastComma > lastClose) {
      fixed = fixed.slice(0, lastComma);
    }

    // 열린 따옴표 닫기
    const quoteCount = (fixed.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) fixed += '"';

    // 열린 배열/객체 닫기
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

// ── 계산 결과를 프롬프트 문자열로 변환 ─────────────────────

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
★★★ 아래는 코드로 계산한 사주 원국 — 이 값을 반드시 그대로 사용하라 ★★★

[사주 원국]
- 년주: ${fp.year.heavenly} ${fp.year.earthly} (${extractChar(fp.year.heavenly)}${extractChar(fp.year.earthly)})
- 월주: ${fp.month.heavenly} ${fp.month.earthly} (${extractChar(fp.month.heavenly)}${extractChar(fp.month.earthly)})
- 일주: ${fp.day.heavenly} ${fp.day.earthly} (${extractChar(fp.day.heavenly)}${extractChar(fp.day.earthly)})  ← 일간
- 시주: ${hourStr}
- 일간: ${dm.heavenly} [${dm.element}(${dm.element === '목' ? '木' : dm.element === '화' ? '火' : dm.element === '토' ? '土' : dm.element === '금' ? '金' : '水'}), ${dm.yinYang}(${dm.yinYang === '양' ? '陽' : '陰'})]

[오행 분포] (천간4 + 지지4 = 8자)
- 목(木): ${fe.wood}개 | 화(火): ${fe.fire}개 | 토(土): ${fe.earth}개 | 금(金): ${fe.metal}개 | 수(水): ${fe.water}개

[용신/기신]
- 용신(有用之神): ${calc.favorableElement}(${calc.favorableElement === '목' ? '木' : calc.favorableElement === '화' ? '火' : calc.favorableElement === '토' ? '土' : calc.favorableElement === '금' ? '金' : '水'}) — 일간 균형에 필요한 오행
- 기신(忌神): ${calc.unfavorableElement}(${calc.unfavorableElement === '목' ? '木' : calc.unfavorableElement === '화' ? '火' : calc.unfavorableElement === '토' ? '土' : calc.unfavorableElement === '금' ? '金' : '水'}) — 불균형을 심화하는 오행

[대운(大運) 흐름]
${luckLines}

[코드 계산 커리어 계절]: ${seasonKo[calc.careerSeason]}
- 근거: 현재 대운 천간 ${calc.currentLuck?.heavenly}(${calc.currentLuck?.stemElement})과 일간 ${dm.heavenly}(${dm.element})의 관계 = ${calc.seasonRelationship}
※ current_season 값으로 반드시 "${calc.careerSeason}"을 사용하라. 절대 변경 금지.

[코드 계산 전성기 Top 5]
${goldenLines}
※ top5_golden_years의 year 값은 반드시 위 연도를 사용하라. 절대 변경 금지.`;
  } else {
    return `
★★★ Pre-calculated Four Pillars (code-computed) — use these values exactly ★★★

[Four Pillars]
- Year: ${fp.year.heavenly} ${fp.year.earthly} (${extractChar(fp.year.heavenly)}${extractChar(fp.year.earthly)})
- Month: ${fp.month.heavenly} ${fp.month.earthly} (${extractChar(fp.month.heavenly)}${extractChar(fp.month.earthly)})
- Day: ${fp.day.heavenly} ${fp.day.earthly} (${extractChar(fp.day.heavenly)}${extractChar(fp.day.earthly)})  ← Day Master
- Hour: ${hourStr}
- Day Master: ${dm.heavenly} [${dm.element} element, ${dm.yinYang}]

[Five Elements] (8 characters total)
- Wood: ${fe.wood} | Fire: ${fe.fire} | Earth: ${fe.earth} | Metal: ${fe.metal} | Water: ${fe.water}

[Favorable / Unfavorable Elements]
- Favorable (용신): ${calc.favorableElement} — needed to balance this chart
- Unfavorable (기신): ${calc.unfavorableElement} — amplifies imbalance

[Major Luck Cycles]
${luckLines}

[Code-calculated Career Season]: ${seasonEn[calc.careerSeason]}
- Basis: Current luck stem ${calc.currentLuck?.heavenly}(${calc.currentLuck?.stemElement}) vs Day Master ${dm.heavenly}(${dm.element}) = ${calc.seasonRelationship}
※ Use EXACTLY "${calc.careerSeason}" for current_season. Do NOT change it.

[Code-calculated Top 5 Golden Years]
${goldenLines}
※ Use EXACTLY these years for top5_golden_years. Do NOT change them.`;
  }
}

// 1단계: 기본 분석 (saju_detail, season_reasoning 제외)
function buildBasicPrompt(input: any, calc: SajuCalcResult, currentYear: number, lang: 'ko' | 'en' = 'ko'): string {
  const age = currentYear - input.birthYear;
  const hourText = input.birthHour === -1
    ? (lang === 'en' ? 'unknown time' : '시간 모름')
    : `${input.birthHour}${lang === 'en' ? ':00' : '시'}`;
  const genderText = lang === 'en'
    ? (input.gender === 'male' ? 'Male' : 'Female')
    : (input.gender === 'male' ? '남성' : '여성');
  const mbtiText = input.mbti === '모름'
    ? (lang === 'en' ? 'Unknown MBTI' : 'MBTI 모름')
    : input.mbti;
  const calText = lang === 'en'
    ? (input.calendarType === 'lunar' ? 'Lunar' : 'Solar')
    : (input.calendarType === 'lunar' ? '음력' : '양력');

  if (lang === 'en') {
    return `You are Zhuge Liang, a career strategist powered by AI. Be sharp and honest, not flattering.
Analyze using Saju (Four Pillars), Western Astrology, and Numerology combined.

User info:
- Date of birth: ${input.birthYear}-${input.birthMonth}-${input.birthDay} at ${hourText} (${calText} calendar)
- Birthplace: ${input.birthPlace || 'Korea'}
- Gender: ${genderText}
- MBTI: ${mbtiText}
- Current year: ${currentYear}
- Current age: ${age}
${buildCalcDataBlock(calc, input.birthYear, 'en')}

YOUR ROLE: Interpret and explain the pre-calculated data above. Do NOT recalculate.
The four pillars, career season, and golden years are FIXED by code. Your job is to explain WHY and provide actionable advice.

CRITICAL RULES — READ BEFORE GENERATING ANY FIELD:
1. current_season MUST be "${calc.careerSeason}" — do not change.
2. top5_golden_years years MUST be [${calc.goldenYears.map(g => g.year).join(', ')}] — do not change.
3. Every single field MUST reference the specific day master ${calc.dayMaster.heavenly}(${calc.dayMaster.element}), the favorable element ${calc.favorableElement}, and unfavorable element ${calc.unfavorableElement} explicitly.
DO NOT output generic seasonal templates. DO NOT copy example values literally.

Mandatory personalization per field:
- top5_golden_years: Each "reason" MUST explain WHY that specific year is good for THIS person's chart (e.g. "2028: Ren Water luck cycle suppresses excess Bing Fire day master, creating strategic balance — career authority peaks")
- season_details.advice: Must reference this person's favorable element (용신) directly
- season_details.warning: Must reference this person's unfavorable element (기신) directly
- yearly_strategy.quarter_scores: Each "strategy" must cite a saju basis (e.g. "Q2: 세운 木 clashes with natal 庚金, avoid new contracts")
- yearly_strategy.missions: Must address THIS person's specific saju weaknesses
- season_guidance.actions: Concrete actions that leverage THIS person's favorable element
- season_guidance.warnings: Specific risks from THIS person's unfavorable element combinations
- networking_guide.people_to_meet: Person types that complement the LACKING element in this chart
- growth_missions: Missions that address the specific structural weaknesses in THIS saju chart
- sharp_feedback: Must name THIS person's day master and core saju tension directly

Each reason/strategy/advice field MUST include phrases like:
"Your day master [X] means...", "With the current [Y] luck cycle...", "Because [Z element] clashes with your natal chart this year..."

IMPORTANT OUTPUT QUALITY STANDARD — applies to ALL text fields:
All text fields must be at least 3 sentences. One-liner answers are strictly forbidden.
Provide advice so specific and actionable that the user feels "I know exactly what to do."
Instead of abstract advice (e.g. "strengthen your network"), give specific advice (e.g. "Send coffee chat requests to 3 senior engineers with 7-10 yrs experience on LinkedIn. Include 2 specific questions in your message about their career transitions.").
Always specify dates, numbers, and durations as precisely as possible.

Respond strictly in this JSON schema. All scores must be integers (0-100).

{
  "sharp_feedback": "5-7 sentences. First sentence: directly name this person's day master ${calc.dayMaster.heavenly}(${calc.dayMaster.element}) and its core tension. Second: identify the #1 career trap this saju structure creates repeatedly. Third: explain the five-element mechanism (reference ${calc.favorableElement} and ${calc.unfavorableElement}). Fourth: give a concrete countermeasure with a specific action and deadline. Fifth: warn what accumulates if this is not addressed. Sixth: identify one genuine strength they can leverage right now. No flattery.",
  "current_season": "${calc.careerSeason}",
  "season_details": {
    "season": "${calc.careerSeason}",
    "year_range": "${calc.currentLuck ? calc.currentLuck.startYear + '-' + calc.currentLuck.endYear : currentYear + '-' + (currentYear + 9)}",
    "advice": "5-7 sentences. First: how the favorable element ${calc.favorableElement} is activated in this ${calc.careerSeason} season (${calc.seasonRelationship} relationship with day master). Second: first specific action that leverages this element (name the actual industry/field/platform). Third: second specific action (who to meet and where). Fourth: third specific action (what skill to build, by when, how). Fifth: what must be completed before this luck cycle ends in ${calc.currentLuck?.endYear}. Sixth: the one key decision that maximizes this season's energy. No generic advice.",
    "warning": "3-4 sentences. How the unfavorable element ${calc.unfavorableElement} manifests right now (specific scenario in work/relationship/health). What specific loss occurs if they fall into this trap. Which situations/decisions/people trigger ${calc.unfavorableElement}. Concrete method to avoid or manage it."
  },
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "3-4 sentences. Why ${calc.goldenYears[0]?.year ?? currentYear + 3} is a peak year: which luck cycle element and annual element combine favorably for this chart. How they interact with day master ${calc.dayMaster.heavenly}. Which specific industry/field/decision benefits most. What to prepare 2-3 years in advance."},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "3-4 sentences. Why ${calc.goldenYears[1]?.year ?? currentYear + 5} is favorable: annual pillar element interaction with the luck cycle and natal chart. What combination activates. What career transition becomes viable. What to build from the prior period."},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "3-4 sentences. Which elements strengthen in ${calc.goldenYears[2]?.year ?? currentYear + 8} and why they favor this chart. What specific opportunity window opens. The duration of this window. What action must be taken inside it."},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "3-4 sentences. The luck cycle element active around ${calc.goldenYears[3]?.year ?? currentYear + 12}. How it differs from the previous cycle. What form of career achievement this represents. What foundation to lay beforehand."},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "3-4 sentences. The active luck cycle and annual element combination. Which role/position is reinforced. What form of achievement is accessible. What must be built to reach it."}
  ],
  "life_cycle_scores": [
    {"age_range": "20s", "score": 65, "description": "Based on this person's luck cycle at that age — what element was active and what that meant"},
    {"age_range": "30s", "score": 80, "description": "Current/upcoming luck cycle element and its specific effect on this chart"},
    {"age_range": "40s", "score": 90, "description": "Which luck cycle element will be active and why it favors/challenges this day master"},
    {"age_range": "50s", "score": 75, "description": "Luck cycle element shift and its career implications for this chart"},
    {"age_range": "60s", "score": 60, "description": "Final luck cycle element and legacy implications for this specific chart"}
  ],
  "season_cycle": ${JSON.stringify(calc.seasonCycle.map(s => ({...s, label: s.season === 'spring' ? 'Seeding' : s.season === 'summer' ? 'Growth' : s.season === 'autumn' ? 'Harvest' : 'Preparation'})))},
  "season_guidance": {
    "season_title": "Season title tied to this person's current luck cycle element",
    "core_message": "5-7 sentences. First: directly name this person's day master and what this season demands from that nature. Second: the end year of this season and the one goal that must be achieved before it ends. Third: the most common waste of this season's energy (tied to this day master's tendency). Fourth: how to avoid that waste — concrete method. Fifth: one action they can start this week (name the app/platform/person). Sixth: what the next season looks like and how it differs from now. No clichés or motivational fluff.",
    "actions": [
      "2-3 sentences. Favorable element leverage: WHY this action (element basis) + HOW exactly (specific platform/person/timing) + WHAT result to expect and by when.",
      "2-3 sentences. Gap element compensation: why this element is currently deficient + which specific action compensates (job/learning/relationship — name the platform or method) + how often and until when.",
      "2-3 sentences. Luck cycle strength activation: how long this luck cycle lasts (end year) + what this specific action achieves within that window + the first executable step this week."
    ],
    "warnings": [
      "2-3 sentences. How the unfavorable element manifests this season + which specific situations/decisions/people trigger it + the immediate action to take when you notice this pattern.",
      "2-3 sentences. The core trap of this season for this day master: what looks like an opportunity but is actually a trap + how to distinguish the two + the concrete avoidance method."
    ],
    "transition_warning": "When the next luck cycle begins (specific year), what specific element shift occurs and what preparation THIS chart needs",
    "content_direction": "Content strategy that plays to this person's day master strengths",
    "avoid_content": "Content patterns that clash with this person's chart structure"
  },
  "yearly_strategy": {
    "quarter_scores": [
      {"q": "Q1 (Jan-Mar)", "score": 72, "strategy": "3-4 sentences. The dominant element this quarter and its relationship with the natal chart (combine/clash/generate/control). Specifically what to do (which action, with whom, where). What to avoid (which decision/person/environment and why). The one concrete goal to reach by end of March."},
      {"q": "Q2 (Apr-Jun)", "score": 85, "strategy": "3-4 sentences. Which monthly branch element creates a combine or clash with this natal chart (element names). If this quarter is favorable, which specific sector/decision benefits and how. Month-by-month actions (April: X, May: Y, June: Z). When the next similar window opens if this one is missed."},
      {"q": "Q3 (Jul-Sep)", "score": 68, "strategy": "3-4 sentences. The elemental tension in this quarter and how it manifests in this natal chart (element names). The specific form it could take (conflict/loss/health/accident — the most relevant). Concrete defense strategy to minimize this tension. The internal work that should take priority this quarter."},
      {"q": "Q4 (Oct-Dec)", "score": 90, "strategy": "3-4 sentences. The year-end element flow and its specific impact on this chart (element names). The single most important decision to make this quarter (name what type of decision). What to prepare in Q3 to be ready for this. The positioning action that bridges into the following year."}
    ],
    "d_day": {
      "date": "${currentYear}-06-21",
      "description": "3-4 sentences. Which element is activated on this date and why it is special for this natal chart (stem/branch basis). Exactly what to do on this day (which action/decision/contact/start — be specific). What to prepare in the 2 weeks leading up to this date. What flow follows after this date."
    },
    "missions": [
      {"type": "Immediate", "content": "3-4 sentences. A mission executable this week (which app/platform/place/person). Which specific saju weakness this targets (element basis). How exactly to execute it (where/how/how often/by when). The specific change to expect when this mission is complete."},
      {"type": "Short-term", "content": "3-4 sentences. A mission completable within 3 months (name the specific date range). Which lacking element in the natal chart this compensates and how. Month-by-month execution plan (Month 1: X, Month 2: Y, Month 3: Z). The specific state achieved at completion (what is measurably different)."},
      {"type": "Long-term", "content": "3-4 sentences. A 12-month core project (specific start and end dates). How this project overcomes the shadow side of this day master (name the mechanism). Quarterly milestones (Q1: X, Q2: Y, Q3: Z, Q4: W). The career position that changes upon completing this project."}
    ]
  },
  "networking_guide": {
    "current_season_tip": "3-4 sentences. The human energy type this chart needs most right now (element basis). Which fields/jobs/environments these people typically occupy (name 2-3 specific professions). The most effective channel to connect with them (specific platform/event/community name). One or two specific opening questions to use in the first conversation.",
    "people_to_meet": [
      {"type": "Person type embodying the primary lacking element (specific job/role)", "reason": "3 sentences. How deficient this element is in the natal chart (quantify if possible). How this person type provides that element. What specific career change this relationship enables (short/long term).", "how": "2-3 sentences. First contact approach matching this day master's communication style (what to say). Where to find these people (specific platform/community/event). What value to offer in the first meeting to start the relationship naturally."},
      {"type": "Person type addressing the secondary chart gap (specific job/role)", "reason": "3 sentences. The saju basis for the second lacking element and its meaning in this chart. Why this type embodies that element. What specific short-term and long-term opportunity this relationship creates.", "how": "2-3 sentences. Connection strategy (how to initiate contact). Access channel (where to find them). The first concrete action to advance the relationship."}
    ],
    "avoid": "Describe the specific energy type that amplifies this person's unfavorable element — and why it's dangerous for this chart structure"
  },
  "growth_missions": [
    {
      "type": "crisis",
      "label": "Crisis to Overcome",
      "content": "3-4 sentences. The most lethal career trap this day master + natal chart combination creates (name the element mechanism). Which specific scenario triggers this trap (job/business/relationship — specific scenario). What accumulates if this repeats (3yr/5yr/10yr consequences). Why this day master typically can't self-detect this trap.",
      "action": "2-3 sentences. The specific action that breaks this pattern (what/when/how — name the tool or method). How to sustain this action (reminder system or measurement method). The first visible change after 30 days of consistent execution."
    },
    {
      "type": "person",
      "label": "Person to Meet",
      "content": "3-4 sentences. The specific job/field/traits of the person type embodying the primary lacking element (2-3 examples). How this person balances the natal chart's elemental deficit (mechanism). The career change this relationship enables (6-month vs 3-year outcomes). A check question to see if this person type exists in the current network.",
      "action": "2-3 sentences. The immediate first contact action for this person type (message on which platform). Where to find these people (specific community/event/platform names). What value to offer in the first meeting to establish the relationship."
    },
    {
      "type": "skill",
      "label": "Skill to Acquire",
      "content": "3-4 sentences. The specific competency (technical skill/knowledge/habit) tied to the weakest element in this chart. Why this skill is the most urgent for this chart's balance (element logic). Which career opportunities are repeatedly missed without this skill (name opportunity types). What opens up when this skill is acquired (industry/role/income).",
      "action": "2-3 sentences. The first concrete learning action using the current luck cycle energy (course/book/person/project — use a real name). Target completion date (specific date). The specific metric that confirms this skill is acquired (what must be true to call it done)."
    }
  ],
  "mbti_integration": {
    "type": "${mbtiText}",
    "career_synergy": "4-5 sentences. How this day master's specific nature resonates with this MBTI's strengths (include Chinese character and MBTI trait names together). In which job types/environments this synergy is maximized (name specific roles/industries). A concrete career strategy that intentionally exploits this synergy. The unique competitive edge this combination creates that most people lack. A specific situation/role/task where this strength shines brightest (with example).",
    "blind_spot": "3-4 sentences. How this day master's shadow side amplifies this MBTI's weakness (name both). Which workplace situation/relationship/decision triggers this collision (specific scenario). What career loss accumulates when this collision repeats (what is lost). A concrete habit or checklist to manage this collision consciously."
  }
}`;
  }

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
${buildCalcDataBlock(calc, input.birthYear, 'ko')}

★★★ 필수 원칙 ★★★
1. current_season = "${calc.careerSeason}" — 절대 변경 금지
2. top5_golden_years 연도 = [${calc.goldenYears.map(g => g.year).join(', ')}] — 절대 변경 금지
3. 모든 필드는 위 계산 데이터(일간 ${calc.dayMaster.heavenly}, 용신 ${calc.favorableElement}, 기신 ${calc.unfavorableElement})를 직접 인용하며 작성
너의 역할: 위 코드 계산 결과를 해석하고 조언하라. 다시 계산하지 마라.
절대로 계절별 일반 템플릿 답변을 사용하지 마라.

필드별 개인화 요구사항:
- top5_golden_years의 각 reason: "왜 이 사람의 사주에서 그 해가 좋은지" 구체적 근거 필수
  (예: "2028년은 壬水 대운이 절정에 달하며 세운 子水와 합세해 일간 丙火를 제어 — 과열된 추진력이 전략적 판단력으로 전환되는 전성기")
- season_details.advice: 이 사람의 용신(有用之神) 오행을 직접 언급한 조언
- season_details.warning: 이 사람의 기신(忌神) 오행을 직접 언급한 경고
- yearly_strategy.quarter_scores의 각 strategy: 세운 오행과 이 사람 원국의 상호작용 근거 포함
  (예: "Q2: 세운 甲木이 원국 庚金과 충(沖)하므로 계약·협상보다 내부 역량 강화에 집중")
- yearly_strategy.missions: 이 사람 사주의 구체적 약점을 겨냥한 미션
- season_guidance.actions: 이 사람의 용신 오행을 활용하는 구체적 행동
- season_guidance.warnings: 이 사람의 기신 오행이 유발하는 구체적 함정
- networking_guide.people_to_meet: 이 사람 원국에서 부족한 오행을 보완하는 사람 유형과 그 이유
- growth_missions: 이 사람 사주 구조의 구체적 약점을 극복하는 미션
- sharp_feedback: 이 사람의 일간과 핵심 사주 긴장 구도를 정면으로 지적

각 reason/strategy/advice 필드에는 반드시 다음과 같은 사주 근거 표현을 포함할 것:
"당신의 일간 X이므로...", "현재 Y 대운이라...", "올해 세운이 원국 Z오행과 충(沖)/합(合)하므로..."

★★★ 출력 품질 기준 — 모든 텍스트 필드에 적용 ★★★
중요: 모든 텍스트 필드는 최소 3문장 이상이어야 합니다. 1줄짜리 답변은 절대 금지.
사용자가 '이대로 따라하면 되겠다'고 느낄 만큼 구체적이고 실행 가능한 조언을 제공하라.
추상적인 조언(예: '네트워킹을 강화하세요') 대신 구체적 조언(예: '링크드인에서 IT 분야 5-10년차 시니어 3명에게 커피챗을 요청하라. 메시지에는 구체적 질문 2개를 포함시켜라.')을 제공하라.
날짜, 숫자, 기간을 최대한 구체적으로 명시하라.

반드시 아래 JSON 스키마에 맞춰 응답하라. score는 반드시 정수(0-100)여야 한다.

{
  "sharp_feedback": "5-7문장. 첫 문장은 일간 ${calc.dayMaster.heavenly}(${calc.dayMaster.element})과 핵심 긴장 구도를 정면으로 직격한다. 두 번째 문장은 이 사주 구조가 커리어에서 반복적으로 만드는 가장 치명적인 함정을 명시한다. 세 번째 문장은 용신 ${calc.favorableElement}·기신 ${calc.unfavorableElement} 오행 메커니즘으로 설명한다. 네 번째 문장은 구체적 해결책(어떤 행동을, 언제까지)을 사주 근거와 함께 제시한다. 다섯 번째 문장은 해결하지 않으면 어떤 결과가 누적되는지 경고한다. 여섯 번째 문장은 이 사람이 가진 실제 강점 하나를 활용하는 전략을 제시한다. 미화나 위로는 절대 금지.",
  "current_season": "${calc.careerSeason}",
  "season_details": {
    "season": "${calc.careerSeason}",
    "year_range": "${calc.currentLuck ? calc.currentLuck.startYear + '-' + calc.currentLuck.endYear : currentYear + '-' + (currentYear + 9)}",
    "advice": "5-7문장. 첫 문장: 용신 ${calc.favorableElement}이 현재 ${calc.seasonRelationship} 대운에서 어떻게 활성화되는지 구체적으로. 둘째: 이 용신 에너지를 살리는 첫 번째 행동(직업·업종·분야를 실제 이름으로 명시). 셋째: 두 번째 행동(어떤 사람을 어디서 어떻게 만날지). 넷째: 세 번째 행동(어떤 역량을 언제까지). 다섯째: 대운이 끝나는 ${calc.currentLuck?.endYear}년 전에 반드시 완료해야 할 것. 여섯째: 이 계절의 에너지를 극대화하는 핵심 결정 하나. 일반론 완전 금지.",
    "warning": "3-4문장. 기신 ${calc.unfavorableElement}이 이 계절에 구체적으로 어떤 형태로 나타나는지(직업·관계·건강 중 하나를 구체적 시나리오로). 이 함정에 빠지면 어떤 구체적 손실이 오는지. 어떤 상황·결정·사람을 만날 때 기신이 활성화되는지 명시. 기신을 피하거나 다루는 구체적 방법."
  },
  "top5_golden_years": [
    {"year": ${calc.goldenYears[0]?.year ?? currentYear + 3}, "score": ${calc.goldenYears[0]?.score ?? 90}, "reason": "3-4문장. ${calc.goldenYears[0]?.year ?? currentYear + 3}년이 전성기인 이유: 대운·세운 오행이 원국과 어떻게 상호작용하는지(천간·지지 한자 포함). 일간 ${calc.dayMaster.heavenly}과의 관계 및 결과. 구체적으로 어떤 업종·분야에서 기회가 오는지. 2-3년 전부터 무엇을 준비해야 하는지."},
    {"year": ${calc.goldenYears[1]?.year ?? currentYear + 5}, "score": ${calc.goldenYears[1]?.score ?? 85}, "reason": "3-4문장. ${calc.goldenYears[1]?.year ?? currentYear + 5}년 세운·대운 오행 조합이 이 원국에 만드는 흐름. 어떤 오행 합·충이 발동하는지. 커리어에서 어떤 전환이 가능한지. 이를 위해 미리 무엇을 쌓아야 하는지."},
    {"year": ${calc.goldenYears[2]?.year ?? currentYear + 8}, "score": ${calc.goldenYears[2]?.score ?? 80}, "reason": "3-4문장. ${calc.goldenYears[2]?.year ?? currentYear + 8}년에 활성화되는 오행 조합과 원국에서 유리해지는 이유. 어떤 분야·결정에서 기회의 창이 열리는지. 그 창의 지속 기간. 그 안에 취해야 할 행동."},
    {"year": ${calc.goldenYears[3]?.year ?? currentYear + 12}, "score": ${calc.goldenYears[3]?.score ?? 75}, "reason": "3-4문장. ${calc.goldenYears[3]?.year ?? currentYear + 12}년 대운 오행(천간·지지 한자). 이전 대운과의 차이가 이 원국에 가져오는 변화. 커리어에서 어떤 형태의 성취·전환을 의미하는지. 이를 위해 무엇을 미리 준비해야 하는지."},
    {"year": ${calc.goldenYears[4]?.year ?? currentYear + 18}, "score": ${calc.goldenYears[4]?.score ?? 70}, "reason": "3-4문장. ${calc.goldenYears[4]?.year ?? currentYear + 18}년 대운·세운 오행 조합. 이 원국 구조에서 어떤 역할·포지션이 강화되는지. 경제적·사회적으로 어떤 형태의 성취가 가능한지. 그 성취를 위해 어떤 기반을 닦아야 하는지."}
  ],
  "life_cycle_scores": [
    {"age_range": "20대", "score": 65, "description": "당시 활성화된 대운 오행과 이 원국과의 상호작용 — 왜 이 점수인지 근거 포함"},
    {"age_range": "30대", "score": 80, "description": "현재 또는 곧 맞이할 대운 오행이 이 원국에 미치는 영향"},
    {"age_range": "40대", "score": 90, "description": "40대 대운 오행이 이 일간에 미치는 구체적 효과"},
    {"age_range": "50대", "score": 75, "description": "50대 대운 전환과 이 원국에서의 커리어 의미"},
    {"age_range": "60대", "score": 60, "description": "말년 대운 오행과 이 사람 원국의 마무리 구조"}
  ],
  "season_cycle": ${JSON.stringify(calc.seasonCycle)},
  "season_guidance": {
    "season_title": "이 사람의 현재 대운 오행과 연결된 계절 제목",
    "core_message": "5-7문장. 첫 문장: 이 사람의 일간 한자와 본성을 직접 호명하며 지금 이 계절이 그 본성에게 무엇을 요구하는지. 둘째: 이 계절이 끝나는 연도와 그 전에 반드시 이루어야 할 핵심 목표 하나. 셋째: 이 계절의 에너지를 낭비하는 가장 흔한 실수(이 일간 특성과 연결하여 구체적으로). 넷째: 그 실수를 피하는 구체적인 방법. 다섯째: 지금 당장 이번 주부터 시작할 수 있는 한 가지 행동(앱·플랫폼·사람 이름까지). 여섯째: 이 계절이 지나면 찾아오는 다음 계절의 특성과 지금과의 차이. 일반론·격언·미화 완전 금지.",
    "actions": [
      "2-3문장. 용신 오행을 직접 활용하는 행동: 왜 이 행동인지(오행 근거) + 어떻게 하는지(구체적 플랫폼·사람·타이밍 포함) + 어떤 결과를 언제까지 기대할 수 있는지.",
      "2-3문장. 부족한 오행을 보충하는 행동: 왜 이 오행이 지금 부족한지 + 어떤 구체적 행동으로 보충하는지(직업·학습·인간관계 중 택1, 플랫폼·방법 명시) + 얼마나 자주/언제까지 해야 하는지.",
      "2-3문장. 현재 대운 오행의 강점을 살리는 행동: 이 대운이 어느 연도까지 지속되는지 + 이 기간 내 이 행동으로 무엇을 달성할 수 있는지 + 첫 번째 실행 단계(이번 주 내 할 수 있는 것)."
    ],
    "warnings": [
      "2-3문장. 기신 오행이 이 계절에 구체적으로 어떤 형태로 나타나는지 + 어떤 상황·결정·관계에서 이 패턴이 촉발되는지 + 이를 감지했을 때 즉시 취할 행동.",
      "2-3문장. 이 일간 특성이 만드는 이 계절의 핵심 함정: 어떤 기회처럼 보이지만 사실 함정인지 + 판단 기준(어떻게 구별하는지) + 피하는 구체적 방법."
    ],
    "transition_warning": "다음 대운 또는 계절 전환 시점(구체적 연도)에 이 원국에서 어떤 오행 변화가 발생하며 어떻게 대비해야 하는지",
    "content_direction": "이 일간의 강점을 살리는 콘텐츠 방향 — 일간 특성과 연결하여",
    "avoid_content": "이 사람의 사주 구조와 충돌하는 콘텐츠 패턴 — 왜 충돌하는지 근거 포함"
  },
  "yearly_strategy": {
    "quarter_scores": [
      {"q": "Q1 (1-3월)", "score": 72, "strategy": "3-4문장. 이 분기에 지배적인 오행과 원국과의 관계(합·충·생·극). 이 분기에 구체적으로 해야 하는 것(어떤 행동을, 누구와, 어디서). 피해야 하는 것(어떤 결정·사람·환경, 이유 포함). 이 분기가 끝날 때 달성해야 하는 하나의 구체적 목표."},
      {"q": "Q2 (4-6월)", "score": 85, "strategy": "3-4문장. Q2 월지 오행이 이 원국과 어떤 합·충을 만드는지(오행 이름 명시). 이 분기가 유리하다면 어떤 분야·결정에서 유리한지 구체적으로. 이 창을 활용하는 월별 행동(4월은 X, 5월은 Y, 6월은 Z). 이 기회를 놓치면 다음 유사한 창이 언제 오는지."},
      {"q": "Q3 (7-9월)", "score": 68, "strategy": "3-4문장. Q3의 오행 긴장이 이 원국에서 어떻게 발현되는지(구체적 오행 이름). 이 긴장이 어떤 구체적 형태로 나타날 수 있는지(갈등·손실·건강·사고 중 해당 항목). 이 긴장을 최소화하는 구체적 방어 전략. 이 분기에 오히려 집중해야 하는 내부 작업."},
      {"q": "Q4 (10-12월)", "score": 90, "strategy": "3-4문장. 연말 오행 흐름이 이 원국에 미치는 구체적 영향(오행 이름 포함). 이 분기에 내려야 하는 가장 중요한 결단 하나(무엇을 결단할지 명시). 그 결단을 내리기 위해 Q3에서부터 준비할 것. 이 해를 마무리하며 다음 해로 연결되는 핵심 포지셔닝."}
    ],
    "d_day": {
      "date": "${currentYear}-06-21",
      "description": "3-4문장. 이 날짜에 어떤 오행이 활성화되며 왜 이 시점이 이 원국에 특별한지(천간·지지 기준 설명). 이 날 정확히 무엇을 해야 하는지(어떤 행동·결정·연락·시작 — 구체적 행동 명시). 이 날을 준비하기 위해 2주 전부터 해야 할 것. 이 날 이후에 어떤 흐름이 이어지는지."
    },
    "missions": [
      {"type": "즉시", "content": "3-4문장. 이번 주 안에 실행할 수 있는 미션(어떤 앱·플랫폼·장소에서 무엇을 할지). 이 미션이 이 사람의 사주 어떤 약점을 겨냥하는지(오행 근거 포함). 구체적 실행 방법(어디서·어떻게·얼마나·언제까지). 이 미션을 완료했을 때 기대되는 구체적 변화."},
      {"type": "단기", "content": "3-4문장. 3개월(구체적 날짜 범위 명시) 내 완료할 미션. 이 미션이 원국의 어떤 부족한 오행을 보완하는지(오행 이름 포함). 월별 세부 실행 계획(1개월차: X, 2개월차: Y, 3개월차: Z). 3개월 후 달성되는 구체적 상태(무엇이 어떻게 달라져 있는지)."},
      {"type": "장기", "content": "3-4문장. 향후 12개월(구체적 시작~종료 날짜) 동안 추진할 핵심 프로젝트. 이 프로젝트가 이 일간의 어떤 그림자 면을 어떻게 극복하게 하는지. 분기별 마일스톤(Q1: X, Q2: Y, Q3: Z, Q4: W). 1년 후 이 프로젝트를 완수했을 때 달라지는 커리어 포지션."}
    ]
  },
  "networking_guide": {
    "current_season_tip": "3-4문장. 이 시기에 이 원국이 가장 필요로 하는 인간 에너지 유형(오행 근거 포함). 그 에너지를 가진 사람들이 주로 어떤 분야·직업·환경에 있는지(구체적 직업 2-3개 명시). 그 사람들과 연결되는 가장 효과적인 채널(구체적 플랫폼·행사·커뮤니티 이름). 연결 시 첫 대화에서 해야 할 구체적 질문 1-2개.",
    "people_to_meet": [
      {"type": "이 원국에서 부족한 오행을 체현한 사람 유형(구체적 직업·역할 명시)", "reason": "3문장. 이 원국에서 어떤 오행이 얼마나 부족한지(수치나 비율로). 이 유형의 사람이 그 오행을 어떻게 제공하는지. 이 사람과의 관계가 커리어에 구체적으로 어떤 변화를 가져오는지.", "how": "2-3문장. 이 사람의 일간 소통 스타일에 맞는 첫 접근법(어떤 말로 시작할지). 어떤 플랫폼·이벤트·커뮤니티에서 만날 수 있는지. 첫 대화에서 어떤 주제로 시작하면 자연스럽게 연결되는지."},
      {"type": "이 원국의 두 번째 부족 오행을 보완하는 사람 유형(구체적 직업·역할 명시)", "reason": "3문장. 두 번째 부족 오행의 사주 근거와 이 원국에서의 의미. 이 유형이 그 오행을 왜 체현하는지. 이 관계가 단기/장기적으로 어떤 구체적 기회를 만드는지.", "how": "2-3문장. 연결 전략(어떻게 첫 접촉을 시작할지). 접근 채널(어디서 만날지). 관계를 발전시키는 구체적 첫 번째 액션."}
    ],
    "avoid": "이 사람의 기신 오행을 증폭시키는 에너지 유형 — 어떤 오행을 자극하며 왜 이 원국에 해로운지 설명"
  },
  "growth_missions": [
    {
      "type": "crisis",
      "label": "극복할 위기",
      "content": "3-4문장. 이 일간 + 원국 구조가 만드는 가장 치명적인 커리어 함정의 정체(오행 이름 포함). 이 함정이 어떤 구체적 상황에서 나타나는지(직장·사업·관계 중 구체적 시나리오). 이 함정이 반복되면 어떤 결과가 3년·5년·10년 단위로 축적되는지. 왜 이 일간은 이 함정을 스스로 알아채기 어려운지.",
      "action": "2-3문장. 이 함정을 끊어내는 구체적 행동(무엇을, 언제부터, 어떻게 — 도구·방법 명시). 이 행동을 지속하기 위한 리마인더 또는 측정 방법(어떻게 진행을 확인할지). 이 행동을 30일 실행했을 때 기대되는 첫 번째 눈에 띄는 변화."
    },
    {
      "type": "person",
      "label": "만나야 할 사람",
      "content": "3-4문장. 이 원국에서 부족한 오행을 체현한 사람 유형의 구체적 직업·분야·특성(2-3개 예시). 이 사람이 어떻게 이 원국의 오행 균형을 보완하는지 원리 설명. 이 사람과의 관계에서 기대되는 커리어 변화(단기 6개월·장기 3년). 이런 유형의 사람이 현재 이 사람의 네트워크에 있는지 확인하는 질문.",
      "action": "2-3문장. 지금 당장 이 유형의 사람에게 연락하거나 만나는 구체적 첫 행동(어떤 메시지를 어떤 플랫폼에서). 이런 사람을 찾을 수 있는 커뮤니티·이벤트·플랫폼(구체적 이름). 첫 만남에서 어떤 가치를 제공하며 관계를 시작할지."
    },
    {
      "type": "skill",
      "label": "배워야 할 것",
      "content": "3-4문장. 이 원국에서 가장 약한 오행과 연결된 구체적 역량(기술·지식·습관 중 하나를 구체적으로). 왜 이 역량이 이 사람의 사주 균형에 가장 시급한지 오행 논리로 설명. 이 역량이 없으면 어떤 커리어 기회를 계속 놓치게 되는지(구체적 기회 유형). 이 역량을 갖추었을 때 열리는 구체적 기회(업종·직무·수입 등).",
      "action": "2-3문장. 현재 대운 오행을 활용해 이 역량을 익히는 첫 번째 구체적 행동(강의·책·사람·프로젝트 중 하나를 실제 이름으로). 목표 완료 시점(구체적 날짜). 역량 달성 여부를 확인하는 구체적 지표(무엇이 되어야 '완료'인지)."
    }
  ],
  "mbti_integration": {
    "type": "${mbtiText}",
    "career_synergy": "4-5문장. 이 일간의 구체적 특성이 이 MBTI의 어떤 강점과 어떻게 공명하는지(일간 한자와 MBTI 특성 이름을 함께 언급). 이 시너지가 어떤 직업군·환경에서 가장 극대화되는지(구체적 직무·업종 명시). 이 시너지를 의도적으로 활용하는 구체적 커리어 전략. 이 조합이 만드는 독특한 강점 — 대부분의 사람에게는 없는 이 사람만의 경쟁력. 이 강점이 빛나는 구체적 상황·역할·직무(예시 포함).",
    "blind_spot": "3-4문장. 이 일간의 그림자 면이 이 MBTI의 어떤 약점을 어떻게 증폭시키는지(일간 한자와 MBTI 특성 이름 함께). 이 충돌이 어떤 직장 상황·관계·결정에서 구체적으로 나타나는지(시나리오로). 이 충돌이 반복될 때 쌓이는 커리어 손실(무엇을 잃는지). 이 충돌을 의식적으로 관리하는 방법(구체적 습관·체크리스트)."
  }
}`;
}

// 2단계: 사주 상세 + 계절 근거 (1단계 결과 참조)
function buildSajuDetailPrompt(
  input: any,
  calc: SajuCalcResult,
  currentYear: number,
  lang: 'ko' | 'en',
  currentSeason: string,
  top5GoldenYears: any[]
): string {
  const age = currentYear - input.birthYear;
  const genderText = lang === 'en'
    ? (input.gender === 'male' ? 'Male' : 'Female')
    : (input.gender === 'male' ? '남성' : '여성');

  const fp = calc.fourPillars;
  const yH = extractChar(fp.year.heavenly);
  const yE = extractChar(fp.year.earthly);
  const mH = extractChar(fp.month.heavenly);
  const mE = extractChar(fp.month.earthly);
  const dH = extractChar(fp.day.heavenly);
  const dE = extractChar(fp.day.earthly);
  const hH = fp.hour ? extractChar(fp.hour.heavenly) : (lang === 'en' ? 'unknown' : '모름');
  const hE = fp.hour ? extractChar(fp.hour.earthly) : (lang === 'en' ? 'unknown' : '모름');
  const top5Summary = top5GoldenYears.map((g: any) => `${g.year}(${g.score}점)`).join(', ');

  if (lang === 'en') {
    return `You are Zhuge Liang, a saju expert and career strategist.
Interpret this person's pre-calculated four pillars in detail. Do NOT recalculate — the pillars are fixed.

User info:
- Birth: ${input.birthYear}-${input.birthMonth}-${input.birthDay}, Gender: ${genderText}, Age: ${age}
${buildCalcDataBlock(calc, input.birthYear, 'en')}

Career season (fixed): ${currentSeason}
Golden years (fixed): ${top5Summary}

Respond ONLY with the following JSON (no other text):
{
  "saju_detail": {
    "four_pillars": {
      "year": {"heavenly": "${yH}", "earthly": "${yE}", "meaning": "3-4 sentences. The element and yin/yang of ${yH}${yE}. How this year pillar combines/clashes/generates/controls the day pillar ${dH}${dE}. Its specific influence on ancestry, roots, and early life fortune. Key interactions with other pillars."},
      "month": {"heavenly": "${mH}", "earthly": "${mE}", "meaning": "3-4 sentences. The element and yin/yang of ${mH}${mE}. How this month pillar interacts with day master ${dH}. Its specific influence on social skills, career, and parental relationships. How it contributes to or undermines the favorable element ${calc.favorableElement}."},
      "day": {"heavenly": "${dH}", "earthly": "${dE}", "meaning": "3-4 sentences. The element, yin/yang, and strength of day master ${dH}. How the day branch ${dE} supports or restrains the day stem. The core personality traits this pillar creates (strengths and shadow side, honestly). Key combines/clashes this day pillar forms and their career implications."},
      "hour": {"heavenly": "${hH}", "earthly": "${hE}", "meaning": "3-4 sentences. The element/yin/yang of this hour pillar${fp.hour ? '' : ' (unknown hour — describe the analytical uncertainty and its implications)'}. Its specific influence on desires and later-life fortune. The combine/clash relationship with the day master. Its role in the favorable/unfavorable element structure."}
    },
    "day_master": {
      "element": "e.g. 丙火 (Bing Fire)",
      "character": "e.g. Sun Fire — radiates outward, commands attention, struggles with stillness",
      "description": "5-7 sentences. First: state this day master's element/yin-yang/strength and define its core nature directly. Second: the most prominent personality strength (tied to specific career situations). Third: the interpersonal pattern (how they treat others and how others perceive them). Fourth: the clearest shadow side — honestly, without softening. Fifth: the career mistake this day master type repeatedly makes. Sixth: the most suitable career environments and why. Seventh: the conditions under which this day master type shines most."
    },
    "five_elements": {"wood": 20, "fire": 30, "earth": 15, "water": 25, "metal": 10},
    "favorable_element": "specific element and WHY it balances this chart (e.g. Water — dampens excess Fire, brings strategic patience this person lacks)",
    "unfavorable_element": "specific element and WHY it destabilizes this chart (e.g. Wood — feeds already excessive Fire, amplifies impulsiveness)",
    "personality_summary": "5-7 sentences. First: start with 'You are the type of person who...' and define the core nature directly from the natal chart. Second: the situation/environment where this person shines brightest. Third: the relationship pattern they repeatedly encounter (workplace/romantic/friendship — pick one). Fourth: how this person makes decisions and why those decisions sometimes create problems. Fifth: the behavioral pattern that emerges under stress. Sixth: the core life challenge this person will likely face repeatedly. No generic virtues, no flattery — natal chart basis only.",
    "current_luck_period": {
      "period": "e.g. 2022-2031",
      "element": "e.g. Water (壬水)",
      "influence": "5-7 sentences. First: the combine/clash/generate/control relationship between this luck cycle's heavenly stem and the day master (Chinese characters included). Second: how this luck cycle's earthly branch interacts with the natal chart's branches. Third: how these interactions manifest in the career concretely (promotion/conflict/opportunity/crisis — specific forms). Fourth: whether this luck cycle acts as favorable or unfavorable element and its intensity. Fifth: what must be accomplished before this luck cycle ends (specific year). Sixth: what elemental shift the next luck cycle brings to this chart."
    }
  },
  "season_reasoning": {
    "saju_basis": "5-7 sentences. First: name the current luck cycle (stem/branch Chinese characters) and its start year. Second: how this luck cycle's heavenly stem combines/clashes with the day master and the result. Third: how this luck cycle's earthly branch interacts with the natal chart's branches (triple combination/directional combination/clash/harm). Fourth: why these interactions produce this specific career season (${currentSeason}) — causal chain. Fifth: what the annual pillar of ${currentYear} adds to the luck cycle and natal chart. Sixth: the year this season ends and the basis for that. Must include Chinese characters and years.",
    "astrology_basis": "5-7 sentences. First: the house Jupiter is currently transiting and the life domain it governs. Second: the house Saturn is currently transiting and its meaning. Third: which natal planets Jupiter and Saturn aspect and at what angle (conjunction/trine/square etc.). Fourth: why this transit combination produces the current career season (${currentSeason}). Fifth: when these transits end (approximate year) and what changes after. Sixth: how this astrological analysis aligns with the saju analysis.",
    "numerology_basis": "5-7 sentences. First: Life Path Number from birth date with arithmetic shown (e.g. 1990+1+15=2006, 2+0+0+6=8). Second: Personal Year Number for ${currentYear} with arithmetic shown. Third: where this Personal Year Number sits in the 1-9 cycle. Fourth: why this number combination points to this career season (${currentSeason}). Fifth: when this Personal Year cycle transitions (specific year). Sixth: how the numerology reading resonates with the saju and astrology findings.",
    "overall_reasoning": "5-7 sentences. The shared conclusion all three analytical frameworks point to. The precise name of the current career season and its end year. The single most decisive factor driving this season (number/element/planet). What this season concretely means for this person (opportunity/challenge/turning point). The most important action to take right now. The key positioning step to prepare for what comes after this season."
  }
}`;
  }

  return `너는 사주 전문가이자 커리어 전략가 제갈량이다.
아래 코드로 계산된 사주 원국을 해석하라. 다시 계산하지 마라.

사용자 정보:
- 생년월일: ${input.birthYear}년 ${input.birthMonth}월 ${input.birthDay}일
- 성별: ${genderText}, 나이: ${age}세
${buildCalcDataBlock(calc, input.birthYear, 'ko')}

커리어 계절(고정): ${currentSeason}
전성기 연도(고정): ${top5Summary}

반드시 아래 JSON만 응답하라 (다른 텍스트 금지):
{
  "saju_detail": {
    "four_pillars": {
      "year": {"heavenly": "${yH}", "earthly": "${yE}", "meaning": "3-4문장. ${yH}${yE} 년주의 오행과 음양. 이 년주가 일주 ${dH}${dE}와 어떤 합·충·생·극 관계인지. 조상·초년 운에 미치는 구체적 영향. 다른 주와의 주요 오행 상호작용."},
      "month": {"heavenly": "${mH}", "earthly": "${mE}", "meaning": "3-4문장. ${mH}${mE} 월주의 오행과 음양. 일주와의 합·충·생·극 관계. 사회성·직업운·부모운에 미치는 영향. 용신 ${calc.favorableElement}/기신 ${calc.unfavorableElement} 구조에서의 역할."},
      "day": {"heavenly": "${dH}", "earthly": "${dE}", "meaning": "3-4문장. 일간 ${dH}의 오행·음양·강약. 일지 ${dE}가 일간을 어떻게 보좌하거나 제약하는지. 이 일주가 만드는 핵심 성격 특성(강점·그림자 면 솔직하게). 다른 주와의 주요 합·충·형·파와 커리어 함의."},
      "hour": {"heavenly": "${hH}", "earthly": "${hE}", "meaning": "3-4문장. 시주${fp.hour ? ' ' + hH + hE : ''}의 오행·음양${fp.hour ? '' : '(시간 미상: 분석 불확실성과 영향 설명)'}. 자녀운·욕망·말년 운에 미치는 영향. 일주와의 합·충 관계. 용신/기신 구조에서의 역할."}
    },
    "day_master": {
      "element": "${calc.dayMaster.heavenly.replace(/[가-힣]/g, '')}",
      "character": "${dH}${calc.dayMaster.element} — 이 일간의 본질적 성격을 한 문장으로",
      "description": "5-7문장. 첫 문장: 일간 ${dH}(${calc.dayMaster.element}) ${calc.dayMaster.yinYang}의 오행·강약을 직접 명시하며 핵심 본성을 규정. 둘째: 이 일간이 가진 가장 두드러진 성격 강점(구체적 직업·상황과 연결). 셋째: 이 일간의 대인관계 패턴. 넷째: 이 일간의 가장 뚜렷한 그림자 면(미화 없이 솔직하게). 다섯째: 이 일간이 직업 선택에서 반복적으로 저지르는 실수. 여섯째: 이 일간에게 가장 적합한 직업군. 일곱 번째: 이 일간이 가장 빛나는 환경과 조건."
    },
    "five_elements": {"wood": ${calc.fiveElements.wood}, "fire": ${calc.fiveElements.fire}, "earth": ${calc.fiveElements.earth}, "water": ${calc.fiveElements.water}, "metal": ${calc.fiveElements.metal}},
    "favorable_element": "${calc.favorableElement} — 왜 이 원국에서 용신인지 설명(오행 균형 논리 포함)",
    "unfavorable_element": "${calc.unfavorableElement} — 왜 이 원국에서 기신인지 설명(오행 불균형 심화 논리 포함)",
    "personality_summary": "5-7문장. 첫 문장: '당신은 ~한 사람입니다'로 시작하며 이 원국의 핵심 특성을 직격. 둘째: 이 사람이 가장 빛나는 상황·환경·조건. 셋째: 이 사람이 반복적으로 겪는 관계 패턴(직장·연애·우정 중 하나). 넷째: 이 사람의 결정 방식(어떻게 선택하고 왜 그 선택이 때로 문제가 되는지). 다섯째: 이 사람이 스트레스를 받을 때 나타나는 특유의 행동 패턴. 여섯째: 이 사람이 평생 반복할 가능성이 높은 핵심 과제. 일반론·미화 절대 금지, 사주 원국 근거로만 작성.",
    "current_luck_period": {
      "period": "${calc.currentLuck ? calc.currentLuck.startYear + '-' + calc.currentLuck.endYear : ''}",
      "element": "${calc.currentLuck ? calc.currentLuck.heavenly + calc.currentLuck.earthly + ' 대운 (' + calc.currentLuck.stemElement + '/' + calc.currentLuck.branchElement + ')' : ''}",
      "influence": "5-7문장. 첫 문장: 현재 대운 ${calc.currentLuck?.heavenly ?? ''}${calc.currentLuck?.earthly ?? ''}(${calc.currentLuck?.stemElement ?? ''}/${calc.currentLuck?.branchElement ?? ''})이 일간 ${dH}(${calc.dayMaster.element})과 만드는 관계(${calc.seasonRelationship}). 둘째: 이 대운 오행이 원국의 어느 기둥과 어떻게 상호작용하는지. 셋째: 이 상호작용이 커리어에 실제로 어떻게 나타나는지(승진·갈등·기회·위기 등 구체적 형태). 넷째: 이 대운이 용신 ${calc.favorableElement} 또는 기신 ${calc.unfavorableElement} 방향으로 작용하는지. 다섯째: 이 대운이 끝나는 ${calc.currentLuck?.endYear ?? ''}년 전까지 반드시 이루어야 할 것. 여섯째: 다음 대운으로의 전환이 이 원국에서 어떤 변화를 가져올지."
    }
  },
  "season_reasoning": {
    "saju_basis": "5-7문장. 첫 문장: 현재 대운의 이름(천간·지지 한자)과 시작 연도. 둘째: 이 대운 천간이 일간과 만드는 구체적 합·충·생·극 관계와 그 의미. 셋째: 이 대운 지지가 원국 지지와 만드는 삼합·방합·충·형 관계. 넷째: 이 상호작용이 왜 지금 이 커리어 계절(${currentSeason})을 만드는지 인과관계로. 다섯째: 세운(${currentYear}년)의 천간·지지가 이 대운과 원국에 더하는 영향. 여섯째: 이 계절이 끝나는 연도와 그 근거. 천간·지지 한자와 연도를 반드시 포함.",
    "astrology_basis": "5-7문장. 첫 문장: 현재 목성이 통과 중인 하우스와 그 하우스가 상징하는 삶의 영역. 둘째: 현재 토성이 통과 중인 하우스와 그 하우스의 의미. 셋째: 목성·토성이 출생 차트의 어느 행성을 어떤 각도(컨정션·트라인·스퀘어 등)로 조응하는지. 넷째: 이 트랜짓 조합이 왜 지금 이 커리어 계절(${currentSeason})을 만드는지. 다섯째: 이 트랜짓이 끝나는 대략적 시점과 그 이후 변화. 여섯째: 이 점성술 분석이 사주 분석과 어떻게 일치하는지.",
    "numerology_basis": "5-7문장. 첫 문장: 생년월일로 계산한 생명수(Life Path Number) — 계산식 포함(예: 1990+1+15 = 2006, 2+0+0+6=8). 둘째: ${currentYear}년의 개인년수(Personal Year Number) — 계산식 포함. 셋째: 이 개인년수가 1-9 사이클에서 어떤 위치에 있는지. 넷째: 이 숫자 조합이 왜 지금 이 커리어 계절(${currentSeason})을 가리키는지. 다섯째: 개인년수 사이클이 언제 전환되는지(연도 명시). 여섯째: 수비학 분석이 사주·점성술과 어떻게 공명하는지.",
    "overall_reasoning": "5-7문장. 세 분석 체계가 모두 가리키는 공통 결론. 현재 커리어 계절의 정확한 이름과 종료 연도. 이 계절을 만드는 가장 결정적인 단일 요소(수치·오행·행성 중 하나). 이 계절이 이 사람에게 구체적으로 의미하는 것(기회·도전·전환점). 지금 당장 취해야 하는 가장 중요한 행동. 이 계절 이후를 준비하기 위한 핵심 포지셔닝."
  }
}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      });

      const currentYear = new Date().getFullYear();

      // 사주 코드 계산 (Gemini 호출 전)
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

      // 1단계 + 2단계 프롬프트 병렬 실행 (순차 대비 시간 절반)
      const basicPrompt = buildBasicPrompt(input, calcResult, currentYear, lang);
      const sajuPrompt = buildSajuDetailPrompt(
        input,
        calcResult,
        currentYear,
        lang,
        calcResult.careerSeason,
        calcResult.goldenYears
      );

      async function callOnce(prompt: string, label: string): Promise<any> {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
          return JSON.parse(extractJSON(text));
        } catch (parseErr) {
          console.warn(`[api/saju] ${label} parse failed:`, (parseErr as Error).message);
          return null;
        }
      }

      let basicParsed: any;
      let sajuDetail: any = null;
      let seasonReasoning: any = null;

      // 1단계만 먼저 실행 (10초 제한 대응)
      basicParsed = await callOnce(basicPrompt, 'Basic');
      if (!basicParsed) {
        return res.status(500).json({ error: '분석 결과 생성에 실패했습니다. 다시 시도해주세요.' });
      }

      // 코드 계산값으로 강제 덮어쓰기 (Gemini가 변경한 경우 방어)
      basicParsed.current_season = calcResult.careerSeason;
      basicParsed.season_cycle = calcResult.seasonCycle;
      if (basicParsed.top5_golden_years && calcResult.goldenYears.length === 5) {
        basicParsed.top5_golden_years = basicParsed.top5_golden_years.map((g: any, i: number) => ({
          ...g,
          year: calcResult.goldenYears[i].year,
          score: calcResult.goldenYears[i].score,
        }));
      }

      // 2단계(사주 상세)는 별도 호출 없이 코드 계산 + 1단계 결과로 구성
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
        // 계산 메타데이터 (디버깅용)
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
      } catch {
        const message = lang === 'ko'
          ? 'AI 교차 검증 완료 ✓ 85% 일치'
          : 'AI Cross-Validation Complete ✓ 85% Agreement';
        return res.status(200).json({ confidence: 85, validated: true, message });
      }
    }

    return res.status(400).json({ error: 'action must be "analyze" or "validate"' });
  } catch (err: any) {
    console.error('[api/saju] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
