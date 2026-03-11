/**
 * SoulSyncEquation.tsx — V44
 * 소울-싱크 방정식: 자미두수 × MBTI × 사주 오행 트리플 퓨전
 *
 * Synergy = (Star_Archetype ⊕ MBTI_Function) ⊗ Energy_Flow
 *
 * ✦ Persona Fusion: 주성+MBTI 시너지 페르소나 도출
 * ✦ Energy Overdrive: 지배 오행이 이 결합체에 주는 가속/제동
 * ✦ Oracle's Gambit: MBTI 약점 × 명리학 해법 '마스터의 한 수'
 * ✦ 삼중 융합 시각적 방정식 애니메이션
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Wind, Crown, Flame, Target } from 'lucide-react';
import { STAR_SOULS } from './StarSoulArchive';

// ── MBTI 그룹 분류 ────────────────────────────────────────────────────────

type MbtiGroup = 'NT' | 'NF' | 'ST' | 'SF';

const MBTI_GROUPS: Record<MbtiGroup, { label: string; color: string; desc: string; types: string[] }> = {
    NT: { label: '전략가형', color: '#6366f1', desc: '직관·사고 (Intuition × Thinking)', types: ['ENTJ', 'ENTP', 'INTJ', 'INTP'] },
    NF: { label: '이상주의형', color: '#e879f9', desc: '직관·감성 (Intuition × Feeling)', types: ['ENFJ', 'ENFP', 'INFJ', 'INFP'] },
    ST: { label: '현실주의형', color: '#f59e0b', desc: '감각·사고 (Sensing × Thinking)', types: ['ESTJ', 'ESTP', 'ISTJ', 'ISTP'] },
    SF: { label: '조력자형', color: '#34d399', desc: '감각·감성 (Sensing × Feeling)', types: ['ESFJ', 'ESFP', 'ISFJ', 'ISFP'] },
};

function getMbtiGroup(mbti: string): MbtiGroup {
    const t = mbti.toUpperCase();
    if (t.includes('N') && t.includes('T')) return 'NT';
    if (t.includes('N') && t.includes('F')) return 'NF';
    if (t.includes('S') && t.includes('T')) return 'ST';
    return 'SF';
}

// ── 주성 × MBTI 그룹 퓨전 테이블 ─────────────────────────────────────────

interface FusionProfile {
    title: string;    // 페르소나 이름
    subtitle: string; // 한 줄 정의
    logic: string;    // 시너지 논리
    power: string;    // 핵심 능력
    shadow: string;   // 잠재적 함정
    synergy: number;  // 시너지 점수 (0-100)
}

const STAR_MBTI_FUSION: Record<string, Record<MbtiGroup, FusionProfile>> = {
    ziwei: {
        NT: { title: '천상의 지휘관', subtitle: 'The Celestial Commander', logic: '제왕의 권위가 현대적 실행력을 만나 실질적 제국을 건설하는 전략적 황제', power: '선천적 카리스마 × 체계적 실행 = 시대를 바꾸는 리더십', shadow: '완벽주의가 주변을 압박하고 협력자가 이탈할 수 있음', synergy: 96 },
        NF: { title: '빛의 군주', subtitle: 'The Luminous Sovereign', logic: '제왕의 권위가 공감과 이상주의로 물들어 사람들의 마음을 지배하는 구원자적 왕', power: '카리스마 × 공감력 = 설득과 감동의 제왕', shadow: '이상과 현실의 괴리로 번아웃 위험, 결정 지연', synergy: 89 },
        ST: { title: '철의 통치자', subtitle: 'The Iron Sovereign', logic: '제왕의 본능이 감각적 현실주의와 결합하여 확실한 성과를 쌓는 현실 군주', power: '권위 × 실용성 = 결과물로 증명하는 지도력', shadow: '감성 무시로 충성심 약화, 인간관계 건조', synergy: 82 },
        SF: { title: '어진 황후', subtitle: 'The Benevolent Empress', logic: '제왕의 기운이 섬세한 배려로 포장되어 사람들이 자발적으로 따르게 만드는 현인 군주', power: '권위 × 따뜻함 = 누구도 반기하지 않는 존재', shadow: '타인 의존도 상승, 강한 결단력 부족 위험', synergy: 78 },
    },
    tanlang: {
        NT: { title: '에테르의 건축가', subtitle: 'The Etheric Architect', logic: '무한한 욕망과 호기심이 분석 능력을 만나 트렌드를 먼저 창조하는 선구자', power: '다재다능 × 전략적 사고 = 시대를 앞서가는 비전가', shadow: '지적 오만, 완성보다 구상에서 멈추는 경향', synergy: 91 },
        NF: { title: '에테르의 뮤즈', subtitle: 'The Etheric Muse', logic: '무한한 욕망과 인간적 공감이 결합하여 사람들의 마음을 뒤흔드는 예술적 파동 생성', power: '도화 기질 × 공감력 = 영혼을 파고드는 예술가', shadow: '감정 과몰입, 현실 계획 부재, 관계 소진', synergy: 94 },
        ST: { title: '시장의 마술사', subtitle: 'The Market Magician', logic: '삶의 욕망에 대한 통찰이 현실적 감각을 만나 사람들이 원하는 것을 파는 천재 사업가', power: '인간 욕망 이해 × 실행력 = 밀리언셀러 메이커', shadow: '도덕적 경계 모호, 단기 이익에 집중할 위험', synergy: 87 },
        SF: { title: '사랑의 연금술사', subtitle: 'The Love Alchemist', logic: '도화성의 매력과 따뜻한 공감이 결합하여 주변을 끊임없이 매료시키는 인간 자석', power: '매력 × 배려 = 모든 관계를 황금으로 바꾸는 능력', shadow: '과도한 사교로 자기계발 소홀, 우선순위 혼란', synergy: 88 },
    },
    qisha: {
        NT: { title: '고독한 혁명가', subtitle: 'The Solitary Revolutionary', logic: '칠살의 전투력이 전략적 직관과 결합하여 기존 질서를 무너뜨리고 새 판을 짜는 파괴자', power: '전투력 × 전략 = 불가능을 가능으로 만드는 선봉장', shadow: '혼자 모든 것을 짊어지려는 경향, 협력 거부', synergy: 93 },
        NF: { title: '상처받은 선지자', subtitle: 'The Wounded Prophet', logic: '격렬한 투쟁 에너지가 이상주의와 충돌하여 세상을 바꾸려는 강렬한 사명감 발현', power: '열정 × 비전 = 사람들의 가슴에 불을 지피는 연사', shadow: '과도한 사명감으로 자기 파괴, 번아웃 고위험', synergy: 85 },
        ST: { title: '냉철한 군인', subtitle: 'The Cold Soldier', logic: '칠살의 투쟁 본능이 현실적 사고와 결합하여 가장 효율적인 방법으로 목표를 달성하는 전문 전사', power: '결단력 × 실용성 = 임무 완수의 달인', shadow: '감정 표현 부재, 인간관계를 도구로 보는 경향', synergy: 88 },
        SF: { title: '용맹한 수호자', subtitle: 'The Valiant Guardian', logic: '칠살의 투쟁 에너지가 공동체 보호 본능과 결합하여 약자를 위해 싸우는 정의로운 기사', power: '용기 × 따뜻함 = 사랑하는 사람을 위한 무적의 전사', shadow: '과도한 희생으로 자기 소진, 분노 억압 및 폭발', synergy: 82 },
    },
    tianji: {
        NT: { title: '우주적 설계자', subtitle: 'The Cosmic Architect', logic: '천기의 무한한 두뇌 회전이 전략적 사고와 만나 미래를 설계하는 수석 포석가', power: '지략 × 분석력 = 10수 앞을 내다보는 전략의 신', shadow: '과분석으로 행동 지연, 완벽한 계획에 집착', synergy: 98 },
        NF: { title: '신비로운 예언가', subtitle: 'The Mystic Oracle', logic: '천기의 예민한 직관이 이상적 공감력과 결합하여 사람들의 운명을 꿰뚫어보는 선지자', power: '직관 × 공감 = 사람의 마음과 미래를 읽는 능력', shadow: '과민감으로 신경계 과부하, 현실 결정 회피', synergy: 92 },
        ST: { title: '정밀한 분석관', subtitle: 'The Precision Analyst', logic: '천기의 계획 본능이 현실 감각과 결합하여 복잡한 데이터에서 핵심을 추출하는 전문가', power: '지략 × 현실 감각 = 오류 없는 판단과 실행 시스템', shadow: '창의성 억제, 계획 변경에 대한 저항감', synergy: 86 },
        SF: { title: '현명한 조력자', subtitle: 'The Wise Enabler', logic: '천기의 정보 처리 능력이 공동체 지향성과 결합하여 주변 사람들을 성장시키는 멘토', power: '지혜 × 배려 = 옆에 있으면 모두가 성장하는 존재', shadow: '자신의 탁월함 발현보다 남을 위한 소진', synergy: 81 },
    },
    taiyang: {
        NT: { title: '태양계의 왕', subtitle: 'The Sun King', logic: '태양의 공익적 에너지가 전략적 야망과 결합하여 세상을 자신의 의도대로 변화시키는 지도자', power: '명예욕 × 전략 = 사회 전체를 움직이는 권력', shadow: '명예 강박, 타인의 평가에 지나치게 의존', synergy: 95 },
        NF: { title: '빛나는 구원자', subtitle: 'The Radiant Savior', logic: '태양의 열정적 에너지가 인류애와 결합하여 세상을 더 나은 곳으로 만들려는 사명자', power: '열정 × 공감 = 사람들에게 용기를 주는 빛', shadow: '자기 희생 과잉, 타인의 문제를 모두 짊어짐', synergy: 90 },
        ST: { title: '성실한 관료', subtitle: 'The Dedicated Official', logic: '태양의 공익 지향성이 현실적 책임감과 결합하여 시스템을 올바르게 운영하는 유능한 관리자', power: '정직성 × 실행력 = 신뢰받는 조직의 기둥', shadow: '창의성 부족, 규범을 벗어난 유연성 결여', synergy: 83 },
        SF: { title: '공동체의 태양', subtitle: 'The Community Sun', logic: '태양의 따뜻한 에너지가 공동체 지향성과 결합하여 주변을 환하게 밝히는 마을의 영웅', power: '에너지 × 배려 = 모두가 그를 따르는 자연스러운 중심', shadow: '과도한 사회적 역할로 개인 삶 희생', synergy: 85 },
    },
};

// 미매핑 별의 기본 퓨전 프로파일
function getDefaultFusion(starId: string, group: MbtiGroup): FusionProfile {
    const star = STAR_SOULS.find(s => s.id === starId);
    const g = MBTI_GROUPS[group];
    const synergyBase = [82, 85, 88, 92][Object.keys(MBTI_GROUPS).indexOf(group)] ?? 85;
    return {
        title: `${star?.nameKo ?? '운명'} × ${g.label}`,
        subtitle: `The ${star?.codename.split(' ').slice(-1)[0] ?? 'Destiny'} ${group}`,
        logic: `${star?.nameKo ?? '이 별'}의 기운이 ${g.label}적 도구와 결합하여 독특한 운명 방정식을 형성합니다.`,
        power: `${(star?.traits ?? ['고유 능력'])[0]} × ${g.desc.split(' ')[0]}`,
        shadow: '각 기질의 극단을 경계하세요. 균형이 최고의 무기입니다.',
        synergy: synergyBase + (starId.charCodeAt(0) % 10),
    };
}

// ── 오행 에너지 분석 ──────────────────────────────────────────────────────

interface ElementProfile {
    symbol: string;
    color: string;
    glowColor: string;
    season: string;
    keyword: string;
    acceleration: string;  // 이 오행이 주는 가속 방향
    gambit: string;        // 마스터의 한 수
}

const ELEMENT_PROFILES: Record<string, ElementProfile> = {
    목: {
        symbol: '木', color: '#4ade80', glowColor: 'rgba(74,222,128,0.3)',
        season: '봄', keyword: '성장 · 시작 · 상승',
        acceleration: '지금 우주가 "성장"에 가 있습니다. 새로운 도전과 시작에 최적의 타이밍 — 지금 씨앗을 심어야 10년 후 거목이 됩니다.',
        gambit: '지금 인간관계에 투자하세요. 목(木)의 에너지는 뿌리가 넓을수록 더 크게 자랍니다. 혼자 성장하려 하지 마세요.',
    },
    화: {
        symbol: '火', color: '#f97316', glowColor: 'rgba(249,115,22,0.3)',
        season: '여름', keyword: '확장 · 열정 · 가시성',
        acceleration: '지금은 "확장과 빛남"의 계절입니다. 당신의 주성적 권위가 세상에 드러날 황금 타임 — 망설이지 말고 깃발을 꽂으십시오.',
        gambit: '과열을 조심하세요. 화(火)의 과잉은 충동적 결정과 갈등을 부릅니다. 중요한 결정 전 하루 더 생각하는 것이 왕도입니다.',
    },
    토: {
        symbol: '土', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.3)',
        season: '환절기', keyword: '안정 · 신뢰 · 축적',
        acceleration: '지금은 "토대 구축"의 시기입니다. 눈에 보이는 성과보다 보이지 않는 신뢰와 체계를 쌓으십시오. 이것이 10년 자산이 됩니다.',
        gambit: '보수적 경향을 경계하세요. 토(土)의 기운이 강하면 변화를 거부하게 됩니다. 작은 실험을 두려워하지 마세요.',
    },
    금: {
        symbol: '金', color: '#e2e8f0', glowColor: 'rgba(226,232,240,0.3)',
        season: '가을', keyword: '수확 · 결단 · 정제',
        acceleration: '지금은 "수확과 결단"의 계절입니다. 그동안 쌓아온 것을 정리하고, 불필요한 것을 과감히 쳐내는 결단이 필요합니다.',
        gambit: '냉혹함이 외로움을 부를 수 있습니다. 금(金)의 날카로움을 잠시 내려두고, 가까운 사람에게 따뜻함을 표현하세요.',
    },
    수: {
        symbol: '水', color: '#7dd3fc', glowColor: 'rgba(125,211,252,0.3)',
        season: '겨울', keyword: '지혜 · 잠복 · 심화',
        acceleration: '지금은 "지혜를 모으고 잠복"하는 계절입니다. 실행보다 설계에 집중하십시오. 당신의 주성적 두뇌 회전이 가장 날카로워지는 시점입니다.',
        gambit: '움직이지 않는 것을 나태함과 혼동하지 마세요. 수(水)의 시절엔 깊이 잠수하는 것이 전략입니다. 단, 타이밍을 놓치지 않도록 준비만은 계속하세요.',
    },
};

// ── 시너지 방정식 시각화 ─────────────────────────────────────────────────

const EquationBlock: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    delay?: number;
}> = ({ icon, label, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, type: 'spring', stiffness: 220, damping: 24 }}
        className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center"
        style={{ background: `${color}12`, border: `1px solid ${color}30` }}
    >
        <div className="p-1.5 rounded-xl" style={{ background: `${color}20` }}>
            {icon}
        </div>
        <div className="text-[7px] font-black tracking-[0.3em] uppercase" style={{ color: `${color}70` }}>{label}</div>
        <div className="text-[10px] font-black leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>{value}</div>
    </motion.div>
);

const Operator: React.FC<{ symbol: string; delay?: number }> = ({ symbol, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: 'spring' }}
        className="text-lg font-black flex-shrink-0"
        style={{ color: 'rgba(212,175,55,0.6)' }}
    >
        {symbol}
    </motion.div>
);

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

interface SoulSyncEquationProps {
    /** 사용자 자미두수 주성 ID */
    starId?: string;
    /** 사용자 MBTI */
    mbti?: string;
    /** 지배 오행 ('목'|'화'|'토'|'금'|'수') */
    dominantElement?: string;
    /** Gemini가 생성한 소울-싱크 분석 텍스트 */
    aiAnalysis?: {
        personaTitle?: string;
        personaLogic?: string;
        energyMessage?: string;
        oracleGambit?: string;
        synergyScore?: number;
    };
}

