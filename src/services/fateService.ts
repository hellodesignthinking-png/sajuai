/// <reference types="vite/client" />
/**
 * ============================================================
 *  Fate-Sync: 토큰 절약형 하이브리드 아키텍처
 *  
 *  [Step 1] 로컬 전처리 (Token 0) - sajuEngine.ts
 *  [Step 2] 압축 프롬프트 → Gemini 2.5 Flash (최소 토큰)
 *  [Step 3] 로컬 UI 템플릿 확장 (Token 0)
 *  
 *  기존 대비 토큰 약 80~90% 절감
 * ============================================================
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserFateData, FateAnalysisResult } from "../types";
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
function buildCompactPrompt(preprocessed: PreprocessedData & { tarot: TarotCard }, currentTime: string, userName?: string): string {
  return `당신은 30년 경력의 명리학 대가이자 동서양 운명학 석학이며, 만화/애니메이션 캐릭터 분석의 권위자입니다. 아래 로컬 전처리된 사주 데이터를 해석하세요.

[사용자 정보]
- 이름: ${userName || '미제공'}

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
- 현재 시점: ${currentTime}

[절대 규칙 - MBTI 정합성]
⚠️ 사용자가 입력한 MBTI(${preprocessed.mbti})는 절대적인 기준입니다. 이를 사주 데이터와 융합하여 해석하되, MBTI 유형 자체를 절대 변경하지 마세요. mbtiMatch 필드에 반드시 "${preprocessed.mbti}"를 포함하세요.

[절대 규칙 - 교차 검증 및 통합 서사]
⚠️ finalAdvice(최종 조언)에서는 반드시 4가지 데이터(사주, 관상, 손금, MBTI)가 만나는 **교차점**을 명시하세요. 예: "사주의 강한 화(火) 기운이 MBTI의 E 성향과 만나 당신을 혁신가로 만듭니다."  각 데이터가 따로 놀지 않고, 하나의 통합 서사로 엮여야 합니다.

[지시사항]
1. 위 데이터를 기반으로 대가 수준의 사주 해석을 하세요. 용신과 격국에 대해 적천수/자평진전을 인용한 학술적 원리, 원국의 구체적 근거, 상세 해석을 제공하세요.
2. 오행 강약, 상생상극 흐름, 기운의 흐름을 분석하세요.
3. MBTI(${preprocessed.mbti})와 사주의 시너지를 심층 분석하세요 (심리적 가교, 인지적 처리, 정서적 반응, 행동 패턴). 반드시 ${preprocessed.mbti} 유형의 고유한 인지 기능(예: Ni-Te, Fi-Ne 등)을 구체적으로 언급하세요.
4. ${currentTime} 기준 일간/주간/월간/연간/애정/사업 운세를 구체적으로 제공하세요. 각 운세는 최소 200자 이상으로 풍부하게 작성하세요.
5. 사용자의 운명 타로카드는 **"${preprocessed.tarot.numeral} - ${preprocessed.tarot.nameKR} (${preprocessed.tarot.nameEN})"**입니다. 이 타로카드와 사주/MBTI를 종합하여 사용자와 가장 운명적으로 닮은 **실제 만화/애니메이션/영화 캐릭터** 1명을 매칭하세요 (예: 아이언맨, 나루토, 레비 아커만 등). characterName에 "캐릭터명 (작품명)" 형식으로, originWork에 "타로 ${preprocessed.tarot.numeral} · 작품명"으로 넣으세요. characterDetail에 이 캐릭터가 왜 사용자의 사주/MBTI/타로와 운명적으로 일치하는지 500자 이상 상세히 서술하세요. visualPrompt에는 이 캐릭터의 상반신을 클래식 Rider-Waite 타로카드 그림체로 묘사하는 영어 프롬프트를 작성하세요 (예: "Upper body portrait of Tony Stark in classic Rider-Waite tarot card art style, wearing his iconic suit, confident pose, golden ornate tarot border, mystical symbols, renaissance painting technique"). archetypeTraits에 핵심 키워드 3-5개를 넣으세요.
6. 관상이 제공된 경우 이마/눈/코/입/턱 각 부위별 점수(0-100)와 특성을 분석하세요. 미제공이면 사주 기반 추론으로 생성하세요.
7. 손금이 제공된 경우 생명선/두뇌선/감정선/운명선을 분석하세요. 미제공이면 사주 기반 추론으로 생성하세요.
8. 마스터의 비기(30년 경력자만 알 수 있는 깊은 통찰)를 제공하세요.
9. 모든 해석은 한국어로 작성하세요. 각 항목은 풍부하고 깊이 있게 작성하세요.

반드시 아래 JSON 구조로만 응답하세요:
{
  "saju": {
    "element": "강한 오행 요약",
    "summary": "전체 사주 요약 (200자 이상)",
    "yongSin": "용신",
    "yongSinPrinciple": "용신 학술적 원리 (적천수/자평진전 인용)",
    "yongSinEvidence": "원국에서의 구체적 근거",
    "yongSinInterpretation": "용신 상세 해석과 활용법",
    "gyeokGuk": "격국명",
    "gyeokGukPrinciple": "격국 학술적 원리",
    "gyeokGukEvidence": "원국에서의 구체적 근거",
    "gyeokGukInterpretation": "격국 상세 해석",
    "elementalInteraction": "상생상극 관계 분석",
    "elementalStrength": "오행 강약 분석",
    "elementalFlow": "기운의 흐름 분석",
    "detailedElementAnalysis": {
      "wood": "목 해석", "fire": "화 해석", "earth": "토 해석", "metal": "금 해석", "water": "수 해석"
    },
    "masterInsight": "마스터의 비기",
    "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
    "fiveElements": { "wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0 },
    "pillars": { "year": "", "month": "", "day": "", "hour": "" }
  },
  "physiognomy": {
    "score": 75,
    "traits": ["특성1", "특성2", "특성3"],
    "description": "관상 종합 해석",
    "scores": { "forehead": 0, "eyes": 0, "nose": 0, "mouth": 0, "chin": 0 }
  },
  "palmistry": {
    "lifeLine": "생명선 분석",
    "wealthLine": "재물선 분석",
    "description": "손금 종합 해석",
    "lines": { "life": 0, "wisdom": 0, "heart": 0, "fate": 0 }
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
    }
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
    const allMbtiTypes = ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'];
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

// ─── 메인 분석 함수 ──────────────────────────────
export async function analyzeFate(data: UserFateData): Promise<FateAnalysisResult> {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
  
  console.log("FATE-SYNC: Initializing with API Key prefix:", apiKey.substring(0, 8) + "...");

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    throw new Error("API 키가 설정되지 않았습니다. .env 파일에서 'VITE_GEMINI_API_KEY' 항목을 실제 API 키로 수정해 주세요.");
  }

  // ━━━ [Step 1] 로컬 전처리 (Token 0) ━━━
  console.log("FATE-SYNC [Step 1]: 로컬 사주 엔진 계산 중...");
  const preprocessed = buildCompactPayload(data);
  console.log("FATE-SYNC [Step 1]: 전처리 완료:", JSON.stringify(preprocessed.saju, null, 2));

  // ━━━ [Step 2] 압축 프롬프트 → Gemini 2.5 Flash ━━━
  console.log("FATE-SYNC [Step 2]: Gemini 2.5 Flash에 압축 데이터 전송...");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const now = new Date();
  const currentTime = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long', hour: 'numeric', minute: 'numeric'
  }).format(now);

  const compactPrompt = buildCompactPrompt(preprocessed, currentTime, data.userName);

  // 이미지가 있으면 첨부 (관상/손금 분석용, 단 1회만)
  const parts: any[] = [{ text: compactPrompt }];

  if (data.faceImage) {
    const matches = data.faceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
    }
  }
  if (data.palmImage) {
    const matches = data.palmImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const geminiResult = await model.generateContent({
      contents: [{ role: "user", parts }]
    });

    const response = geminiResult.response;
    let rawText = response.text();

    // JSON 정리
    if (rawText.includes("```json")) {
      rawText = rawText.split("```json")[1].split("```")[0];
    } else if (rawText.includes("```")) {
      rawText = rawText.split("```")[1].split("```")[0];
    }
    rawText = rawText.trim();

    console.log("FATE-SYNC [Step 2]: Gemini 응답 수신 완료 (길이:", rawText.length, "자)");

    let result: FateAnalysisResult;
    try {
      result = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("FATE-SYNC: JSON 파싱 실패, 복구 시도...", parseErr);
      result = repairAndParseJSON(rawText);
    }

    // ━━━ [Step 3] 로컬 템플릿 확장 (Token 0) ━━━
    console.log("FATE-SYNC [Step 3]: 로컬 데이터로 보강 중...");
    result = enrichWithLocalTemplates(result, preprocessed, currentTime);

    console.log("FATE-SYNC: ✅ 분석 완료! 총 3단계 하이브리드 파이프라인 성공.");
    return result;

  } catch (err: any) {
    console.error("FATE-SYNC: ❌ analyzeFate Error:", err);
    throw err;
  }
}
