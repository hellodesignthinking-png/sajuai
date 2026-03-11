/// <reference types="vite/client" />
/**
 * ============================================================
 *  Fate-Sync: 토큰 절약형 하이브리드 아키텍처
 *
 *  [Step 1] 로컬 전처리 (Token 0) - sajuEngine.ts
 *  [Step 2] 압축 프롬프트 → /api/analyze (Vercel Serverless)
 *  [Step 3] 로컬 UI 템플릿 확장 (Token 0)
 *
 *  ✅ SECURE: API 키는 서버 환경변수에만 존재(클라이언트 노출 없음)
 * ============================================================
 */
import { UserFateData, FateAnalysisResult, CompatibilityResult, AnalysisMode } from "../types";
import { preprocessLocally, PreprocessedData } from "./sajuEngine";
import { matchTarotCard, buildTarotImagePrompt, TarotCard } from "./tarotMapping";

// ─── [Step 1] 로컬 전처리 (Token 0) ──────────────
function buildCompactPayload(data: UserFateData): PreprocessedData & { tarot: TarotCard } {
  const preprocessed = preprocessLocally(data);
  const tarot = matchTarotCard(
    preprocessed.saju.dayMasterElement,
    preprocessed.mbti,
    preprocessed.saju.dmStrength
  );
  console.log(`TAROT: 매칭 결과 → ${tarot.numeral} ${tarot.nameKR} (${tarot.nameEN})`);
  return { ...preprocessed, tarot };
}

