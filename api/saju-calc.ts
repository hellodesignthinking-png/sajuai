// api/saju-calc.ts — 만세력 계산 엔진 (사주 코드 직접 계산)

export const HEAVENLY_STEMS = [
  '갑(甲)', '을(乙)', '병(丙)', '정(丁)', '무(戊)',
  '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)',
];
export const EARTHLY_BRANCHES = [
  '자(子)', '축(丑)', '인(寅)', '묘(卯)', '진(辰)', '사(巳)',
  '오(午)', '미(未)', '신(申)', '유(酉)', '술(戌)', '해(亥)',
];
// 천간별 오행 (甲乙=목 丙丁=화 戊己=토 庚辛=금 壬癸=수)
const STEM_ELEMENTS = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
// 지지별 오행 (子丑寅卯辰巳午未申酉戌亥)
const BRANCH_ELEMENTS = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];
const STEM_YIN_YANG = ['양', '음', '양', '음', '양', '음', '양', '음', '양', '음'];

const ELEMENTS = ['목', '화', '토', '금', '수'] as const;
type Elem = typeof ELEMENTS[number];

export interface Pillar {
  heavenly: string;  // e.g. "갑(甲)"
  earthly: string;   // e.g. "자(子)"
  stemIdx: number;
  branchIdx: number;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
}

export interface MajorLuck {
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  heavenly: string;
  earthly: string;
  stemIdx: number;
  branchIdx: number;
  stemElement: string;
  branchElement: string;
}

export interface SajuCalcResult {
  fourPillars: FourPillars;
  dayMaster: {
    heavenly: string;  // e.g. "병(丙)"
    element: string;   // e.g. "화"
    yinYang: string;   // "양"|"음"
    stemIdx: number;
  };
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number };
  favorableElement: string;
  unfavorableElement: string;
  majorLucks: MajorLuck[];
  currentLuck: MajorLuck | null;
  careerSeason: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonRelationship: string;
  seasonCycle: { season: string; start_year: number; end_year: number; label: string; is_current: boolean }[];
  goldenYears: { year: number; score: number }[];
  // 음력→양력 변환 여부 기록
  solarBirthDate: { year: number; month: number; day: number };
}

// ── 60간지 인덱스 ──────────────────────────────────────────

function find60CycleIdx(stemIdx: number, branchIdx: number): number {
  for (let n = 0; n < 60; n++) {
    if (n % 10 === stemIdx && n % 12 === branchIdx) return n;
  }
  return 0;
}

// ── 년주 (입춘 기준) ──────────────────────────────────────

function calcYearPillar(year: number, month: number, day: number): Pillar {
  // 사주 년도는 입춘(약 2월 4일) 이후부터 해당 연도
  let sajuYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    sajuYear = year - 1;
  }
  const s = ((sajuYear - 4) % 10 + 10) % 10;
  const b = ((sajuYear - 4) % 12 + 12) % 12;
  return { heavenly: HEAVENLY_STEMS[s], earthly: EARTHLY_BRANCHES[b], stemIdx: s, branchIdx: b };
}

// ── 월주 (절기 기준) ──────────────────────────────────────

function getSajuMonthIndex(month: number, day: number): number {
  // 각 절기 시작: 인(Feb4) 묘(Mar6) 진(Apr5) 사(May6) 오(Jun6) 미(Jul7)
  //              신(Aug7) 유(Sep8) 술(Oct8) 해(Nov7) 자(Dec7) 축(Jan6)
  const ranges: [number, number, number][] = [
    [1, 6, 11], [2, 4, 0], [3, 6, 1], [4, 5, 2], [5, 6, 3],
    [6, 6, 4], [7, 7, 5], [8, 7, 6], [9, 8, 7], [10, 8, 8],
    [11, 7, 9], [12, 7, 10],
  ];
  let result = 10; // default: 자월 (Dec 7 ~ Jan 5)
  for (const [sm, sd, idx] of ranges) {
    if (month > sm || (month === sm && day >= sd)) result = idx;
  }
  return result;
}

