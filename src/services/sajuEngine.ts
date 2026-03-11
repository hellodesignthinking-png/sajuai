/**
 * ============================================================
 *  Fate-Sync: 로컬 사주 계산 엔진 (Token 0 소모)
 *  
 *  ⚠️ 수정사항: 
 *  - 일주(日柱) 기준일 보정 (1900-01-31 = 甲子일)
 *  - 월주(月柱) 계산 정밀화 (절기 기준 월지)
 *  - 시주(時柱) 계산 보정
 * ============================================================
 */

import { SajuData, MBTIType } from "../types";

// ─── 천간(天干) & 지지(地支) ─────────────────────
const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// ─── 오행 매핑 ────────────────────────────────────
const CHEONGAN_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};
const JIJI_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// ─── 음양 매핑 ────────────────────────────────────
const CHEONGAN_YINYANG: Record<string, string> = {
  '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양', '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음'
};

// ─── 시간대별 지지 (시주) ──────────────────────────
function getHourJiji(hour: number): string {
  // 자시(子時): 23:00~01:00, 축시(丑時): 01:00~03:00, ...
  if (hour >= 23 || hour < 1) return '子';
  if (hour >= 1 && hour < 3) return '丑';
  if (hour >= 3 && hour < 5) return '寅';
  if (hour >= 5 && hour < 7) return '卯';
  if (hour >= 7 && hour < 9) return '辰';
  if (hour >= 9 && hour < 11) return '巳';
  if (hour >= 11 && hour < 13) return '午';
  if (hour >= 13 && hour < 15) return '未';
  if (hour >= 15 && hour < 17) return '申';
  if (hour >= 17 && hour < 19) return '酉';
  if (hour >= 19 && hour < 21) return '戌';
  return '亥'; // 21:00~23:00
}

// ─── 월지 매핑 (양력의 월 → 절기 기준 월지) ────────
// 절기 기준: 인월(寅)=2월(입춘 후), 묘월(卯)=3월, ...
// 간략화: 양력 기준 대략적 매핑 (정밀 절기 계산은 만세력 DB 필요)
function getMonthJiji(month: number, day: number): string {
  // 절기 기준 대략 날짜 (입춘~경칩~청명...)
  // 1월: 소한~입춘 전 = 丑월 (대부분), 입춘 후 = 寅월
  // 간략화: 양력 월의 4~6일 이후를 다음 월지로 봄
  const monthJijiMap: [number, number, string][] = [
    // [월, 절기경계일(대략), 월지]
    [1, 5, '丑'],   // 소한~입춘(2/4 경) → 대부분 축월, 2/4 이후 인월
    [2, 4, '寅'],   // 입춘(2/4경) → 인월
    [3, 6, '卯'],   // 경칩(3/6경) → 묘월
    [4, 5, '辰'],   // 청명(4/5경) → 진월
    [5, 6, '巳'],   // 입하(5/6경) → 사월
    [6, 6, '午'],   // 망종(6/6경) → 오월
    [7, 7, '未'],   // 소서(7/7경) → 미월
    [8, 7, '申'],   // 입추(8/7경) → 신월
    [9, 8, '酉'],   // 백로(9/8경) → 유월
    [10, 8, '戌'],  // 한로(10/8경) → 술월
    [11, 7, '亥'],  // 입동(11/7경) → 해월
    [12, 7, '子'],  // 대설(12/7경) → 자월
  ];

  // 간소화된 절기 판단: 해당 월의 절기 경계일 이전이면 이전 월지
  const current = monthJijiMap.find(m => m[0] === month);
  if (!current) return '寅';

  if (day < current[1]) {
    // 절기 전이면 이전 월의 지지
    const prevMonth = month === 1 ? 12 : month - 1;
    const prev = monthJijiMap.find(m => m[0] === prevMonth);
    return prev ? prev[2] : current[2];
  }

  return current[2];
}

// ─── 월간(月干) 계산: 연간에 따른 월간 결정 ────────
// 갑기년 → 병인월 시작, 을경년 → 무인월 시작, ...
function getMonthGan(yearGanIdx: number, monthJiji: string): string {
  const monthJijiIdx = JIJI.indexOf(monthJiji as any);
  // 인월(寅=2)을 기준 0으로 변환
  const monthOffset = (monthJijiIdx - 2 + 12) % 12;

  // 연간에 따른 인월 천간 시작 인덱스
  // 갑/기년 → 丙(2), 을/경년 → 戊(4), 병/신년 → 庚(6), 정/임년 → 壬(8), 무/계년 → 甲(0)
  const startGanMap: Record<number, number> = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
  const startGan = startGanMap[yearGanIdx] ?? 0;

  return CHEONGAN[(startGan + monthOffset) % 10];
}