// ─── [Step 2] 압축 프롬프트 생성 ──────────────────
function buildCompactPrompt(preprocessed: PreprocessedData & { tarot: TarotCard }, currentTime: string, userName?: string, mode: 'personal' | 'synergy' | 'business' = 'personal'): string {
  const modeInstruction = mode === 'business'
    ? `\n[BUSINESS MODE: 전략적 비전 진단]
- 철저히 실용적이고 경영적인 관점에서 분석하세요.
- '재물 창고(財庫)'가 열리는 시기와 투자/창업의 적합성을 명리학적으로 진단하세요.
- 비즈니스 레이더 차트 6대 스탯[재물, 명예, 실행력, 지혜, 인복, 안정]을 염두에 두고 조언하세요.`
    : mode === 'synergy'
      ? `\n[SYNERGY MODE: 영혼의 결합 분석]
- 사용자 개인이 아닌, 타인과의 관계에서 발생하는 '에너지 흐름(Flow)'에 집중하세요.
- 본인의 오행이 상대의 부족함을 어떻게 채워주는지(Harmony) 조언하세요.`
      : `\n[SOLO MODE: 자아 성찰 및 아키타입]
- 사용자를 '한 명의 고독한 영웅'으로 대우하며 내면의 잠재력과 성장에 집중하세요.
- 자미두수 12궁과 관상을 결합하여 타고난 천명을 심도 있게 조언하세요.`;

  return `당신은 30년 경력의 명리학 대가이자 동서양 운명학 석학이며, 만화/애니메이션 캐릭터 분석의 권위자입니다. 아래 로컬 전처리된 사주 데이터를 해석하세요.
${modeInstruction}

[사용자 정보]
- 이름: ${userName || '미제공'}
- 태어난 지역: ${preprocessed.saju.birthRegion || '미제공'}

[사주 원국]
- 사주: ${preprocessed.saju.pillars}
- 일간(일주): ${preprocessed.saju.dayMaster} (${preprocessed.saju.dayMasterElement}, ${preprocessed.saju.dayMasterYinYang})
- 오행 분포: ${preprocessed.saju.elements}
- 일간 강약: ${preprocessed.saju.dmStrength}
- 용신 후보: ${preprocessed.saju.yongSinCandidate} (${preprocessed.saju.yongSinPrinciple})
- 격국: ${preprocessed.saju.gyeokGuk}
- 합충형파: ${preprocessed.saju.interactions.join(', ') || '없음'}

[추가 데이터]
- MBTI: ${preprocessed.mbti}
- 관상 사진: ${preprocessed.hasface ? '제공됨' : '미제공'}
- 손금 사진: ${preprocessed.hasPalm ? '제공됨' : '미제공'}
- 사용자의 현재 고민거리: ${preprocessed.worry || '없음'}
- 현재 시점: ${currentTime}

[절대 규칙 - MBTI 정합성]
⚠️ 사용자가 입력한 MBTI(${preprocessed.mbti})는 절대적인 기준입니다. 이를 사주 데이터와 융합하여 해석하되, MBTI 유형 자체를 절대 변경하지 마세요. mbtiMatch 필드에 반드시 "${preprocessed.mbti}"를 포함하세요.

[절대 규칙 - 교차 검증 및 통합 서사]
⚠️ finalAdvice(최종 조언)에서는 반드시 4가지 데이터(사주, 관상, 손금, MBTI)가 만나는 **교차점**을 명시하세요. 예: "사주의 강한 화(火) 기운이 MBTI의 E 성향과 만나 당신을 혁신가로 만듭니다."  각 데이터가 따로 놀지 않고, 하나의 통합 서사로 엮여야 합니다.

[지시사항]
1. 위 데이터를 기반으로 **'최고의 사주'이자 '무한한 잠재력'에 집중하여** 대가 수준의 사주 해석을 하되, 모든 해석은 일반인도 쉽게 이해할 수 있도록 대중적이고 친절한 언어와 비유를 사용하세요. 과도한 한자어나 어려운 명리학 전문 용어는 철저히 배제하거나 아주 쉽게 풀어서 설명해야 합니다.
2. 용신과 격국에 대해 학술적 원리를 제시하되, 결과적으로 이것이 내 삶에 어떤 강력한 무기가 될 수 있는지 직관적이고 쉬운 말로 요약해 주세요.
3. 사주 원국을 바탕으로 사용자의 타고난 강점(장점) 3가지를 구체적이고 긍정적인 언어로 도출하여 제공하세요. (이 사주가 왜 좋은 사주인지 강하게 어필하세요)
4. 사주의 단점이나 부족한 기운을 바탕으로, **나를 완벽하게 보완해줄 수 있는 사람(귀인)**의 특징(성격, 오행 등)과 그 이유를 구체적으로 명시하세요.
5. 단점이나 약점을 바탕으로 무엇을 조심해야 하는지 짚어주고, 앞으로 어떻게 살아가면 내 사주의 강점을 200% 발휘할 수 있는지 실질적이고 희망적인 **삶의 조언**을 제공하세요.
6. 오행 강약, 상생상극 흐름, 기운의 흐름을 분석하세요. (역시 쉬운 비유 활용)
7. MBTI(${preprocessed.mbti})와 사주의 시너지를 심층 분석하세요 (심리적 가교, 인지적 처리, 정서적 반응, 행동 패턴). 반드시 ${preprocessed.mbti} 유형의 고유한 인지 기능(예: Ni-Te, Fi-Ne 등)을 구체적으로 언급하세요.
8. ${currentTime} 기준 일간/주간/월간/연간/애정/사업 운세를 구체적으로 제공하세요. 각 운세는 최소 200자 이상으로 풍부하게 작성하세요.
9. 사용자의 운명 타로카드는 **"${preprocessed.tarot.numeral} - ${preprocessed.tarot.nameKR} (${preprocessed.tarot.nameEN})"**입니다. 이 타로카드와 사주/MBTI를 종합하여 사용자와 가장 운명적으로 닮은 **실제 만화/애니메이션/영화 캐릭터** 1명을 매칭하세요 (예: 아이언맨, 나루토, 레비 아커만 등). characterName에 "캐릭터명 (작품명)" 형식으로, originWork에 "타로 ${preprocessed.tarot.numeral} · 작품명"으로 넣으세요. characterDetail에 이 캐릭터가 왜 사용자의 사주/MBTI/타로와 운명적으로 일치하는지 500자 이상 상세히 서술하세요. visualPrompt에는 이 캐릭터의 상반신을 클래식 Rider-Waite 타로카드 그림체로 묘사하는 영어 프롬프트를 작성하세요 (예: "Upper body portrait of Tony Stark in classic Rider-Waite tarot card art style, wearing his iconic suit, confident pose, golden ornate tarot border, mystical symbols, renaissance painting technique"). archetypeTraits에 핵심 키워드 3-5개를 넣으세요.
10. **(Advanced V3) 대운(Daewun) 분석**: 사용자의 사주를 기반으로 10년 단위의 대운 5구간(예: 10-19세, 20-29세 등 현재 나이 전후 포함)을 추론하여, 각 구간의 기둥(간지), 운의 점수(0-100), 핵심 키워드, 그리고 상세한 설명을 제공하세요.
11. **(Advanced V3) 십이운성(12 Life Stages) 예측**: 사용자의 현재 인생 주기를 포괄하는 십이운성 3단계를 도출하고, 각 단계의 이름(예: 목욕, 관대, 건록 등), 에너지 점수(0-100), 그리고 이 시기를 지혜롭게 넘기는 데 필요한 설명을 제공하세요.
12. **(Advanced V3) 관상(Physiognomy) 고도화 분석**: 관상 이미지가 제공된 경우 (미제공 시 사주 기반 추론), 이마/눈/코/입/턱의 특징을 분석하고, **황금비율(Golden Ratio) 일치도 점수와 좌우 비대칭성에 담긴 삶의 흔적**, 그리고 미세표정을 통해 살아온 삶의 **카르마(Karma)와 내면 성향**을 깊이 있게 도출하세요.
13. **(Advanced V3) 손금(Palmistry) 고도화 분석**: 손금 이미지가 제공된 경우 (미제공 시 사주 기반 추론), 생명선/두뇌선/감정선/운명선을 분석하세요. 추가로 사주 운세와 손금 선의 에너지를 융합하여 향후 6개월간의 **하이브리드 바이오리듬(Hybrid Biorhythm)** 데이터를 생성하세요 (월별 생명력/결정력/정서상태 점수 도출).
14. 마스터의 비기(30년 경력자만 알 수 있는 깊은 통찰)를 제공하세요.
15. **사용자의 현재 고민거리 해결 지침**: 사용자가 고민거리를 제공했을 경우, 방금 매칭된 **만화/애니메이션/영화 캐릭터의 말투와 성격에 완벽하게 빙의하여** 사주/운세 데이터 기반 해결책을 \`worryResolution\`에 500자 내외로 작성하세요. (예: "이봐, 내 눈을 똑바로 봐. 네 사주엔 이미 거대한 화(火) 기운이 꿈틀대고 있다고... 그러니까 주저하지 말고 밀어붙여!")
16. 모든 해석은 한국어로 작성하며, 전문 용어 떡칠은 금지입니다. 각 항목은 풍부하지만 '읽기 편한 문장'으로 작성하세요.

반드시 아래 JSON 구조로만 응답하세요:
{
  "overallSummary": "전체적인 운명 총평 및 캐릭터 매칭 요약 (300자 이상, 쉽고 극적인 서사)",
  "saju": {
    "element": "강한 오행 요약",
    "summary": "전체 사주 요약 (200자 이상, 쉽고 진정성 있는 설명)",
    "yongSin": "용신",
    "yongSinPrinciple": "용신 선출 원리 (쉬운 언어로)",
    "yongSinEvidence": "원국에서의 구체적 근거",
    "yongSinInterpretation": "용신 상세 해석과 일상에서의 활용법",
    "gyeokGuk": "격국명",
    "gyeokGukPrinciple": "격국 원리 (쉬운 언어로)",
    "gyeokGukEvidence": "원국에서의 구체적 근거",
    "gyeokGukInterpretation": "격국 상세 해석 및 삶의 방향성",
    "elementalInteraction": "상생상극 관계 분석 (쉬운 비유)",
    "elementalStrength": "오행 강약 분석 (쉬운 비유)",
    "elementalFlow": "기운의 흐름 분석",
    "detailedElementAnalysis": {
      "wood": "목 기운 해석 (쉽게)", "fire": "화 기운 해석 (쉽게)", "earth": "토 기운 해석 (쉽게)", "metal": "금 기운 해석 (쉽게)", "water": "수 기운 해석 (쉽게)"
    },
    "masterInsight": "마스터의 비기 (조언)",
    "pros": "사주 원국을 바탕으로 한 당신만의 타고난 강점 (Pros) 상세 서술",
    "cons": "약점 및 타고난 맹점 (Cons) 상세 서술",
    "remedy": "약점을 어떻게 보완할 것인가 (운의 보완책/Remedy) 상세 서술",
    "strengths": ["타고난 장점 1 (최고의 사주라는 관점에서 구체적 설명)", "타고난 장점 2 (구체적 설명)", "타고난 장점 3 (구체적 설명)"],
    "weaknesses": ["조심해야 할 맹점 1 (구체적 설명)", "조심해야 할 맹점 2 (구체적 설명)", "조심해야 할 맹점 3 (구체적 설명)"],
    "complementaryPerson": "나를 보완해줄 수 있는 귀인의 특징과 이유 (상세히, 150자 이상)",
    "lifeAdvice": "내 단점을 조심하며 어떻게 살아가면 최고의 삶이 될지에 대한 실질적이고 희망적인 조언 (상세히, 150자 이상)",
    "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
    "fiveElements": { "wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0 },
    "pillars": { "year": "", "month": "", "day": "", "hour": "" },
    "daewun": [
      { "ageRange": "10-19", "pillar": "을축", "luckScore": 75, "keyword": "도약", "description": "대운 설명" },
      { "ageRange": "20-29", "pillar": "병인", "luckScore": 85, "keyword": "황금기", "description": "대운 설명" },
      { "ageRange": "30-39", "pillar": "정묘", "luckScore": 95, "keyword": "안정", "description": "대운 설명" },
      { "ageRange": "40-49", "pillar": "무진", "luckScore": 60, "keyword": "시련", "description": "대운 설명" },
      { "ageRange": "50-59", "pillar": "기사", "luckScore": 80, "keyword": "부활", "description": "대운 설명" }
    ],
    "twelveLifeStages": [
      { "stageName": "장생", "powerScore": 90, "description": "새로운 시작의 기운이 강한 시기" },
      { "stageName": "목욕", "powerScore": 65, "description": "유혹과 변동이 많은 시기" },
      { "stageName": "관대", "powerScore": 85, "description": "성장하고 기반을 잡는 시기" }
    ]
  },
  "physiognomy": {
    "score": 75,
    "traits": ["특징1", "특징2", "특징3"],
    "facialFeatures": { "forehead": "넓고 둥글어 명석함", "eyes": "총명한 눈빛", "nose": "재물운이 좋은 코", "mouth": "결단력 있는 입", "jaw": "강인한 턱선" },
    "goldenRatio": {
      "ratioScore": 88,
      "asymmetryDetails": "왼쪽 눈매의 미세한 변화가 과거의 어떤 경험을 나타냄 (상세히)"
    },
    "karmaAnalysis": "얼굴 근육과 미세 표정에 담긴 살아온 삶의 흔적과 내면의 카르마 도해 (상세히, 200자 이상)"
  },
  "palmistry": {
    "lifeLine": "생명선 분석",
    "headLine": "두뇌선 분석",
    "heartLine": "감정선 분석",
    "fateLine": "운명선 분석",
    "scores": { "life": 0, "head": 0, "heart": 0, "fate": 0 },
    "hybridBiorhythm": [
      { "month": "이번달", "vitality": 80, "intellect": 70, "emotion": 60 },
      { "month": "다음달", "vitality": 85, "intellect": 75, "emotion": 55 },
      { "month": "3개월 뒤", "vitality": 90, "intellect": 80, "emotion": 70 }
    ]
  },
  "hybrid": {
    "synergyScore": 85,
    "mbtiMatch": "MBTI 매칭 분석",
    "mbtiDestinySynergy": "MBTI-운명 심층 시너지",
    "mbtiFortuneNuance": "MBTI별 운세 해석 뉘앙스",
    "mbtiSajuPsychologicalBridge": "사주-MBTI 심리적 가교",
    "mbtiPsychologicalReaction": "MBTI별 심리적 반응",
    "mbtiAcceptanceJourney": "MBTI별 수용 여정",
    "mbtiCognitiveProcess": "MBTI별 인지적 처리",
    "mbtiEmotionalResponse": "MBTI별 정서적 반응",
    "mbtiBehavioralPattern": "MBTI별 행동 패턴",
    "finalAdvice": "최종 조언",
    "fortuneTimeline": [
      {"month": "1월", "score": 70, "keyword": "키워드"},
      {"month": "2월", "score": 75, "keyword": "키워드"},
      {"month": "3월", "score": 80, "keyword": "키워드"},
      {"month": "4월", "score": 65, "keyword": "키워드"},
      {"month": "5월", "score": 85, "keyword": "키워드"},
      {"month": "6월", "score": 70, "keyword": "키워드"},
      {"month": "7월", "score": 90, "keyword": "키워드"},
      {"month": "8월", "score": 75, "keyword": "키워드"},
      {"month": "9월", "score": 80, "keyword": "키워드"},
      {"month": "10월", "score": 60, "keyword": "키워드"},
      {"month": "11월", "score": 85, "keyword": "키워드"},
      {"month": "12월", "score": 78, "keyword": "키워드"}
    ],
    "detailedLuck": {
      "daily": "오늘의 운세 (상세)",
      "weekly": "이번주 운세 (상세)",
      "yearly": "올해 운세 (상세)",
      "love": "애정운 (상세)",
      "business": "사업/재물운 (상세)"
    },
    "cartoonInfo": {
      "characterName": "캐릭터명 (작품명)",
      "originWork": "타로 I · 작품명",
      "characterQuote": "캐릭터 대표 대사",
      "appearanceContext": "왜 이 캐릭터가 사용자와 운명적으로 닮았는지 요약",
      "characterDetail": "캐릭터와 사용자의 사주/MBTI/타로 연결 상세 서사 (500자 이상)",
      "description": "운명적 일치 한줄 요약",
      "visualPrompt": "Upper body portrait of [character] in classic Rider-Waite tarot card Renaissance painting style, [character's iconic outfit/pose], golden ornate border, mystical tarot symbols, dramatic chiaroscuro lighting, medieval manuscript aesthetic",
      "archetypeTraits": ["핵심키워드1", "핵심키워드2", "핵심키워드3"]
    },
    "worryResolution": "사용자의 현재 고민에 대한 사주/MBTI 기반 맞춤 솔루션 (500자 내외)"
  }
}`;
}