function calcMonthPillar(yearStemIdx: number, month: number, day: number): Pillar {
  const sajuMonthIdx = getSajuMonthIndex(month, day); // 0=인, 1=묘, ..., 11=축
  // 갑己年=丙寅, 乙庚年=戊寅, 丙辛年=庚寅, 丁壬年=壬寅, 戊癸年=甲寅
  const stemBases = [2, 4, 6, 8, 0];
  const s = (stemBases[yearStemIdx % 5] + sajuMonthIdx) % 10;
  const b = (2 + sajuMonthIdx) % 12; // 인=2, 묘=3, ...
  return { heavenly: HEAVENLY_STEMS[s], earthly: EARTHLY_BRANCHES[b], stemIdx: s, branchIdx: b };
}

// ── 일주 (1900-01-01 = 甲子 기준) ─────────────────────────

function calcDayPillar(year: number, month: number, day: number): Pillar {
  const ref = Date.UTC(1900, 0, 1);
  const target = Date.UTC(year, month - 1, day);
  const days = Math.round((target - ref) / 86400000);
  const s = ((days % 10) + 10) % 10;
  const b = ((days % 12) + 12) % 12;
  return { heavenly: HEAVENLY_STEMS[s], earthly: EARTHLY_BRANCHES[b], stemIdx: s, branchIdx: b };
}

// ── 시주 (일간 기준) ──────────────────────────────────────

function calcHourPillar(dayStemIdx: number, hour: number): Pillar {
  // 자(23,0)=0 축(1,2)=1 인(3,4)=2 묘(5,6)=3 진(7,8)=4 사(9,10)=5
  // 오(11,12)=6 미(13,14)=7 신(15,16)=8 유(17,18)=9 술(19,20)=10 해(21,22)=11
  const b = Math.floor((hour + 1) / 2) % 12;
  // 甲己=甲(0) 乙庚=丙(2) 丙辛=戊(4) 丁壬=庚(6) 戊癸=壬(8)
  const stemBases = [0, 2, 4, 6, 8];
  const s = (stemBases[dayStemIdx % 5] + b) % 10;
  return { heavenly: HEAVENLY_STEMS[s], earthly: EARTHLY_BRANCHES[b], stemIdx: s, branchIdx: b };
}

// ── 오행 분포 ─────────────────────────────────────────────

function countElements(pillars: (Pillar | null)[]) {
  const c: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  for (const p of pillars) {
    if (!p) continue;
    c[STEM_ELEMENTS[p.stemIdx]]++;
    c[BRANCH_ELEMENTS[p.branchIdx]]++;
  }
  return { wood: c['목'], fire: c['화'], earth: c['토'], metal: c['금'], water: c['수'] };
}

// ── 용신/기신 판단 ────────────────────────────────────────

function determineFavorableElement(
  dayMasterStemIdx: number,
  fe: { wood: number; fire: number; earth: number; metal: number; water: number }
): { favorable: string; unfavorable: string } {
  const dayEl = STEM_ELEMENTS[dayMasterStemIdx];
  const dayIdx = ELEMENTS.indexOf(dayEl as Elem);
  const counts: Record<string, number> = {
    '목': fe.wood, '화': fe.fire, '토': fe.earth, '금': fe.metal, '수': fe.water,
  };
  // 오행 관계
  const generatesMe = ELEMENTS[(dayIdx + 4) % 5]; // 인성 (나를 생해주는 오행)
  const iGenerate   = ELEMENTS[(dayIdx + 1) % 5]; // 식상 (내가 생하는 오행)
  const controlsMe  = ELEMENTS[(dayIdx + 3) % 5]; // 관성 (나를 극하는 오행)
  const iControl    = ELEMENTS[(dayIdx + 2) % 5]; // 재성 (내가 극하는 오행)

  const dayCount = counts[dayEl];
  let favorable: string;
  let unfavorable: string;

  if (dayCount >= 3) {
    // 신강(身强): 일간이 강함 → 설기(泄氣) 또는 극(剋) 필요
    favorable = counts[iControl] <= counts[controlsMe] ? iControl : controlsMe;
    unfavorable = generatesMe; // 인성이 오면 더 강해짐
  } else if (dayCount <= 1) {
    // 신약(身弱): 일간이 약함 → 생(生) 또는 비겁(比劫) 필요
    favorable = generatesMe;
    unfavorable = controlsMe; // 관성이 오면 더 약해짐
  } else {
    // 중화(中和): 가장 부족한 오행이 필요
    const helpful = [generatesMe, dayEl];
    const harmful = [controlsMe, iGenerate];
    favorable = helpful.reduce((a, b) => counts[a] <= counts[b] ? a : b);
    unfavorable = harmful.reduce((a, b) => counts[a] >= counts[b] ? a : b);
  }

  return { favorable, unfavorable };
}

