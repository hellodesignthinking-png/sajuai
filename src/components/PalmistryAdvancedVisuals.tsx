import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Activity, TrendingUp, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FateAnalysisResult } from '../types';

interface Props {
  palmistry: FateAnalysisResult['palmistry'];
  palmImage?: string;
  gender?: 'MALE' | 'FEMALE';
}

export const PalmistryAdvancedVisuals: React.FC<Props> = ({ palmistry, palmImage, gender }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-purple-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white font-bold mb-2 text-xs">{label} 에너지</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="palmistry" className="animate-slam glass-panel p-6 md:p-12 shadow-2xl relative scroll-mt-32 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
      
      <div className="flex items-center gap-4 mb-8 md:mb-12 relative z-10">
        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <Fingerprint className="w-7 h-7 text-purple-400" />
        </div>
        <div>
          <h2 className="display text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">하이브리드 손금 분석</h2>
          <p className="serif text-slate-400 text-sm md:text-base font-light tracking-wide flex items-center gap-2">
            사주와 손금 선의 에너지가 결합된 리포트 <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] uppercase font-black tracking-widest border border-purple-500/30">V3 Biorhythm</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative z-10">
        {/* Left: Palm UI & Scores */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 group">
            {palmImage ? (
              <img src={palmImage} className="w-full h-full object-cover opacity-60" alt="Palm Scanned" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                <Fingerprint className="w-16 h-16 text-purple-500/30 mb-4" />
                <span className="text-purple-500/50 text-xs font-bold uppercase tracking-widest">
                  {gender === 'FEMALE' ? '오른손(Right Hand)' : '왼손(Left Hand)'} AI 추론 모델
                </span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* V3 Palm Line SVG Highlighting */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-700" viewBox="0 0 100 100">
              <motion.path d={gender === 'FEMALE' ? "M65,35 Q55,65 45,85" : "M35,35 Q45,65 55,85"} stroke="#34d399" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} />
              <motion.path d={gender === 'FEMALE' ? "M65,45 Q35,55 15,50" : "M35,45 Q65,55 85,50"} stroke="#60a5fa" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }} />
              <motion.path d={gender === 'FEMALE' ? "M65,30 Q35,25 15,35" : "M35,30 Q65,25 85,35"} stroke="#f472b6" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }} />
              <motion.path d="M50,85 L50,15" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeDasharray="2,2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }} />
            </svg>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2">
                <div className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-bold text-emerald-300">생명: {palmistry.scores.life}</div>
                <div className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-[9px] font-bold text-blue-300">두뇌: {palmistry.scores.head}</div>
                <div className="px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 text-[9px] font-bold text-pink-300">감정: {palmistry.scores.heart}</div>
                <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-300">운명: {palmistry.scores.fate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Biorhythm Chart & Analysis */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-8">
          
          {/* V3: Hybrid Biorhythm Chart */}
          {palmistry.hybridBiorhythm && palmistry.hybridBiorhythm.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">퓨전 바이오리듬 (사주 × 손금)</h3>
              </div>
              <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/20 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={palmistry.hybridBiorhythm} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEmo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="vitality" name="생명력/에너지" stroke="#10b981" fillOpacity={1} fill="url(#colorVit)" />
                    <Area type="monotone" dataKey="intellect" name="결단력/두뇌" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInt)" />
                    <Area type="monotone" dataKey="emotion" name="정서/감정" stroke="#f43f5e" fillOpacity={1} fill="url(#colorEmo)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Palm Lines Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-slate-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">주요 선(Line) 심층 해석</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group">
                <div className="text-[10px] uppercase font-black tracking-widest text-emerald-400/80 mb-1.5 flex items-center justify-between">
                  생명선 (Vitality) <span className="text-emerald-500">{palmistry.scores.life}</span>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed"><ReactMarkdown>{palmistry.lifeLine}</ReactMarkdown></div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group">
                <div className="text-[10px] uppercase font-black tracking-widest text-blue-400/80 mb-1.5 flex items-center justify-between">
                  두뇌선 (Intellect) <span className="text-blue-500">{palmistry.scores.head}</span>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed"><ReactMarkdown>{palmistry.headLine}</ReactMarkdown></div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group">
                <div className="text-[10px] uppercase font-black tracking-widest text-pink-400/80 mb-1.5 flex items-center justify-between">
                  감정선 (Emotion) <span className="text-pink-500">{palmistry.scores.heart}</span>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed"><ReactMarkdown>{palmistry.heartLine}</ReactMarkdown></div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group">
                <div className="text-[10px] uppercase font-black tracking-widest text-amber-400/80 mb-1.5 flex items-center justify-between">
                  운명선 (Fate) <span className="text-amber-500">{palmistry.scores.fate}</span>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed"><ReactMarkdown>{palmistry.fateLine}</ReactMarkdown></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