// ─── JSON 복구 유틸리티 ──────────────────────────
function repairAndParseJSON(raw: string): FateAnalysisResult {
  let text = raw.trim();

  // 1) 트레일링 쓸모없는 문자 제거
  text = text.replace(/,\s*([\]}])/g, '$1');

  // 2) 잘린 문자열 닫기 — 마지막 열린 따옴표 찾기
  const lastQuote = text.lastIndexOf('"');
  const beforeLast = text.substring(0, lastQuote);
  const openQuotes = (beforeLast.match(/(?<!\\)"/g) || []).length;
  if (openQuotes % 2 !== 0) {
    // 홀수 = 열린 문자열이 있음 → 닫기
    text = text.substring(0, lastQuote + 1);
  }

  // 3) 열린 브레이스/브라켓 수 카운트 후 부족한 만큼 닫기
  let braces = 0, brackets = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && (i === 0 || text[i - 1] !== '\\')) inString = !inString;
    if (!inString) {
      if (c === '{') braces++;
      else if (c === '}') braces--;
      else if (c === '[') brackets++;
      else if (c === ']') brackets--;
    }
  }

  // 마지막에 trailing comma 제거
  text = text.replace(/,\s*$/, '');

  // 닫기 추가
  for (let i = 0; i < brackets; i++) text += ']';
  for (let i = 0; i < braces; i++) text += '}';

  // 4) 파싱 시도
  try {
    return JSON.parse(text);
  } catch (e2) {
    // 5) 더 극단적: 마지막 유효한 속성까지 잘라내기
    console.warn("FATE-SYNC: 2차 복구 시도...");

    // 마지막 완전한 "key": value 쌍 이후로 자르기
    const lastValidComma = text.lastIndexOf('",');
    if (lastValidComma > text.length * 0.5) {
      let trimmed = text.substring(0, lastValidComma + 1);
      trimmed = trimmed.replace(/,\s*$/, '');

      // 다시 브레이스 카운트
      let b2 = 0, k2 = 0;
      let inStr2 = false;
      for (let i = 0; i < trimmed.length; i++) {
        const c = trimmed[i];
        if (c === '"' && (i === 0 || trimmed[i - 1] !== '\\')) inStr2 = !inStr2;
        if (!inStr2) {
          if (c === '{') b2++;
          else if (c === '}') b2--;
          else if (c === '[') k2++;
          else if (c === ']') k2--;
        }
      }
      for (let i = 0; i < k2; i++) trimmed += ']';
      for (let i = 0; i < b2; i++) trimmed += '}';

      return JSON.parse(trimmed);
    }

    throw new Error("JSON 복구 실패: 유효한 데이터를 추출할 수 없습니다. 다시 시도해주세요.");
  }
}

