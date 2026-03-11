import React from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Maximize, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FateAnalysisResult } from '../types';

interface Props {
  physiognomy: FateAnalysisResult['physiognomy'];
  faceImage?: string;
}

export const PhysiognomyAdvancedVisuals: React.FC<Props> = ({ physiognomy, faceImage }) => {
  return (
    <div id="physiognomy" className="animate-slam glass-panel p-6 md:p-12 shadow-2xl relative scroll-mt-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex items-center gap-4 mb-8 md:mb-12 relative z-10">
        <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Search className="w-7 h-7 text-cyan-400" />
        </div>
        <div>
          <h2 className="display text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">하이브리드 관상 분석</h2>
          <p className="serif text-slate-400 text-sm md:text-base font-light tracking-wide flex items-center gap-2">
            얼굴에 깃든 카르마와 황금비율 <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-black tracking-widest border border-cyan-500/30">V3 Scan</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative z-10">
        {/* Left: AR Overlay / Image Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 group">
            {faceImage ? (
              <img src={faceImage} className="w-full h-full object-cover opacity-60" alt="Face Scanned" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                <Search className="w-16 h-16 text-cyan-500/30" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* V3 Golden Ratio AR SVG Overlay */}
            {physiognomy.goldenRatio && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-700" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                
                {/* 1:1.618 Golden Ratio Box Lines */}
                <motion.rect x="15" y="15" width="70" height="70" stroke="url(#neonGradient)" strokeWidth="0.3" fill="none" strokeDasharray="2,2" 
                  initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                <motion.line x1="15" y1="40" x2="85" y2="40" stroke="cyan" strokeWidth="0.5" opacity="0.5" />
                <motion.line x1="15" y1="70" x2="85" y2="70" stroke="cyan" strokeWidth="0.5" opacity="0.5" />
                <motion.line x1="35" y1="15" x2="35" y2="85" stroke="cyan" strokeWidth="0.5" opacity="0.5" />
                <motion.line x1="65" y1="15" x2="65" y2="85" stroke="cyan" strokeWidth="0.5" opacity="0.5" />
                
                {/* Asymmetry Map Points */}
                <circle cx="35" cy="40" r="1.5" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="65" cy="40" r="1.5" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
                <circle cx="50" cy="70" r="1.5" fill="#818cf8" className="animate-pulse" />
                
                {/* Connections */}
                <path d="M35,40 L50,70 L65,40" stroke="url(#neonGradient)" strokeWidth="0.5" fill="none" opacity="0.6" />
                
                {/* Golden Ratio Text */}
                <text x="50" y="55" fontSize="3" fill="#22d3ee" textAnchor="middle" opacity="0.8" fontWeight="bold">1 : 1.618</text>
              </svg>
            )}

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Golden Ratio Score</div>
                  <div className="text-4xl font-black text-white">{physiognomy.goldenRatio?.ratioScore || physiognomy.score}<span className="text-lg text-cyan-500/50">/100</span></div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-100 font-bold backdrop-blur-md">
                  V3 AR Scanned
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Analysis & Karma */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
          
          {/* Karma / Micro-expressions (V3) */}
          {physiognomy.karmaAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">카르마 & 미세표정 도해</h3>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/20">
                <p className="text-sm text-indigo-100/80 leading-relaxed"><ReactMarkdown>{physiognomy.karmaAnalysis}</ReactMarkdown></p>
                {physiognomy.goldenRatio?.asymmetryDetails && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3">
                    <Maximize className="w-4 h-4 text-cyan-500 mt-1 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-cyan-500/70 mb-1">Asymmetry Insight</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{physiognomy.goldenRatio.asymmetryDetails}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facial Features Breakdown */}
          {physiognomy.facialFeatures && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-slate-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">부위별 운명 특징</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(physiognomy.facialFeatures).map(([key, value]) => {
                  if (!value) return null;
                  const labels: Record<string, string> = { forehead: '이마 (관록/부모)', eyes: '눈 (정신/성품)', nose: '코 (재물/자아)', mouth: '입 (의지/말년)', jaw: '턱 (인복/결단)' };
                  return (
                    <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors group">
                      <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 group-hover:text-cyan-400/70 mb-1.5 transition-colors">
                        {labels[key] || key}
                      </div>
                      <div className="text-sm font-medium text-slate-200">
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Traits Tags */}
          {physiognomy.traits && physiognomy.traits.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {physiognomy.traits.map((trait, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                  #{trait}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