// ─── 진태양시 보정 (True Solar Time) ──────────────────
function adjustTrueSolarTime(timeStr: string, region: string = 'seoul'): number {
  if (!timeStr) return 12;
  const parts = timeStr.split(':');
  let h = parseInt(parts[0]);
  let m = parseInt(parts[1] || '0');

  // 표준시 기준선(135도)과 지역 경도 차이에 따른 보정 (약 -30분 정도가 기본)
  // 서울(127.0): -32분, 부산(129.0): -24분, 광주(126.9): -32분, 대전(127.4): -30분 등
  const offsets: Record<string, number> = {
    'seoul': -32,
    'busan': -24,
    'daegu': -26,
    'incheon': -33,
    'gwangju': -32,
    'daejeon': -30,
    'ulsan': -23,
    'jeju': -34
  };

  const offsetMinutes = offsets[region] ?? -32; // 기본적으로 서울 기준 보정
  m += offsetMinutes;

  if (m < 0) {
    m += 60;
    h -= 1;
    if (h < 0) h = 23;
  }
  return h;
}

// ─── 사주 기둥 계산 ─────────────────────────────────
function calculatePillars(birthDate: string, birthTime: string, birthRegion?: string) {
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  const hour = adjustTrueSolarTime(birthTime, birthRegion);

  // ━━━ 연주 (Year Pillar) ━━━
  // 60갑자 기반, 입춘 전이면 전년도 사용
  let sajuYear = year;
  // 간략화: 1월(입춘 전)이면 전년도 사용
  if (month === 1 || (month === 2 && day < 4)) {
    sajuYear = year - 1;
  }
  const yearGanIdx = ((sajuYear - 4) % 10 + 10) % 10;
  const yearJiIdx = ((sajuYear - 4) % 12 + 12) % 12;
  const yearGan = CHEONGAN[yearGanIdx];
  const yearJi = JIJI[yearJiIdx];

  // ━━━ 월주 (Month Pillar) ━━━
  const monthJi = getMonthJiji(month, day);
  const monthGan = getMonthGan(yearGanIdx, monthJi);

  // ━━━ 일주 (Day Pillar) ━━━
  // 기준: 1900년 1월 31일 = 甲子일 (검증된 기준점)
  // 율리우스 적일(JDN)을 이용한 정확한 계산
  const targetJDN = gregorianToJDN(year, month, day);
  const baseJDN = gregorianToJDN(1900, 1, 31); // 甲子일 기준
  const dayDiff = targetJDN - baseJDN;
  const dayGanIdx = ((dayDiff % 10) + 10) % 10;
  const dayJiIdx = ((dayDiff % 12) + 12) % 12;
  const dayGan = CHEONGAN[dayGanIdx];
  const dayJi = JIJI[dayJiIdx];

  // ━━━ 시주 (Hour Pillar) ━━━
  const hourJi = getHourJiji(hour);
  const hourJiIdx = JIJI.indexOf(hourJi as any);
  // 일간에 따른 시간 천간
  const hourGanBase = (dayGanIdx % 5) * 2;
  const hourGanIdx = (hourGanBase + hourJiIdx) % 10;
  const hourGan = CHEONGAN[hourGanIdx];

  return {
    year: `${yearGan}${yearJi}`,
    month: `${monthGan}${monthJi}`,
    day: `${dayGan}${dayJi}`,
    hour: `${hourGan}${hourJi}`,
    dayMaster: dayGan,
    dayMasterElement: CHEONGAN_ELEMENT[dayGan],
    dayMasterYinYang: CHEONGAN_YINYANG[dayGan]
  };
}

// ─── 율리우스 적일 계산 (정확한 날짜 차이용) ─────────
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// ─── 오행 분포 계산 ───────────────────────────────
function calculateElements(pillars: ReturnType<typeof calculatePillars>) {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const elementMap: Record<string, keyof typeof counts> = {
    '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water'
  };

  // 8글자 모두 분석 (천간4 + 지지4)
  const allChars = [
    pillars.year, pillars.month, pillars.day, pillars.hour
  ].join('').split('');

  for (const char of allChars) {
    const el = CHEONGAN_ELEMENT[char] || JIJI_ELEMENT[char];
    if (el && elementMap[el]) {
      counts[elementMap[el]]++;
    }
  }

  return counts;
}