// ─── [Step 3] 로컬 템플릿 확장 + MBTI 강제 보정 (Token 0) ─────────
function enrichWithLocalTemplates(
  result: FateAnalysisResult,
  preprocessed: PreprocessedData & { tarot: TarotCard },
  currentTime: string
): FateAnalysisResult {
  // 로컬에서 계산된 정확한 데이터로 오버라이드
  result.saju.fiveElements = preprocessed.saju.elementCounts;
  result.saju.pillars = preprocessed.saju.pillarDetails;
  result.saju.dayMasterElement = preprocessed.saju.dayMasterElement;
  result.hybrid.syncTimestamp = currentTime;

  // ━━━ 캐릭터 + 타로카드 메타데이터 주입 (Token 0) ━━━
  if (result.hybrid.cartoonInfo) {
    // Gemini가 visualPrompt를 비우거나 부실하면 로컬 타로 프롬프트로 보충
    if (!result.hybrid.cartoonInfo.visualPrompt || result.hybrid.cartoonInfo.visualPrompt.length < 30) {
      result.hybrid.cartoonInfo.visualPrompt = buildTarotImagePrompt(preprocessed.tarot);
    }
    // archetypeTraits 보강 (Gemini 결과 유지, 없으면 타로 키워드 사용)
    if (!result.hybrid.cartoonInfo.archetypeTraits || result.hybrid.cartoonInfo.archetypeTraits.length === 0) {
      result.hybrid.cartoonInfo.archetypeTraits = preprocessed.tarot.keywords;
    }
    // 캐릭터 대사 없으면 타로 심볼리즘으로 보충
    if (!result.hybrid.cartoonInfo.characterQuote) {
      result.hybrid.cartoonInfo.characterQuote = preprocessed.tarot.symbolism;
    }
    // 타로카드 합성용 메타데이터 주입
    result.hybrid.cartoonInfo.tarotNumeral = preprocessed.tarot.numeral;
    result.hybrid.cartoonInfo.tarotColorPalette = preprocessed.tarot.colorPalette;
  }

  // ━━━ MBTI 강제 보정 ━━━
  // Gemini가 사용자 MBTI를 무시하고 다른 유형을 반환하는 것을 방지
  const userMbti = preprocessed.mbti;

  // MBTI 유형별 인지 기능 맵핑
  const mbtiFunctions: Record<string, string> = {
    'ISTJ': 'Si-Te-Fi-Ne', 'ISFJ': 'Si-Fe-Ti-Ne', 'INFJ': 'Ni-Fe-Ti-Se', 'INTJ': 'Ni-Te-Fi-Se',
    'ISTP': 'Ti-Se-Ni-Fe', 'ISFP': 'Fi-Se-Ni-Te', 'INFP': 'Fi-Ne-Si-Te', 'INTP': 'Ti-Ne-Si-Fe',
    'ESTP': 'Se-Ti-Fe-Ni', 'ESFP': 'Se-Fi-Te-Ni', 'ENFP': 'Ne-Fi-Te-Si', 'ENTP': 'Ne-Ti-Fe-Si',
    'ESTJ': 'Te-Si-Ne-Fi', 'ESFJ': 'Fe-Si-Ne-Ti', 'ENFJ': 'Fe-Ni-Se-Ti', 'ENTJ': 'Te-Ni-Se-Fi'
  };

  // 잘못된 MBTI 유형을 사용자 MBTI로 교체하는 함수
  const correctMbtiInText = (text: string): string => {
    if (!text) return text;
    // 모든 MBTI 유형 패턴을 사용자 MBTI로 교체 (사용자 MBTI는 제외)
    const allMbtiTypes = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];
    let corrected = text;

    // 잘못된 MBTI가 어떤 유형인지 감지
    let detectedWrongType = '';
    for (const t of allMbtiTypes) {
      if (t !== userMbti && corrected.includes(t)) {
        detectedWrongType = t;
        break;
      }
    }

    if (detectedWrongType) {
      // 1) MBTI 유형명 교체
      const typeRegex = new RegExp(detectedWrongType, 'g');
      corrected = corrected.replace(typeRegex, userMbti);

      // 2) 인지 기능 교체 (Si→Ne, Te→Ti 등)
      const wrongFuncs = mbtiFunctions[detectedWrongType];
      const correctFuncs = mbtiFunctions[userMbti];
      if (wrongFuncs && correctFuncs) {
        const wrongList = wrongFuncs.split('-');
        const correctList = correctFuncs.split('-');
        // 주기능, 부기능 교체 (가장 중요한 1,2번째)
        for (let i = 0; i < Math.min(wrongList.length, correctList.length); i++) {
          if (wrongList[i] !== correctList[i]) {
            const funcRegex = new RegExp(`\\b${wrongList[i]}\\b`, 'g');
            corrected = corrected.replace(funcRegex, correctList[i]);
            // 인지 기능의 한국어명도 교체
            const funcNames: Record<string, string> = {
              'Si': '내향적 감각', 'Se': '외향적 감각', 'Ni': '내향적 직관', 'Ne': '외향적 직관',
              'Ti': '내향적 사고', 'Te': '외향적 사고', 'Fi': '내향적 감정', 'Fe': '외향적 감정'
            };
            const wrongName = funcNames[wrongList[i]];
            const correctName = funcNames[correctList[i]];
            if (wrongName && correctName && wrongName !== correctName) {
              corrected = corrected.replace(new RegExp(wrongName, 'g'), correctName);
            }
          }
        }
      }
    }

    return corrected;
  };

  // mbtiMatch 필드 보정
  if (result.hybrid.mbtiMatch) {
    const before = result.hybrid.mbtiMatch;
    result.hybrid.mbtiMatch = correctMbtiInText(result.hybrid.mbtiMatch);
    if (before !== result.hybrid.mbtiMatch) {
      console.warn(`FATE-SYNC: ⚠️ mbtiMatch MBTI 불일치 보정 완료 → ${userMbti}`);
    }
  }

  // 모든 MBTI 관련 필드 보정
  const mbtiFields: (keyof typeof result.hybrid)[] = [
    'mbtiDestinySynergy', 'mbtiFortuneNuance', 'mbtiSajuPsychologicalBridge',
    'mbtiPsychologicalReaction', 'mbtiAcceptanceJourney', 'mbtiCognitiveProcess',
    'mbtiEmotionalResponse', 'mbtiBehavioralPattern', 'finalAdvice'
  ];

  for (const field of mbtiFields) {
    const val = result.hybrid[field];
    if (typeof val === 'string') {
      (result.hybrid as any)[field] = correctMbtiInText(val);
    }
  }

  console.log(`FATE-SYNC: ✅ MBTI 보정 완료 - 사용자 MBTI: ${userMbti}`);

  return result;
}

