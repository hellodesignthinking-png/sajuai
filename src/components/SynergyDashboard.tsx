import React from 'react';
import { motion } from 'framer-motion';
import { CompatibilityResult, UserFateData } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import ReactMarkdown from 'react-markdown';

export const SynergyDashboard = ({ result, usersData }: { result: CompatibilityResult, usersData: UserFateData[] }) => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 pb-24 mt-20">
            <header className="text-center pt-8">
                <h2 className="text-4xl md:text-7xl font-black text-white bg-clip-text text-transparent bg-gradient-to-br from-[#f5d87d] via-[#D4AF37] to-[#b8860b] mb-4">
                    {result.mode === 'COMPAT_LOVE' ? 'Soul-Sync Report' : 'Strategic Synergy Report'}
                </h2>
                <div className="text-xs md:text-sm text-mystic-gold font-black tracking-[0.5em] uppercase opacity-60">
                    {result.mode === 'COMPAT_LOVE' ? '✨ 유전적·영적 결합 분석' : '💼 오행 기반 전략적 조언'}
                </div>
            </header>

            {/* 두 사람의 프로필 & 사주 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {result.people.map((p, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col space-y-5 shadow-2xl relative overflow-hidden">

                        {/* 배경 빛 효과 */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

                        {/* 상단 프로필 영역 */}
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/50 flex-shrink-0">
                                {usersData[idx]?.faceImage ? (
                                    <img src={usersData[idx].faceImage} alt="face" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-900/50 flex items-center justify-center text-4xl">🧑‍🚀</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white mb-2">{p.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-black">
                                    <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">{usersData[idx]?.mbti || 'MBTI'}</span>
                                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">{usersData[idx]?.saju?.gender === 'MALE' ? '남성' : '여성'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-slate-300 leading-relaxed font-medium bg-black/20 p-4 rounded-xl flex-1">
                            {p.summary}
                        </div>

                        {/* 역할 영역 */}
                        <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-500 p-4 rounded-r-xl">
                            <h4 className="text-[10px] text-indigo-400 uppercase tracking-widest font-black mb-1">역할 및 포지션</h4>
                            <p className="text-sm text-indigo-100/90 font-medium">{p.roleInRelation}</p>
                        </div>

                        {/* 강/약점 뱃지 */}
                        <div className="flex gap-2">
                            <div className="flex-1 space-y-2">
                                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">강점</div>
                                <div className="space-y-1">
                                    {p.strengths.slice(0, 2).map((s, i) => <div key={i} className="text-xs text-slate-400">👍 {s}</div>)}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">단점</div>
                                <div className="space-y-1">
                                    {p.weaknesses.slice(0, 2).map((s, i) => <div key={i} className="text-xs text-slate-400">⚠️ {s}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 종합 시너지 뷰 */}
            <div className="bg-[#11111a] border border-indigo-500/20 shadow-2xl p-8 md:p-12 rounded-[2.5rem] grid grid-cols-1 lg:grid-cols-5 gap-12 items-center mx-4 relative overflow-hidden">
                {/* 배경 오로라 */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 pointer-events-none" />

                <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center space-y-8 relative z-10">
                    <div className="text-center space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">종합 시너지 스코어</h3>
                        <div className="text-7xl md:text-8xl font-black bg-gradient-to-br from-gold-400 via-yellow-300 to-amber-600 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                            {result.synergyScore}<span className="text-5xl">%</span>
                        </div>
                    </div>

                    {result.detailedScores && (
                        <div className="w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={
                                    result.mode === 'COMPAT_LOVE' ? [
                                        { subject: '소통(Comm)', A: result.detailedScores.communication },
                                        { subject: '신뢰(Trust)', A: result.detailedScores.trust },
                                        { subject: '문제해결', A: result.detailedScores.problemSolving },
                                        { subject: '안정감', A: result.detailedScores.overallStability },
                                        { subject: '애정(Love)', A: (result.detailedScores as any).affection || 85 },
                                    ] : [
                                        { subject: '재물(Wealth)', A: result.detailedScores.communication || 80 },
                                        { subject: '명예(Honor)', A: result.detailedScores.trust || 75 },
                                        { subject: '실행(Action)', A: result.detailedScores.problemSolving || 85 },
                                        { subject: '지혜(Wisdom)', A: result.detailedScores.overallStability || 70 },
                                        { subject: '비전(Vision)', A: (result.detailedScores as any).sharedVision || 90 },
                                        { subject: '인복(Team)', A: 85 },
                                    ]
                                }>
                                    <PolarGrid stroke="rgba(212,175,55,0.15)" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'black', letterSpacing: '0.1em' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="시너지" dataKey="A" stroke="#D4AF37" strokeWidth={2} fill="url(#synergyGradient)" fillOpacity={0.6} />
                                    <defs>
                                        <linearGradient id="synergyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#bf953f" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip contentStyle={{ backgroundColor: '#0c0c1e', borderColor: '#D4AF3733', borderRadius: '16px', color: '#fff' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="col-span-1 lg:col-span-3 space-y-6 relative z-10 w-full">
                    <div className="space-y-3">
                        <h4 className="text-sm font-black text-mystic-gold flex items-center gap-2 tracking-widest">
                            <span className="text-xl">✨</span> 운명의 방향성
                        </h4>
                        <div className="text-sm md:text-base text-slate-300 bg-black/30 border border-white/5 p-5 md:p-6 rounded-2xl leading-relaxed whitespace-pre-wrap">
                            <ReactMarkdown>{result.overallSummary}</ReactMarkdown>
                        </div>
                    </div>

                    {result?.businessAdvice && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2 tracking-widest">
                                <span className="text-xl">💼</span> 장점 & 단점 (Business Strategy)
                            </h4>
                            <div className="prose prose-invert max-w-none text-sm md:text-base text-slate-300 bg-emerald-900/10 border border-emerald-500/20 p-5 md:p-6 rounded-2xl leading-relaxed">
                                <ReactMarkdown>{result.businessAdvice}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {result?.loveAdvice && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-rose-400 flex items-center gap-2 tracking-widest">
                                <span className="text-xl">❤️</span> 보완 & 조심 (Love/Partner Advice)
                            </h4>
                            <div className="prose prose-invert max-w-none text-sm md:text-base text-slate-300 bg-rose-900/10 border border-rose-500/20 p-5 md:p-6 rounded-2xl leading-relaxed">
                                <ReactMarkdown>{result.loveAdvice}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {result?.worryResolution && (
                        <div className="space-y-4 pt-4 mt-4 relative z-10 w-full animate-slam">
                            <h4 className="text-xl md:text-2xl font-black text-yellow-500 flex items-center gap-3">
                                <span className="text-2xl">🔮</span> 마스터의 대안 (Alternative Solution)
                            </h4>
                            <div className="prose prose-invert prose-p:leading-relaxed prose-headings:text-mystic-gold prose-strong:text-yellow-300 max-w-none text-sm md:text-base text-amber-50 bg-gradient-to-br from-[#1a0a2e] via-[#2d1154] to-[#1a0a2e] border border-yellow-500/30 p-6 md:p-10 rounded-[2rem] shadow-[0_0_40px_rgba(234,179,8,0.15)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <ReactMarkdown>{result.worryResolution}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {(result as any)?.faceHarmonyAnalysis && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-blue-400 flex items-center justify-between gap-2 tracking-widest">
                                <div className="flex items-center gap-2"><span className="text-xl">🎭</span> 관상학적 조화도</div>
                                <div className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-xs font-black">{(result as any)?.faceHarmonyScore ?? 0} / 100 점</div>
                            </h4>
                            <div className="prose prose-invert max-w-none text-sm md:text-base text-slate-300 bg-blue-900/10 border border-blue-500/20 p-5 md:p-6 rounded-2xl leading-relaxed">
                                <ReactMarkdown>{(result as any).faceHarmonyAnalysis}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