// ── 대운 계산 ─────────────────────────────────────────────

const MAJOR_TERM_DATA: [number, number][] = [
  // [month, day] — 각 절기 시작일 (절: 節)
  [2, 4], [3, 6], [4, 5], [5, 6], [6, 6],
  [7, 7], [8, 7], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6],
];

function calcLuckStartAge(
  birthYear: number, birthMonth: number, birthDay: number, isForward: boolean
): number {
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const termDates: Date[] = [];

  for (let y = birthYear - 1; y <= birthYear + 1; y++) {
    for (const [m, d] of MAJOR_TERM_DATA) {
      termDates.push(new Date(y, m - 1, d));
    }
  }
  termDates.sort((a, b) => a.getTime() - b.getTime());

  let targetDate: Date | undefined;
  if (isForward) {
    targetDate = termDates.find(t => t > birthDate);
  } else {
    const prev = termDates.filter(t => t < birthDate);
    targetDate = prev[prev.length - 1];
  }
  if (!targetDate) return 3;

  const days = Math.abs(Math.round((targetDate.getTime() - birthDate.getTime()) / 86400000));
  return Math.max(1, Math.floor(days / 3));
}

function calcMajorLucks(
  yearPillar: Pillar, monthPillar: Pillar, gender: 'male' | 'female',
  birthYear: number, birthMonth: number, birthDay: number
): MajorLuck[] {
  // 양남음녀=순행, 음남양녀=역행
  const isYang = yearPillar.stemIdx % 2 === 0;
  const isForward = (isYang && gender === 'male') || (!isYang && gender === 'female');
  const startAge = calcLuckStartAge(birthYear, birthMonth, birthDay, isForward);
  const monthCycleIdx = find60CycleIdx(monthPillar.stemIdx, monthPillar.branchIdx);

  return Array.from({ length: 8 }, (_, i) => {
    const offset = isForward ? i + 1 : -(i + 1);
    const cycleIdx = ((monthCycleIdx + offset) % 60 + 60) % 60;
    const s = cycleIdx % 10;
    const b = cycleIdx % 12;
    const sa = startAge + i * 10;
    return {
      startAge: sa, endAge: sa + 9,
      startYear: birthYear + sa, endYear: birthYear + sa + 9,
      heavenly: HEAVENLY_STEMS[s], earthly: EARTHLY_BRANCHES[b],
      stemIdx: s, branchIdx: b,
      stemElement: STEM_ELEMENTS[s], branchElement: BRANCH_ELEMENTS[b],
    };
  });
}

// ── 커리어 계절 ───────────────────────────────────────────

function getRelationship(dayEl: string, luckEl: string): string {
  const di = ELEMENTS.indexOf(dayEl as Elem);
  const li = ELEMENTS.indexOf(luckEl as Elem);
  if (di === li)               return '비겁(比劫)';
  if ((di + 4) % 5 === li)     return '인성(印星)'; // luck generates day
  if ((di + 1) % 5 === li)     return '식상(食傷)'; // day generates luck
  if ((di + 2) % 5 === li)     return '재성(財星)'; // day controls luck
  if ((di + 3) % 5 === li)     return '관성(官星)'; // luck controls day
  return '비겁(比劫)';
}

function determineCareerSeason(rel: string): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (rel.includes('인성')) return 'spring';
  if (rel.includes('비겁')) return 'summer';
  if (rel.includes('식상')) return 'autumn';
  if (rel.includes('재성')) return 'autumn';
  if (rel.includes('관성')) return 'winter';
  return 'spring';
}

// ── 계절 사이클 ───────────────────────────────────────────