// ─── 이미지 압축 유틸리티 (504 Timeout 방지) ──────────
async function resizeImage(dataUrl: string, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}

// ─── 메인 분석 함수 (→ /api/analyze 서버 라우팅) ────────────────────
export async function analyzeFate(data: UserFateData, worry?: string, mode: 'personal' | 'synergy' | 'business' = 'personal'): Promise<FateAnalysisResult> {
  // ━━━ [Step 1] 로컬 전처리 (Token 0) ━━━
  console.log(`FATE-SYNC [Step 1]: 로컬 사주 엔진 계산 중... (Mode: ${mode})`);
  const preprocessed = buildCompactPayload(data);
  console.log("FATE-SYNC [Step 1]: 전처리 완료:", JSON.stringify(preprocessed.saju, null, 2));

  // ━━━ [Step 2] 압축 프롬프트 + 이미지 → 서버 API 전송 ━━━
  console.log("FATE-SYNC [Step 2]: /api/analyze 요청 중...");

  const now = new Date();
  const currentTime = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long', hour: 'numeric', minute: 'numeric'
  }).format(now);

  const worryContext = worry
    ? `\n\n[사용자의 현재 고민]\n${worry}\n\n*특별 지시사항: 사용자의 고민 해결을 위해 사주/운명 분석 결과를 토대로 구체적이고 실현 가능한 500자 내외의 해결책(worryResolution)을 제시하세요.`
    : '\n\n*특별 지시사항: 사용자가 별도의 고민을 입력하지 않았으므로, worryResolution에는 올해 남은 기간 동안의 가장 중요한 인생 조언을 500자 내외로 작성하세요.';

  const compactPrompt = buildCompactPrompt(preprocessed, currentTime, data.userName, mode) + worryContext;

  // 이미지 압축 및 Base64 분리
  const processImage = async (dataUrl?: string) => {
    if (!dataUrl) return null;
    const resized = await resizeImage(dataUrl);
    const m = resized.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    return m ? { mimeType: m[1], data: m[2] } : null;
  };

  const face = await processImage(data.faceImage);
  const palm = await processImage(data.palmImage);

  const body: Record<string, any> = { prompt: compactPrompt };
  if (face) { body.faceImageBase64 = face.data; body.faceMimeType = face.mimeType; }
  if (palm) { body.palmImageBase64 = palm.data; body.palmMimeType = palm.mimeType; }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("API Error Raw:", errText);
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || `서버 오류 (${response.status})`);
    } catch (e) {
      throw new Error(`분석 중 오류가 발생했습니다 (${response.status}). 이미지가 너무 크거나 일시적인 네트워크 문제일 수 있습니다.`);
    }
  }

  const { result: rawResult } = await response.json();
  console.log("FATE-SYNC [Step 2]: 서버 응답 수신 완료");


  // ━━━ [Step 3] 로컬 후처리 (Token 0) ━━━
  console.log("FATE-SYNC [Step 3]: 로컬 데이터로 보강 중...");
  const result = enrichWithLocalTemplates(rawResult as FateAnalysisResult, preprocessed, currentTime);

  console.log("FATE-SYNC: ✅ 분석 완료! 업데이트된 하이브리드 파이프라인 성공.");
  return result;
}