// ─── 일간 강약 분석 (정밀화) ──────────────────────
function analyzeDayMasterStrength(
  dayMasterElement: string,
  elements: ReturnType<typeof calculateElements>,
  pillars: ReturnType<typeof calculatePillars>
): { strength: string; ratio: number; detail: string } {
  const elementMap: Record<string, keyof typeof elements> = {
    '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water'
  };
  const generating: Record<string, string> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };

  const dmKey = elementMap[dayMasterElement];
  const genKey = elementMap[generating[dayMasterElement]];
  const total = Object.values(elements).reduce((a, b) => a + b, 0);

  // 비겁(같은 오행) + 인성(생해주는 오행) = 방조 세력
  const helpCount = elements[dmKey] + elements[genKey];
  const helpRatio = helpCount / total;

  // 월지의 오행이 일간을 돕는지 확인 (득령 여부)
  const monthJi = pillars.month.charAt(1);
  const monthElement = JIJI_ELEMENT[monthJi];
  const isDeukryeong = monthElement === dayMasterElement || monthElement === generating[dayMasterElement];

  if (helpRatio > 0.45 || (helpRatio > 0.35 && isDeukryeong)) {
    return { strength: 'strong', ratio: helpRatio, detail: `방조 ${helpCount}/${total}, ${isDeukryeong ? '득령' : '실령'}` };
  } else if (helpRatio < 0.25 || (helpRatio < 0.35 && !isDeukryeong)) {
    return { strength: 'weak', ratio: helpRatio, detail: `방조 ${helpCount}/${total}, ${isDeukryeong ? '득령' : '실령'}` };
  }
  return { strength: 'neutral', ratio: helpRatio, detail: `방조 ${helpCount}/${total}, ${isDeukryeong ? '득령' : '실령'}` };
}

// ─── 용신 후보 추정 (정밀화) ──────────────────────
function estimateYongSin(dayMasterElement: string, elements: ReturnType<typeof calculateElements>, pillars: ReturnType<typeof calculatePillars>) {
  const strengthInfo = analyzeDayMasterStrength(dayMasterElement, elements, pillars);

  const generating: Record<string, string> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
  const controlling: Record<string, string> = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
  const generated: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };

  if (strengthInfo.strength === 'strong') {
    // 신강: 식상(설기) 또는 재성(극설) 또는 관성(극신)이 용신
    return {
      yongSin: generated[dayMasterElement],
      principle: `억부법(抑扶法) - 신강(身強): ${strengthInfo.detail}`,
      strength: 'strong',
      ratio: strengthInfo.ratio
    };
  } else {
    // 신약: 인성(생신) 또는 비겁(방신)이 용신
    return {
      yongSin: generating[dayMasterElement],
      principle: `억부법(抑扶法) - 신약(身弱): ${strengthInfo.detail}`,
      strength: 'weak',
      ratio: strengthInfo.ratio
    };
  }
}

// ─── 격국 후보 추정 ──────────────────────────────
function estimateGyeokGuk(pillars: ReturnType<typeof calculatePillars>) {
  const monthJi = pillars.month.charAt(1);
  const monthElement = JIJI_ELEMENT[monthJi];
  const dayMasterElement = pillars.dayMasterElement;
  const dayMasterYinYang = pillars.dayMasterYinYang;

  // 십신 관계로 격국 판정
  const relations: Record<string, Record<string, string>> = {
    '木': { '木': '건록격/양인격', '火': '식신격/상관격', '土': '편재격/정재격', '金': '편관격/정관격', '水': '편인격/정인격' },
    '火': { '火': '건록격/양인격', '土': '식신격/상관격', '金': '편재격/정재격', '水': '편관격/정관격', '木': '편인격/정인격' },
    '土': { '土': '건록격/양인격', '金': '식신격/상관격', '水': '편재격/정재격', '木': '편관격/정관격', '火': '편인격/정인격' },
    '金': { '金': '건록격/양인격', '水': '식신격/상관격', '木': '편재격/정재격', '火': '편관격/정관격', '土': '편인격/정인격' },
    '水': { '水': '건록격/양인격', '木': '식신격/상관격', '火': '편재격/정재격', '土': '편관격/정관격', '金': '편인격/정인격' }
  };

  const gyeokPair = relations[dayMasterElement]?.[monthElement] || '잡기격';
  // 음양에 따라 정격/편격 구분
  const parts = gyeokPair.split('/');
  if (parts.length === 2) {
    return dayMasterYinYang === '양' ? parts[0] : parts[1];
  }
  return gyeokPair;
}