const SEASON_LABELS: Record<string, string> = {
  spring: '씨앗기', summer: '경쟁기', autumn: '수확기', winter: '숙고기',
};

function calcSeasonCycle(
  majorLucks: MajorLuck[], dayEl: string, currentYear: number
) {
  return majorLucks.slice(0, 5).map(luck => {
    const rel = getRelationship(dayEl, luck.stemElement);
    const season = determineCareerSeason(rel);
    return {
      season,
      start_year: luck.startYear,
      end_year: luck.endYear,
      label: SEASON_LABELS[season],
      is_current: currentYear >= luck.startYear && currentYear <= luck.endYear,
    };
  });
}

// ── 전성기 Top 5 ──────────────────────────────────────────

const TRIPLE_COMBOS: { branches: number[]; element: string }[] = [
  { branches: [8, 0, 4],  element: '수' }, // 申子辰 수국
  { branches: [2, 6, 10], element: '화' }, // 寅午戌 화국
  { branches: [5, 9, 1],  element: '금' }, // 巳酉丑 금국
  { branches: [11, 3, 7], element: '목' }, // 亥卯未 목국
];

function calcGoldenYears(
  birthYear: number,
  majorLucks: MajorLuck[],
  dayMasterStemIdx: number,
  fourPillars: FourPillars,
  favorableElement: string,
  unfavorableElement: string,
  currentYear: number
): { year: number; score: number }[] {
  const natalBranches = [
    fourPillars.year.branchIdx,
    fourPillars.month.branchIdx,
    fourPillars.day.branchIdx,
    ...(fourPillars.hour ? [fourPillars.hour.branchIdx] : []),
  ];

  const rangeStart = Math.max(birthYear + 20, currentYear - 3);
  const rangeEnd   = Math.min(birthYear + 65, currentYear + 40);
  const scores: { year: number; score: number }[] = [];

  for (let year = rangeStart; year <= rangeEnd; year++) {
    const age = year - birthYear;
    const luck = majorLucks.find(l => age >= l.startAge && age <= l.endAge);
    if (!luck) continue;

    const yp = calcYearPillar(year, 2, 5); // 입춘 이후 기준
    const yStemEl   = STEM_ELEMENTS[yp.stemIdx];
    const yBranchEl = BRANCH_ELEMENTS[yp.branchIdx];
    let score = 50;

    // 대운 오행 효과
    if (luck.stemElement   === favorableElement)   score += 25;
    if (luck.branchElement === favorableElement)   score += 10;
    if (luck.stemElement   === unfavorableElement) score -= 20;
    if (luck.branchElement === unfavorableElement) score -= 10;

    // 세운 오행 효과
    if (yStemEl   === favorableElement)   score += 20;
    if (yBranchEl === favorableElement)   score += 10;
    if (yStemEl   === unfavorableElement) score -= 10;
    if (yBranchEl === unfavorableElement) score -= 10;

    // 충(沖) 불리
    for (const nb of natalBranches) {
      if ((yp.branchIdx + 6) % 12 === nb)    score -= 15;
      if ((luck.branchIdx + 6) % 12 === nb)  score -= 8;
    }

    // 삼합으로 용신 강화
    for (const combo of TRIPLE_COMBOS) {
      if (combo.element === favorableElement && combo.branches.includes(yp.branchIdx)) {
        const natalMatches = combo.branches.filter(b => natalBranches.includes(b)).length;
        if (natalMatches >= 1) score += 15;
      }
    }

    scores.push({ year, score: Math.min(99, Math.max(30, Math.round(score))) });
  }

  return scores.sort((a, b) => b.score - a.score).slice(0, 5);
}

// ── 음력 → 양력 변환 (근사값, ±1~2일) ─────────────────────