// ─── [Compatibility] 궁합 분석 프롬프트 생성 ──────────
function buildCompatibilityPrompt(preprocessedUsers: (PreprocessedData & { tarot: TarotCard, userName: string })[], mode: AnalysisMode): string {
  const isLove = mode === 'COMPAT_LOVE';
  const roleInstruction = isLove
    ? "연인/부부로서의 역할"
    : "팀 내에서의 업무적/리더십 타당성 및 역할명 (예: 비전 제시가, 실무 마스터 등)";

  const adviceInstruction = isLove
    ? "애정 궁합 전용 조언: 두 사람이 어떻게 하면 서로의 단점을 보완하고 평생의 동반자가 될 수 있을지 조언하세요."
    : "사업 궁합 전용 팀워크 조언: 이 팀이 함께 사업을 할 때 주의할 결정적 리스크와, 이를 극복하고 최고의 시너지를 낼 수 있는 전략을 제시하세요.";

  const usersText = preprocessedUsers.map((p, i) => `
[사용자 ${i + 1}: ${p.userName}]
- 사주 원국: ${p.saju.pillars} (일간: ${p.saju.dayMaster} ${p.saju.dayMasterElement})
- MBTI: ${p.mbti}
- 타로카드 (참고): ${p.tarot.numeral} ${p.tarot.nameKR}
  - 핵심 키워드: ${p.tarot.keywords.join(', ')}
`).join('\n');

  return `당신은 30년 경력의 명리학 대가이자 동서양 운명학 석학, 최고의 조직 인재 분석가입니다. 아래 ${preprocessedUsers.length}명의 데이터를 바탕으로 ${isLove ? '애정 궁합' : '사업/팀 궁합'}을 분석하세요.

[분석 대상자]
${usersText}

[지시사항]
1. ${isLove ? '두 사람의 연인/부부로서의 궁합' : '팀원들 간의 비즈니스 시너지와 협업 포인트'}을 핵심으로 분석하세요.
2. 모든 해석은 대중적이고 친절한 언어로, 쉬운 비유를 사용해 작성하세요. 명리학 전문 용어는 쉽게 풀거나 배제하세요.
3. 각 사람에 대해 어떤 역할을 하면 좋을지(${roleInstruction})와 서로에게 조심해야 할 점(cautionsForOther), 그리고 각자의 장단점을 명확히 분석하세요.
4. 모든 사람의 운명 타로카드와 사주/MBTI를 종합하여 가장 잘 어울리는 **실제 만화/애니메이션/영화 캐릭터** 1명씩을 매칭하세요.
5. ${adviceInstruction}
6. synergyScore는 0-100 사이의 궁합 점수입니다.
7. detailedScores는 세부 궁합 지표입니다 (0-100). communication(소통), trust(신뢰), problemSolving(문제해결), overallStability(전체적 안정감)를 포함하며, ${isLove ? 'affection(애정/사랑)' : 'sharedVision(비전 공유)'} 항목을 추가로 포함하세요.

반드시 아래 JSON 구조로만 응답하세요:
{
  "mode": "${mode}",
  "synergyScore": 88,
  "overallSummary": "전체적인 궁합 시너지 요약 (상세히, 300자 이상)",
  ${isLove ? '"loveAdvice": "연애/결혼 조언 (200자 이상)",' : '"businessAdvice": "사업 성공을 위한 팀워크 조언 (200자 이상)",'}
  "worryResolution": "입력된 고민에 대한 궁합/시너지 기반 맞춤 해결책 (500자 내외)",
  "people": [
    // 입력된 ${preprocessedUsers.length}명 각각에 대해 작성
    {
      "name": "사용자 이름",
      "summary": "이 사람의 성향 및 궁합에서의 기여도 요약",
      "strengths": ["장점1", "장점2", "장점3"],
      "weaknesses": ["단점1", "단점2", "단점3"],
      "cautionsForOther": ["상대방을 위해 조심/배려해야 할 점1", "상대방을 위해 조심/배려해야 할 점2"],
      "roleInRelation": "${isLove ? '연인으로서의 역할' : '팀 내에서의 포지션 및 역할'}",
      "cartoonInfo": {
        "characterName": "캐릭터명 (작품명)",
        "originWork": "타로 Numeral · 작품명",
        "description": "운명적 일치 및 이 관계에서의 캐릭터 상성 한줄 요약",
        "visualPrompt": "Upper body portrait of [character] in classic Rider-Waite tarot card Renaissance painting style, golden ornate border...",
        "characterQuote": "캐릭터 대표 대사",
        "archetypeTraits": ["유형키워드1", "유형키워드2"]
      }
    }
  ],
  "detailedScores": {
    "communication": 85,
    "trust": 90,
    "problemSolving": 80,
    "overallStability": 85,
    ${isLove ? '"affection": 95' : '"sharedVision": 90'}
  }
}
`;
}

