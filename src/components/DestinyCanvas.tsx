/**
 * DestinyCanvas.tsx — V45 Destiny Flex
 * 황금빛 운명 마스터피스 캔버스 (내보내기 전용 레이아웃)
 *
 * ✦ 4:5 황금비율 (인스타그램 피드 최적)
 * ✦ 신성 기하학 + 금박 질감 배경
 * ✦ 주성 아이콘 + 12궁 미니 그리드
 * ✦ Master Oracle's Seal (붉은 인장 + 시리얼)
 * ✦ 액자 프레임 선택 (다크우드 / 샴페인 골드)
 */

import React, { forwardRef } from 'react';
import { STAR_SOULS } from './StarSoulArchive';
import { PALACE_MAP } from './JamiFaceMesh';

// ── 마스터피스 전용 금박 질감 ──
const GOLD_GRADIENT = "linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)";
const OBSIDIAN_WOOD = "linear-gradient(145deg, #151515, #050505, #111111)";

export interface DestinyCanvasData {
    starId?: string;
    mbti?: string;
    dominantElement?: string;
    personaTitle?: string;
    personaSubtitle?: string;
    synergyScore?: number;
    facialSyncRate?: number;
    oracleSummary?: string;
    syncRates?: Record<string, number>;
    serial: string;
    userName?: string;
    frameStyle?: 'darkwood' | 'champagne';
}

