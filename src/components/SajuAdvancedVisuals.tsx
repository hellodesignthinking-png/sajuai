import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';
import { FateAnalysisResult } from '../types';

interface Props {
  saju: FateAnalysisResult['saju'];
}

export const SajuAdvancedVisuals: React.FC<Props> = ({ saju }) => {
  // If no advanced data exists yet, return null
  if (!saju.daewun && !saju.twelveLifeStages) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-mystic-gold/30 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-[200px]">
          <p className="text-white font-bold mb-1">{data.ageRange}세 대운 ({data.pillar})</p>
          <p className="text-mystic-gold text-sm font-bold mb-2">운기: {data.luckScore}점</p>
          <p className="text-xs text-slate-300 leading-relaxed">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 mt-10 border-t border-white/10 pt-10">
      
      {/* Daewun Timeline */}
      {saju.daewun && saju.daewun.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/20 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center border border-mystic-gold/20">
              <TrendingUp className="w-5 h-5 text-mystic-gold" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">대운(大運) 타임라인</h3>
              <p className="text-xs text-slate-400 mt-1">10년 주기로 변하는 평생의 운 흐름</p>
            </div>
          </div>
          
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={saju.daewun} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLuck" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="ageRange" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="luckScore" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorLuck)" 
                  activeDot={{ r: 6, fill: "#eab308", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Daewun Keywords */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {saju.daewun.map((d: any, i: number) => (
              <div key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex flex-col items-center">
                <span className="text-[10px] text-slate-400">{d.ageRange}세</span>
                <span className="text-xs font-bold text-white">{d.keyword}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 12 Life Stages Diagram */}
      {saju.twelveLifeStages && saju.twelveLifeStages.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-black/20 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">십이운성 에너지 흐름</h3>
              <p className="text-xs text-slate-400 mt-1">인생 단계별 잠재적 에너지 파워</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-48 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={saju.twelveLifeStages}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stageName" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="에너지" dataKey="powerScore" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full md:w-1/2 space-y-4">
              {saju.twelveLifeStages.map((stage: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-indigo-300">{stage.stageName}</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-full">{stage.powerScore} Power</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};