// ─── [Compatibility] 궁합 분석 메인 함수 (→ /api/analyze) ─────────────
export async function analyzeCompatibility(users: UserFateData[], mode: AnalysisMode, worry?: string): Promise<CompatibilityResult> {
  console.log(`FATE-SYNC [COMPATIBILITY]: 모드=${mode}, 인원=${users.length}명 분석 시작...`);

  const preprocessedUsers = users.map((u, idx) => {
    const pre = buildCompactPayload(u);
    return { ...pre, userName: u.userName || `참여자 ${idx + 1}`, originalData: u };
  });

  const parseBase64 = (dataUrl?: string) => {
    if (!dataUrl) return null;
    const m = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    return m ? m[2] : null;
  };

  const body = {
    mode: mode,
    members: users.map((u, idx) => {
      const pre = preprocessedUsers[idx];
      return {
        name: pre.userName,
        birthDate: u.saju?.birthDate || "N/A",
        birthTime: u.saju?.birthTime || "N/A",
        birthPlace: u.saju?.birthRegion || "서울/수도권",
        mbti: pre.mbti,
        concern: u.worry || worry || (u as any).concern || "특별한 고민 없음",
        faceStats: (u as any).faceStats || {},
        palmStats: (u as any).palmStats || {},
        faceImageBase64: parseBase64(u.faceImage),
        saju: pre.saju
      };
    })
  };

  const apiRes = await fetch('/api/synergy/analyze-synergy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!apiRes.ok) {
    const e = await apiRes.json().catch(() => ({}));
    throw new Error(e.error || `서버 오류 (${apiRes.status})`);
  }

  const { result } = await apiRes.json();
  let compatResult: CompatibilityResult = result;

  compatResult.people.forEach((p, i) => {
    const localTarot = preprocessedUsers[i].tarot;
    if (!p.cartoonInfo) p.cartoonInfo = {} as any;
    if (p.cartoonInfo) {
      if (!p.cartoonInfo.visualPrompt || p.cartoonInfo.visualPrompt.length < 30) {
        p.cartoonInfo.visualPrompt = buildTarotImagePrompt(localTarot);
      }
      if (!p.cartoonInfo.archetypeTraits || p.cartoonInfo.archetypeTraits.length === 0) {
        p.cartoonInfo.archetypeTraits = localTarot.keywords;
      }
      p.cartoonInfo.tarotNumeral = localTarot.numeral;
      p.cartoonInfo.tarotColorPalette = localTarot.colorPalette;
    }
  });

  console.log("FATE-SYNC [COMPATIBILITY]: ✅ 궁합 분석 완료.");
  return compatResult;
}