const LUNAR_NEW_YEAR: Record<number, [number, number]> = {
  1920:[2,20],1921:[2,8],1922:[1,28],1923:[2,16],1924:[2,5],
  1925:[1,24],1926:[2,13],1927:[2,2],1928:[1,23],1929:[2,10],
  1930:[1,30],1931:[2,17],1932:[2,6],1933:[1,26],1934:[2,14],
  1935:[2,4],1936:[1,24],1937:[2,11],1938:[1,31],1939:[2,19],
  1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],
  1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],
  1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],
  1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],
  1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],
  1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],
  1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],
  1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],
  1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],
  1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],
  1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],
  1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],
  2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],
  2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],
  2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],
  2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],
  2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],
  2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],
  2030:[2,3],2031:[1,23],2032:[2,11],2033:[1,31],2034:[2,19],
  2035:[2,8],2036:[1,28],2037:[2,15],2038:[2,4],2039:[1,24],
  2040:[2,12],
};

export function lunarToSolar(
  lunarYear: number, lunarMonth: number, lunarDay: number
): { year: number; month: number; day: number } {
  const entry = LUNAR_NEW_YEAR[lunarYear];
  if (!entry) return { year: lunarYear, month: lunarMonth, day: lunarDay };
  const [nyMonth, nyDay] = entry;
  const nyDate = new Date(lunarYear, nyMonth - 1, nyDay);
  const offset = Math.round((lunarMonth - 1) * 29.5306) + (lunarDay - 1);
  const solar = new Date(nyDate.getTime() + offset * 86400000);
  return { year: solar.getFullYear(), month: solar.getMonth() + 1, day: solar.getDate() };
}

// ── 한자 추출 헬퍼 ────────────────────────────────────────

export function extractChar(s: string): string {
  const m = s.match(/\(([^)]+)\)/);
  return m ? m[1] : s;
}

// ── 메인 계산 함수 ─────────────────────────────────────────

export interface SajuInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number; // -1 if unknown
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  currentYear: number;
}

export function calcSaju(input: SajuInput): SajuCalcResult {
  let { birthYear, birthMonth, birthDay, birthHour, gender, calendarType, currentYear } = input;

  if (calendarType === 'lunar') {
    const s = lunarToSolar(birthYear, birthMonth, birthDay);
    birthYear = s.year; birthMonth = s.month; birthDay = s.day;
  }

  const solarBirthDate = { year: birthYear, month: birthMonth, day: birthDay };

  // 사주 원국
  const yearPillar  = calcYearPillar(birthYear, birthMonth, birthDay);
  const monthPillar = calcMonthPillar(yearPillar.stemIdx, birthMonth, birthDay);
  const dayPillar   = calcDayPillar(birthYear, birthMonth, birthDay);
  const hourPillar  = birthHour >= 0
    ? calcHourPillar(dayPillar.stemIdx, birthHour)
    : null;

  const fourPillars: FourPillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };

  // 일간
  const dayMaster = {
    heavenly: dayPillar.heavenly,
    element: STEM_ELEMENTS[dayPillar.stemIdx],
    yinYang: STEM_YIN_YANG[dayPillar.stemIdx],
    stemIdx: dayPillar.stemIdx,
  };

  // 오행 분포
  const fiveElements = countElements([yearPillar, monthPillar, dayPillar, hourPillar]);

  // 용신/기신
  const { favorable: favorableElement, unfavorable: unfavorableElement } =
    determineFavorableElement(dayPillar.stemIdx, fiveElements);

  // 대운
  const majorLucks = calcMajorLucks(
    yearPillar, monthPillar, gender, birthYear, birthMonth, birthDay
  );

  // 현재 대운
  const currentAge = currentYear - birthYear;
  const currentLuck = majorLucks.find(l => currentAge >= l.startAge && currentAge <= l.endAge) ?? majorLucks[0];

  // 커리어 계절
  const seasonRelationship = getRelationship(dayMaster.element, currentLuck.stemElement);
  const careerSeason = determineCareerSeason(seasonRelationship);

  // 계절 사이클
  const seasonCycle = calcSeasonCycle(majorLucks, dayMaster.element, currentYear);

  // 전성기 Top 5
  const goldenYears = calcGoldenYears(
    birthYear, majorLucks, dayPillar.stemIdx,
    fourPillars, favorableElement, unfavorableElement, currentYear
  );

  return {
    fourPillars, dayMaster, fiveElements,
    favorableElement, unfavorableElement,
    majorLucks, currentLuck,
    careerSeason, seasonRelationship,
    seasonCycle, goldenYears,
    solarBirthDate,
  };
}