// ─── 합/충/형/파 감지 ────────────────────────────
function detectInteractions(pillars: ReturnType<typeof calculatePillars>) {
  const branches = [
    pillars.year.charAt(1),
    pillars.month.charAt(1),
    pillars.day.charAt(1),
    pillars.hour.charAt(1)
  ];
  const branchNames = ['년지', '월지', '일지', '시지'];

  const interactions: string[] = [];

  // 육합 (Six Harmonies)
  const sixHarmonies: [string, string, string][] = [
    ['子', '丑', '土'], ['寅', '亥', '木'], ['卯', '戌', '火'],
    ['辰', '酉', '金'], ['巳', '申', '水'], ['午', '未', '火']
  ];

  // 육충 (Six Clashes)
  const sixClashes: [string, string][] = [
    ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
  ];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      for (const [a, b, el] of sixHarmonies) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          interactions.push(`${branchNames[i]}-${branchNames[j]} ${branches[i]}${branches[j]}합(${el})`);
        }
      }
      for (const [a, b] of sixClashes) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          interactions.push(`${branchNames[i]}-${branchNames[j]} ${branches[i]}${branches[j]}충`);
        }
      }
    }
  }

  return interactions;
}

// ─── 오행 압축 문자열 생성 ──────────────────────
function compressElements(elements: ReturnType<typeof calculateElements>): string {
  return `목(木)${elements.wood} 화(火)${elements.fire} 토(土)${elements.earth} 금(金)${elements.metal} 수(水)${elements.water}`;
}

// ─── 메인 전처리 함수 ─────────────────────────────
export interface PreprocessedData {
  saju: {
    pillars: string;
    dayMaster: string;
    dayMasterElement: string;
    dayMasterYinYang: string;
    elements: string;
    elementCounts: { wood: number; fire: number; earth: number; metal: number; water: number };
    yongSinCandidate: string;
    yongSinPrinciple: string;
    dmStrength: string;
    gyeokGuk: string;
    interactions: string[];
    pillarDetails: { year: string; month: string; day: string; hour: string };
    birthRegion?: string;
  };
  mbti: string;
  hasface: boolean;
  hasPalm: boolean;
  worry?: string;
}

export function preprocessLocally(data: { saju?: { birthDate: string; birthTime: string; isLunar: boolean; gender: string; birthRegion?: string }; mbti?: string; faceImage?: string; palmImage?: string; worry?: string }): PreprocessedData {
  const saju = data.saju || { birthDate: '2000-01-01', birthTime: '12:00', isLunar: false, gender: 'MALE', birthRegion: 'seoul' };

  const pillars = calculatePillars(saju.birthDate, saju.birthTime, saju.birthRegion);
  const elements = calculateElements(pillars);
  const yongSinInfo = estimateYongSin(pillars.dayMasterElement, elements, pillars);
  const gyeokGuk = estimateGyeokGuk(pillars);
  const interactions = detectInteractions(pillars);

  console.log(`SAJU-ENGINE: 사주 계산 결과 → 연주:${pillars.year} 월주:${pillars.month} 일주:${pillars.day} 시주:${pillars.hour}`);
  console.log(`SAJU-ENGINE: 일간=${pillars.dayMaster}(${pillars.dayMasterElement}/${pillars.dayMasterYinYang}), 격국=${gyeokGuk}, 용신=${yongSinInfo.yongSin}`);

  return {
    saju: {
      pillars: `${pillars.year}/${pillars.month}/${pillars.day}/${pillars.hour}`,
      dayMaster: pillars.dayMaster,
      dayMasterElement: pillars.dayMasterElement,
      dayMasterYinYang: pillars.dayMasterYinYang,
      elements: compressElements(elements),
      elementCounts: elements,
      yongSinCandidate: yongSinInfo.yongSin,
      yongSinPrinciple: yongSinInfo.principle,
      dmStrength: yongSinInfo.strength,
      gyeokGuk,
      interactions,
      pillarDetails: {
        year: pillars.year,
        month: pillars.month,
        day: pillars.day,
        hour: pillars.hour,
      },
      birthRegion: saju.birthRegion
    },
    mbti: data.mbti || 'N/A',
    hasface: !!data.faceImage,
    hasPalm: !!data.palmImage,
    worry: data.worry
  };
}