const SoulSyncEquation: React.FC<SoulSyncEquationProps> = ({
    starId = 'ziwei',
    mbti = 'ENTJ',
    dominantElement = '화',
    aiAnalysis,
}) => {
    const [activeTab, setActiveTab] = useState<'persona' | 'energy' | 'gambit'>('persona');
    const [synergyAnim, setSynergyAnim] = useState(0);

    const star = STAR_SOULS.find(s => s.id === starId);
    const mbtiGroup = getMbtiGroup(mbti);
    const groupInfo = MBTI_GROUPS[mbtiGroup];
    const elementProfile = ELEMENT_PROFILES[dominantElement] ?? ELEMENT_PROFILES['화'];

    const fusion = useMemo(() => {
        const table = STAR_MBTI_FUSION[starId];
        return table?.[mbtiGroup] ?? getDefaultFusion(starId, mbtiGroup);
    }, [starId, mbtiGroup]);

    const finalSynergy = aiAnalysis?.synergyScore ?? Math.round(
        (fusion.synergy * 0.5) +
        (50 + (dominantElement.charCodeAt(0) % 30)) * 0.3 +
        (75 + (mbti.charCodeAt(0) % 20)) * 0.2
    );

    // 시너지 점수 카운트업
    useEffect(() => {
        let start = 0;
        const step = Math.ceil(finalSynergy / 40);
        const t = setInterval(() => {
            start = Math.min(start + step, finalSynergy);
            setSynergyAnim(start);
            if (start >= finalSynergy) clearInterval(t);
        }, 35);
        return () => clearInterval(t);
    }, [finalSynergy]);

    const tabs = [
        { id: 'persona' as const, label: '페르소나 퓨전', icon: <Crown className="w-3 h-3" /> },
        { id: 'energy' as const, label: '에너지 오버드라이브', icon: <Flame className="w-3 h-3" /> },
        { id: 'gambit' as const, label: '마스터의 한 수', icon: <Target className="w-3 h-3" /> },
    ];

    return (
        <div className="w-full space-y-5">
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3))' }} />
                <div className="text-center">
                    <p className="text-[8px] font-black tracking-[0.5em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                        V44 · Soul-Sync Equation
                    </p>
                    <h3 className="text-sm font-serif font-black" style={{ color: 'rgba(212,175,55,0.9)' }}>
                        소울-싱크 방정식
                    </h3>
                </div>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.3))' }} />
            </div>

            {/* 방정식 시각화 */}
            <div className="rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(5,5,20,0.9)', border: '1px solid rgba(212,175,55,0.12)' }}>
                <div className="text-[7px] font-black tracking-[0.4em] uppercase text-center"
                    style={{ color: 'rgba(212,175,55,0.4)' }}>
                    Synergy = (Star ⊕ MBTI) ⊗ Energy
                </div>

                {/* EquationBlocks */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <EquationBlock
                        icon={<span className="text-lg">{star?.icon ?? '✦'}</span>}
                        label="Star-Soul"
                        value={star?.nameKo ?? starId}
                        color={star?.color ?? '#D4AF37'}
                        delay={0}
                    />
                    <Operator symbol="⊕" delay={0.15} />
                    <EquationBlock
                        icon={<Star className="w-4 h-4" style={{ color: groupInfo.color }} />}
                        label="MBTI"
                        value={`${mbti} (${groupInfo.label})`}
                        color={groupInfo.color}
                        delay={0.3}
                    />
                    <Operator symbol="⊗" delay={0.45} />
                    <EquationBlock
                        icon={<span className="text-xl font-black" style={{ color: elementProfile.color }}>{elementProfile.symbol}</span>}
                        label="오행 에너지"
                        value={`${dominantElement}(${elementProfile.season})`}
                        color={elementProfile.color}
                        delay={0.6}
                    />
                    <Operator symbol="=" delay={0.75} />

                    {/* = 결과 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center min-w-[70px]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                            border: '1.5px solid rgba(212,175,55,0.4)',
                            boxShadow: '0 0 24px rgba(212,175,55,0.2)',
                        }}
                    >
                        <div className="text-[7px] font-black tracking-[0.3em] uppercase"
                            style={{ color: 'rgba(212,175,55,0.6)' }}>Synergy</div>
                        <motion.div
                            className="text-2xl font-serif font-black"
                            style={{ color: '#D4AF37' }}
                            animate={{ textShadow: ['0 0 8px rgba(212,175,55,0.4)', '0 0 20px rgba(212,175,55,0.8)', '0 0 8px rgba(212,175,55,0.4)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {synergyAnim}
                        </motion.div>
                    </motion.div>
                </div>

                {/* 페르소나 제목 */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="text-center py-3 rounded-xl"
                    style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                    <div className="text-[8px] font-black tracking-[0.4em] uppercase mb-1"
                        style={{ color: 'rgba(212,175,55,0.5)' }}>당신의 우주적 페르소나</div>
                    <div className="text-lg font-serif font-black" style={{ color: 'rgba(212,175,55,0.95)' }}>
                        {aiAnalysis?.personaTitle ?? fusion.title}
                    </div>
                    <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {fusion.subtitle}
                    </div>
                </motion.div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[8px] font-black tracking-widest uppercase transition-all"
                        style={{
                            background: activeTab === tab.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: activeTab === tab.id ? 'rgba(212,175,55,0.9)' : 'rgba(255,255,255,0.3)',
                            border: activeTab === tab.id ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                        }}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            <AnimatePresence mode="wait">
                {activeTab === 'persona' && (
                    <motion.div
                        key="persona"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3"
                    >
                        {/* 시너지 로직 */}
                        <div className="rounded-2xl p-4 space-y-3"
                            style={{ background: 'rgba(5,5,20,0.8)', border: `1px solid ${star?.color ?? '#D4AF37'}20` }}>
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" style={{ color: star?.color ?? '#D4AF37' }} />
                                <span className="text-[8px] font-black tracking-[0.3em] uppercase"
                                    style={{ color: `${star?.color ?? '#D4AF37'}70` }}>Fusion Logic</span>
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {aiAnalysis?.personaLogic ?? fusion.logic}
                            </p>
                        </div>

                        {/* 강점 & 함정 */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl p-3 space-y-1.5"
                                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                <div className="text-[7px] font-black tracking-widest uppercase text-emerald-400/70">핵심 강점 Power</div>
                                <p className="text-[9px] leading-relaxed text-emerald-300/80">{fusion.power}</p>
                            </div>
                            <div className="rounded-xl p-3 space-y-1.5"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <div className="text-[7px] font-black tracking-widest uppercase text-red-400/70">잠재적 함정 Shadow</div>
                                <p className="text-[9px] leading-relaxed text-red-300/80">{fusion.shadow}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'energy' && (
                    <motion.div
                        key="energy"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3"
                    >
                        {/* 오행 헤더 */}
                        <div className="flex items-center gap-3 p-4 rounded-2xl"
                            style={{
                                background: `${elementProfile.glowColor}`,
                                border: `1px solid ${elementProfile.color}30`,
                            }}>
                            <motion.div
                                className="text-4xl font-black font-serif flex-shrink-0"
                                style={{ color: elementProfile.color }}
                                animate={{ textShadow: [`0 0 10px ${elementProfile.glowColor}`, `0 0 30px ${elementProfile.glowColor}`, `0 0 10px ${elementProfile.glowColor}`] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {elementProfile.symbol}
                            </motion.div>
                            <div>
                                <div className="text-[7px] font-black tracking-[0.4em] uppercase"
                                    style={{ color: `${elementProfile.color}70` }}>
                                    {dominantElement}행 ({elementProfile.season}) · {elementProfile.keyword}
                                </div>
                                <div className="text-xs font-black mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    현재 지배 오행: {dominantElement}(
                                    {elementProfile.symbol})
                                </div>
                            </div>
                        </div>

                        {/* 가속 메시지 */}
                        <div className="rounded-2xl p-4 space-y-2"
                            style={{ background: 'rgba(5,5,20,0.8)', border: `1px solid ${elementProfile.color}20` }}>
                            <div className="flex items-center gap-2">
                                <Wind className="w-3 h-3" style={{ color: elementProfile.color }} />
                                <span className="text-[8px] font-black tracking-[0.3em] uppercase"
                                    style={{ color: `${elementProfile.color}70` }}>Energy Overdrive · 오행의 가속도</span>
                            </div>
                            <p className="text-[11px] leading-relaxed font-serif italic"
                                style={{ color: 'rgba(255,255,255,0.8)' }}>
                                "{aiAnalysis?.energyMessage ?? elementProfile.acceleration}"
                            </p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'gambit' && (
                    <motion.div
                        key="gambit"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3"
                    >
                        {/* 마스터의 한 수 */}
                        <div className="rounded-2xl p-5 space-y-3"
                            style={{
                                background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(5,5,20,0.9))',
                                border: '1.5px solid rgba(212,175,55,0.3)',
                                boxShadow: '0 0 30px rgba(212,175,55,0.08)',
                            }}>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(212,175,55,0.2)' }}>
                                    <Target className="w-3 h-3" style={{ color: '#D4AF37' }} />
                                </div>
                                <div>
                                    <div className="text-[7px] font-black tracking-[0.4em] uppercase"
                                        style={{ color: 'rgba(212,175,55,0.6)' }}>Oracle's Gambit</div>
                                    <div className="text-[9px] font-black" style={{ color: 'rgba(255,255,255,0.5)' }}>마스터 오라클의 한 수</div>
                                </div>
                            </div>

                            <p className="text-[12px] leading-relaxed font-serif"
                                style={{ color: 'rgba(255,255,255,0.85)' }}>
                                {aiAnalysis?.oracleGambit ?? (
                                    `당신은 ${mbti}로서 ${fusion.power.split('=')[0].trim()}의 강점을 지녔습니다. 그러나 현재 사주의 ${dominantElement}(${elementProfile.symbol}) 기운이 ${elementProfile.keyword}를 요구합니다. ${elementProfile.gambit}`
                                )}
                            </p>

                            {/* 삼중 태그 */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {[
                                    { label: star?.nameKo ?? starId, color: star?.color ?? '#D4AF37' },
                                    { label: mbti, color: groupInfo.color },
                                    { label: `${dominantElement}${elementProfile.symbol}`, color: elementProfile.color },
                                ].map(tag => (
                                    <span key={tag.label}
                                        className="px-2 py-0.5 rounded-full text-[8px] font-black"
                                        style={{ background: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 최종 운명 서사 */}
                        <div className="rounded-2xl p-4 space-y-2"
                            style={{ background: 'rgba(5,5,20,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-[7px] font-black tracking-[0.4em] uppercase"
                                style={{ color: 'rgba(212,175,55,0.4)' }}>Final Verdict · 최종 운명 서사</div>
                            <p className="text-[11px] leading-relaxed font-serif italic"
                                style={{ color: 'rgba(255,255,255,0.6)' }}>
                                "당신은 <span style={{ color: star?.color ?? '#D4AF37', fontWeight: 'bold' }}>
                                    {star?.nameKo ?? starId}
                                </span>의 혼을 가지고 <span style={{ color: groupInfo.color, fontWeight: 'bold' }}>
                                    {mbti}
                                </span>의 방식으로 <span style={{ color: elementProfile.color, fontWeight: 'bold' }}>
                                    {dominantElement}({elementProfile.symbol})의 파도
                                </span>를 타고 있습니다. 이 방정식이 완전히 발동될 때, 당신이 서 있는 곳이 역사가 됩니다."
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SoulSyncEquation;
export type { SoulSyncEquationProps };