const DestinyCanvas = forwardRef<HTMLDivElement, { data: DestinyCanvasData; id?: string }>(({
    data, id = 'destiny-canvas-export',
}, ref) => {
    const {
        starId = 'ziwei',
        mbti = 'ENTJ',
        dominantElement = '화',
        personaTitle = '천상의 지휘관',
        personaSubtitle = 'The Celestial Commander',
        synergyScore = 96,
        facialSyncRate = 87,
        oracleSummary,
        syncRates = {},
        serial,
        userName = 'Seeker',
        frameStyle = 'champagne',
    } = data;

    const frame = frameStyle === 'darkwood'
        ? { border: '#1a1008', bg: 'linear-gradient(145deg, #151515, #0a0a0a, #151515)', accent: '#654321' }
        : { border: '#1a1a1a', bg: 'linear-gradient(145deg, #1a1a1a, #0d0d0d, #1a1a1a)', accent: 'rgba(212,175,55,0.3)' };

    const star = STAR_SOULS.find(s => s.id === starId);
    const elemColor = ({ '목': '#4ade80', '화': '#f97316', '토': '#fbbf24', '금': '#e2e8f0', '수': '#7dd3fc' } as any)[dominantElement] || '#f97316';

    return (
        <div
            id={id}
            ref={ref}
            style={{
                width: 600, // 4:5 비율 최적 (600x750)
                height: 750,
                background: frame.bg,
                border: `12px solid ${frame.border}`,
                boxShadow: '0 50px 100px rgba(0,0,0,0.8), inset 0 0 40px rgba(212,175,55,0.1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: '30px',
                overflow: 'hidden',
                color: '#fff',
                fontFamily: "'Noto Serif KR', serif",
            }}
        >
            {/* 1. 캔버스 질감 오버레이 (SVG Filter) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none', zIndex: 10 }}>
                <filter id="canvasNoise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#canvasNoise)" />
            </svg>

            {/* 2. 조명 효과 (키아로스쿠로) */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 35%, rgba(212,175,55,0.1) 0%, transparent 70%)',
                zIndex: 1,
            }} />

            {/* 3. 금박 프레임 디테일 */}
            <div style={{
                position: 'absolute', inset: 15,
                border: '1px solid rgba(212,175,55,0.3)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 2,
            }} />

            {/* ── 상단: 칭호 (Title) ── */}
            <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                    fontSize: 10, fontWeight: 900, letterSpacing: '0.6em', color: 'rgba(212,175,55,0.6)',
                    textTransform: 'uppercase', marginBottom: 5
                }}>
                    Grand Oracle Masterpiece
                </div>
                <div style={{
                    fontSize: 32, fontWeight: 900,
                    background: GOLD_GRADIENT,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                }}>
                    {personaTitle}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: 4 }}>
                    {personaSubtitle}
                </div>
            </div>

            {/* ── 중앙: 소울 아트 (Hero) ── */}
            <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* 명반 배경 라인 */}
                <svg style={{ position: 'absolute', width: '120%', height: '120%', opacity: 0.1 }} viewBox="0 0 500 500">
                    <circle cx="250" cy="250" r="240" stroke="#D4AF37" strokeWidth="0.5" fill="none" />
                    <polygon points="250,10 490,400 10,400" stroke="#D4AF37" strokeWidth="0.3" fill="none" />
                    <polygon points="250,490 10,100 490,100" stroke="#D4AF37" strokeWidth="0.3" fill="none" />
                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2;
                        return <line key={i} x1="250" y1="250" x2={250 + Math.cos(angle) * 240} y2={250 + Math.sin(angle) * 240} stroke="#D4AF37" strokeWidth="0.2" />;
                    })}
                </svg>

                {/* 메인 캐릭터 카드 */}
                <div style={{
                    width: 280, height: 380,
                    background: 'rgba(10,10,25,0.85)',
                    border: '2px solid rgba(212,175,55,0.4)',
                    borderRadius: 12,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.2)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '25px',
                    position: 'relative'
                }}>
                    <div style={{ fontSize: 80, lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))' }}>
                        {star?.icon || '✦'}
                    </div>
                    <div style={{
                        marginTop: 20, fontSize: 18, fontWeight: 900,
                        color: 'rgba(212,175,55,0.9)', letterSpacing: '0.3em'
                    }}>
                        {star?.nameCN || '命'}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, marginTop: 5 }}>
                        {star?.nameKo || starId}
                    </div>
                    <div style={{
                        marginTop: 15, padding: '4px 15px', borderRadius: 4,
                        background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                        fontSize: 10, fontWeight: 900, color: '#D4AF37', letterSpacing: '0.2em'
                    }}>
                        {synergyScore >= 90 ? 'LEGENDARY' : 'EPIC'} SYNERGY
                    </div>

                    {/* 3D 랜드마크 데이터 오버레이 스타일 */}
                    <div style={{
                        position: 'absolute', bottom: 20, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', gap: 15, opacity: 0.6
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 6, color: 'rgba(212,175,55,0.7)' }}>FACIAL SYNC</div>
                            <div style={{ fontSize: 12, fontWeight: 900 }}>{facialSyncRate}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 6, color: 'rgba(212,175,55,0.7)' }}>HARMONY</div>
                            <div style={{ fontSize: 12, fontWeight: 900 }}>{synergyScore}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 하단: 서사 (Verdict) ── */}
            <div style={{ position: 'relative', zIndex: 5, padding: '20px 0', borderTop: '0.5px solid rgba(212,175,55,0.2)' }}>
                <div style={{
                    fontSize: 8, fontWeight: 900, color: 'rgba(212,175,55,0.5)',
                    letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center'
                }}>
                    The Master's Verdict
                </div>
                <p style={{
                    fontSize: 13, lineHeight: 1.8, textAlign: 'center', fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.7)', padding: '0 20px', margin: 0
                }}>
                    "{oracleSummary || `당신은 ${star?.nameKo}의 혼을 품고 ${mbti}의 방식으로 ${dominantElement}행의 파도를 타고 있습니다. 고귀한 왕좌가 당신을 기다립니다.`}"
                </p>
            </div>

            {/* ── 푸터: 인장 & 시리얼 ── */}
            <div style={{
                position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                marginTop: 10, paddingTop: 10
            }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 8, fontWeight: 900, color: 'rgba(212,175,55,0.4)', letterSpacing: '0.2em' }}>
                        FATE-SYNC / MASTER ORACLE
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                        Captured for {userName} · {new Date().toLocaleDateString()}
                    </div>
                    {/* QR Code for Viral Growth */}
                    <div style={{
                        marginTop: 10, width: 45, height: 45, padding: 4, background: 'rgba(255,255,255,0.9)',
                        borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(212,175,55,0.2)'
                    }}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://fatesync-v48.vercel.app')}`}
                            alt="QR"
                            style={{ width: '100%', height: '100%', filter: 'contrast(1.2)' }}
                        />
                    </div>
                    <div style={{ fontSize: 5, color: 'rgba(212,175,55,0.4)', marginTop: 4, letterSpacing: '1px' }}>
                        SCAN TO SYNC YOUR FATE
                    </div>
                </div>

                {/* 붉은 인장 (Wax Seal) */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: 60, height: 60, background: 'radial-gradient(circle at 40% 40%, #c00, #800)',
                        borderRadius: '50%', border: '4px solid #900', boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                    }}>
                        <div style={{
                            fontSize: 24, fontWeight: 900, color: 'rgba(255,215,0,0.7)',
                            fontFamily: 'serif', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))'
                        }}>
                            命
                        </div>
                        <div style={{ position: 'absolute', inset: 5, border: '1px dashed rgba(255,215,0,0.2)', borderRadius: '50%' }} />
                    </div>
                    <div style={{ fontSize: 7, fontWeight: 900, color: 'rgba(212,175,55,0.3)', marginTop: 4, letterSpacing: '1px' }}>
                        SERIAL: {serial}
                    </div>
                </div>
            </div>
        </div>
    );
});

DestinyCanvas.displayName = 'DestinyCanvas';
export default DestinyCanvas;