// ─── [Step 4] 운명 챗봇 (→ /api/chat) ──────────────────
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function chatWithFateMaster(
  message: string,
  history: ChatMessage[],
  fateResult: FateAnalysisResult
): Promise<string> {
  const characterInfo = fateResult.hybrid.cartoonInfo;
  const characterContext = characterInfo
    ? `당신의 페르소나는 '${characterInfo.characterName}' (${characterInfo.originWork}) 입니다. 이 운명 캐릭터의 말투와 성격을 완벽하게 빙의하여 대답하세요. 아키타입은 [${characterInfo.archetypeTraits?.join(', ')}] 입니다. 사용자의 사주 데이터에 기반하여 답변하되, 캐릭터의 매력적인 말투구를 유지하세요.`
    : '당신은 30년 경력의 명리학 대가이자 친절한 마스터입니다. 다정하고 지혜롭게 답변하세요.';

  const fateContext = `[시스템 설정]
${characterContext}

[사용자의 운명 데이터 요약]
- 사주 핵심: ${fateResult.saju.summary} (용신: ${fateResult.saju.yongSin || '없음'})
- 관상 특징: ${fateResult.physiognomy.traits.join(', ')} (점수: ${fateResult.physiognomy.score})
- 손금 요약: 생명선(${fateResult.palmistry.scores.life}), 두뇌선(${fateResult.palmistry.scores.head}), 감정선(${fateResult.palmistry.scores.heart}), 운명선(${fateResult.palmistry.scores.fate})
- 통합 조언: ${fateResult.hybrid.finalAdvice}

[지시사항]
1. 답변은 반드시 한국어로, 짧고 명확하게(최대 3~4문장) 작성하세요.
2. 사용자의 고민이나 질문에 대해 위의 데이터를 근거로 공감하며 조언하세요.
3. 캐릭터의 말투를 자연스럽게 유지하세요.`;

  const apiRes = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, fateContext }),
  });

  if (!apiRes.ok) {
    const e = await apiRes.json().catch(() => ({}));
    throw new Error(e.error || '챗 API 오류');
  }

  const { response: chatResponse } = await apiRes.json();
  return chatResponse;
}
