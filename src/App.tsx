import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import SanctuaryIntro from './components/SanctuaryIntro';
import CosmicHero from './components/CosmicHero';
import GlobalResonance from './components/GlobalResonance';
import AetherTrail from './components/AetherTrail';
import GoldLeafTitle from './components/GoldLeafTitle';
import facePointsData from './facePoints.json';
import { physiognomyToMeasures, calcAllSyncs, calcSync, STAR_WEIGHTS, PALACE_STAR } from './utils/starSyncEngine';
import {
  Briefcase,
  Sparkles,
  Calendar,
  User,
  Camera,
  Fingerprint,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Star,
  TrendingUp,
  Activity,
  Award,
  Heart,
  Info,
  RefreshCw,
  Download,
  Share2,
  BookOpen,
  Search,
  Film,
  Quote,
  Leaf,
  Flame,
  Mountain,
  Coins,
  Droplets,
  Clock,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  List,
  Check,
  Plus,
  Volume2
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { FateStep, UserFateData, SajuData, MBTIType, FateAnalysisResult } from './types';
import { MBTI_LIST } from './constants';
import { analyzeFate, analyzeCompatibility } from './services/fateService';
import { detectFaceLandmarks, detectPalmLandmarks, FaceLandmarkData, PalmLandmarkData } from './services/mediapipeAnalysis';
import { generateTarotCard, downloadTarotCard, generateAiTarotImage } from './services/characterGen';
import { addHanjaReading, formatPillars } from './utils/hanjaUtils';
import { getLuckyByMode } from './utils/luckyElements';

import { SynergyDashboard } from './components/SynergyDashboard';
import useAudioAtmosphere from './hooks/useAudioAtmosphere';
import ShareCardGenerator from './components/ShareCardGenerator';
import ThesisFootnotes from './components/ThesisFootnotes';
import { DestinyMatching } from './components/DestinyMatching';
import { AetherScript } from './components/AetherScript';

// Lazy-loaded heavy report components
const OracleMessenger = React.lazy(() => import('./components/OracleMessenger'));
const ElementFlowDiagram = React.lazy(() => import('./components/ElementFlowDiagram'));
const DestinyRoadmap = React.lazy(() => import('./components/DestinyRoadmap'));
const CelestialBackground = React.lazy(() => import('./components/CelestialBackground'));
const OracleChat = React.lazy(() => import('./components/OracleChat'));
const FateCalendar = React.lazy(() => import('./components/FateCalendar'));
const OracleTranscript = React.lazy(() => import('./components/OracleTranscript'));
const CinematicLoading = React.lazy(() => import('./components/CinematicLoading'));
const FinalFarewell = React.lazy(() => import('./components/FinalFarewell'));
const SmartCameraGuide = React.lazy(() => import('./components/SmartCameraGuide'));
const DestinyKeywordSection = React.lazy(() =>
  import('./components/DestinyKeywords').then(m => ({ default: m.DestinyKeywordSection }))
);
const OracleGuestbook = React.lazy(() => import('./components/OracleGuestbook'));
const DestinyReceipt = React.lazy(() => import('./components/DestinyReceipt'));
const GrandOracleCategory = React.lazy(() => import('./components/GrandOracleCategory'));
const JamiFaceMesh = React.lazy(() => import('./components/JamiFaceMesh'));
const StarSoulArchive = React.lazy(() => import('./components/StarSoulArchive'));
const GoldenMandala = React.lazy(() => import('./components/GoldenMandala'));
const SoulSyncEquation = React.lazy(() => import('./components/SoulSyncEquation'));
const DestinyFlex = React.lazy(() => import('./components/DestinyFlex'));
const AetherKeyCard = React.lazy(() => import('./components/AetherKeyCard'));

// Window type declarations removed - using .env for API key management

// --- V49: High-End Refinement Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setTrail(prev => [{ x: e.clientX, y: e.clientY, id: Date.now() }, ...prev.slice(0, 8)]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-mystic-gold mix-blend-difference pointer-events-none z-[9999]"
        animate={{ x: position.x - 8, y: position.y - 8, scale: 1.5 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.5 }}
      />
      <AnimatePresence>
        {trail.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            className="star-dust"
            style={{ left: t.x, top: t.y }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

const AetherSphere = () => {
  const sphereRef = useRef<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.002;
      sphereRef.current.rotation.x += 0.001;

      sphereRef.current.position.x += (mousePos.x * 0.5 - sphereRef.current.position.x) * 0.05;
      sphereRef.current.position.y += (-mousePos.y * 0.5 - sphereRef.current.position.y) * 0.05;
    }
  });

  return (
    <mesh ref={sphereRef} scale={2.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#D4AF37"
        metalness={0.9}
        roughness={0.1}
        wireframe
        transparent
        opacity={0.15}
      />
      <pointLight position={[2, 2, 2]} intensity={2} color="#D4AF37" />
      <pointLight position={[-2, -2, -2]} intensity={1} color="#4f46e5" />
    </mesh>
  );
};

const SocialProofTicker = () => {
  const archetypes = ['The Emperor', 'The Star', 'The Magician', 'The Lovers', 'The High Priestess', 'The Hierophant'];
  const locations = ['강남구', 'NY City', 'Tokyo', 'Paris', '서초구', 'London'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % archetypes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/60 backdrop-blur-md border-t border-mystic-gold/20 py-1.5 z-40 overflow-hidden">
      <motion.div
        key={current}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="flex items-center justify-center gap-3"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          {locations[current]}에서 <span className="text-mystic-gold">'{archetypes[current]}'</span> 격을 가진 유저가 에테르 키를 획득했습니다.
        </p>
        <span className="text-[8px] text-slate-600 font-bold ml-2">{Math.floor(Math.random() * 59) + 1}분 전</span>
      </motion.div>
    </div>
  );
};

// --- Original Sub-components ---

const Navbar = ({ onHome, onLogin, isLoggedIn, step }: { onHome: () => void, onLogin: () => void, isLoggedIn: boolean, step: string }) => {



  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-4 border-white/5 shadow-2xl shadow-black/50">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onHome}
        >
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-mystic-accent transition-all duration-500">
            <Sparkles className="w-5 h-5 text-mystic-accent group-hover:text-white transition-colors" />
          </div>
          <span className="display text-xl tracking-tight text-white">Fate-Sync AI</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {['Home', 'About'].map((item) => (
            <button
              key={item}
              onClick={item === 'Home' ? onHome : undefined}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-mystic-accent ${(item === 'Home' && step === 'LANDING') ? 'text-mystic-accent' : 'text-slate-500'
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button
              onClick={onLogin}
              className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-mystic-accent hover:text-white transition-all shadow-xl shadow-white/5"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 group cursor-pointer hover:bg-white/10 transition-all relative">
              <div className="w-6 h-6 bg-mystic-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">My Destiny</span>
              {step === 'REPORT' && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3.5 h-3.5 bg-mystic-gold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.8)] border border-black/20">
                    <svg width="6" height="6" viewBox="0 0 10 10" fill="none">
                      <polyline points="2,5 4,7 8,3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-mystic-accent" />
            <span className="serif text-2xl font-bold text-white">Expert Saju AI</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            명리학 전문가 수준의 사주, 관상, 손금 통합 분석 서비스. <br />
            당신의 운명에 담긴 우주의 기운을 과학적으로 분석합니다.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-medium">
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">Saju Analysis</li>
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">Physiognomy</li>
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">Palmistry</li>
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">MBTI Synergy</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-medium">
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">About Us</li>
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">Terms of Service</li>
            <li className="hover:text-mystic-accent cursor-pointer transition-colors">Contact</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</h4>
          <p className="text-xs text-slate-500 font-medium">support@expertsaju.ai</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-mystic-accent transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-mystic-accent transition-colors cursor-pointer">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">© 2026 Expert Saju AI. All rights reserved.</p>
        <div className="flex gap-6 text-[10px] text-slate-600 font-black uppercase tracking-widest">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
        </div>
      </div>
    </footer>
  );
};

const FiveElementsChart = ({ data }: { data: any }) => {
  const chartData = [
    { subject: '목(木)', A: data.wood, fullMark: 5, color: '#10b981' },
    { subject: '화(火)', A: data.fire, fullMark: 5, color: '#f43f5e' },
    { subject: '토(土)', A: data.earth, fullMark: 5, color: '#f59e0b' },
    { subject: '금(金)', A: data.metal, fullMark: 5, color: '#94a3b8' },
    { subject: '수(水)', A: data.water, fullMark: 5, color: '#3b82f6' },
  ];

  return (
    <div className="relative w-full h-[350px] min-h-[350px] group">
      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#ffffff10" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
          <Radar
            name="오행 분포"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.5}
            strokeWidth={3}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: item.color }}>{item.subject}</div>
                    <div className="text-lg font-black text-white">{item.A} <span className="text-[10px] text-slate-500">개</span></div>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DetailedElementAnalysis = ({ analysis, counts }: { analysis: any, counts: any }) => {
  const elements = [
    { id: 'wood', label: '목(木)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Leaf, count: counts.wood },
    { id: 'fire', label: '화(火)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Flame, count: counts.fire },
    { id: 'earth', label: '토(土)', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Mountain, count: counts.earth },
    { id: 'metal', label: '금(金)', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Coins, count: counts.metal },
    { id: 'water', label: '수(水)', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Droplets, count: counts.water },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {elements.map((el) => {
        const Icon = el.icon;
        return (
          <div key={el.id} className={`p-4 rounded-2xl ${el.bg} border ${el.border} flex gap-4 items-start group hover:scale-[1.02] transition-all duration-300`}>
            <div className={`p-2.5 rounded-xl ${el.bg} ${el.color} border ${el.border} group-hover:rotate-12 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className={`text-sm font-black ${el.color}`}>{el.label}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{el.count}개 보유</div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {analysis[el.id]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PhysiognomyScoresChart = ({ data }: { data: any }) => {
  const chartData = [
    { name: '이마', score: data.forehead },
    { name: '눈', score: data.eyes },
    { name: '코', score: data.nose },
    { name: '입', score: data.mouth },
    { name: '턱', score: data.chin },
  ];

  return (
    <div className="relative w-full h-[250px] min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={40} />
          <Tooltip
            cursor={{ fill: '#ffffff05' }}
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][index % 5]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const FortuneTimelineChart = ({ data }: { data: any[] }) => {
  const getFortuneLevel = (score: number) => {
    if (score >= 85) return { label: '대길 (Great Luck)', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    if (score >= 70) return { label: '길 (Good Luck)', color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/30' };
    if (score >= 50) return { label: '평범 (Average)', color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' };
    return { label: '주의 (Caution)', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const level = getFortuneLevel(item.score);
      return (
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-2xl min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label} 운세 리포트</div>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${level.bg} ${level.color} border ${level.border}`}>
              {level.label.split(' ')[0]}
            </div>
          </div>

          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-black text-white tracking-tighter">{item.score}</span>
            <span className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Points</span>
          </div>

          {item.keyword && (
            <div className="space-y-2">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">핵심 키워드</div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-2xl border border-white/10 group">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-amber-100">{item.keyword}</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">운세 등급</div>
            <div className={`text-xs font-bold ${level.color}`}>{level.label}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const level = getFortuneLevel(payload.score);
    let dotColor = '#6366f1'; // Default indigo
    if (payload.score >= 85) dotColor = '#10b981'; // Emerald
    if (payload.score < 50) dotColor = '#f43f5e'; // Rose

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={dotColor}
        stroke="#fff"
        strokeWidth={2}
        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
      />
    );
  };

  return (
    <div className="relative w-full h-[320px] min-h-[320px] mt-8 group/chart">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[2rem] pointer-events-none" />
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="fortuneGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }}
            axisLine={false}
            tickLine={false}
            dy={15}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 2, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="url(#strokeGradient)"
            fillOpacity={1}
            fill="url(#fortuneGradient)"
            strokeWidth={5}
            animationDuration={2500}
            dot={renderCustomDot}
            activeDot={{ r: 8, fill: '#fff', strokeWidth: 3, stroke: '#6366f1', className: 'animate-pulse' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StepIndicator = ({ currentStep }: { currentStep: FateStep }) => {
  const steps: { id: FateStep; label: string; icon: any; optional?: boolean }[] = [
    { id: 'SAJU', label: '사주', icon: Calendar },
    { id: 'FACE', label: '관상', icon: User, optional: true },
    { id: 'MBTI', label: '성향', icon: BrainCircuit },
    { id: 'PALM', label: '손금', icon: Fingerprint, optional: true },
  ];

  return (
    <div className="flex justify-between w-full max-w-md mx-auto mb-12">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const isActive = currentStep === s.id;
        const isPast = steps.findIndex(step => step.id === currentStep) > idx;

        return (
          <div key={s.id} className="flex flex-col items-center gap-2 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-600 text-white shadow-lg scale-110' :
              isPast ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
              {isPast ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
              {s.label} {s.optional && <span className="opacity-50 text-[8px]">(선택)</span>}
            </span>
            {idx < steps.length - 1 && (
              <div className="absolute top-5 left-12 w-16 h-[2px] bg-slate-100 -z-10" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Scan ring that pulses outward around the face mesh
const ScanPulseRing = ({ radius, delay }: { radius: number; delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = (clock.getElapsedTime() + delay) % 3;
    const s = 1 + t * 0.4;
    meshRef.current.scale.setScalar(s);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - t * 0.18);
  });
  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[radius - 0.02, radius, 64]} />
      <meshBasicMaterial color="#D4AF37" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
};

const InteractiveFaceMesh = ({ faceLandmarks }: { faceLandmarks?: any }) => {
  const pointsRef = useRef<any>(null);
  const innerRef = useRef<any>(null);

  const { positions, targetPositions, numPoints } = useMemo(() => {
    // 478 points extracted realistically using MediaPipe FaceLandmarker
    const pts = facePointsData as number[];
    const count = pts.length / 3;
    const pos = new Float32Array(pts.length);
    const target = new Float32Array(pts);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    return { positions: pos, targetPositions: target, numPoints: count };
  }, []);

  // Secondary smaller point layer for inner detail
  const innerPositions = useMemo(() => {
    const pts = facePointsData as number[];
    const count = Math.floor(pts.length / 3 / 2);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = pts[i * 6] * 0.7;
      pos[i * 3 + 1] = pts[i * 6 + 1] * 0.7;
      pos[i * 3 + 2] = pts[i * 6 + 2] * 0.7;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current?.geometry) {
      pointsRef.current.rotation.y += delta * 0.25;
      if (innerRef.current) innerRef.current.rotation.y -= delta * 0.15;

      const posAttribute = pointsRef.current.geometry.attributes.position;
      const array = posAttribute.array;
      let isAnimating = false;
      for (let i = 0; i < array.length; i++) {
        const diff = targetPositions[i] - array[i];
        if (Math.abs(diff) > 0.001) {
          array[i] += diff * delta * 2;
          isAnimating = true;
        }
      }
      if (isAnimating) {
        posAttribute.needsUpdate = true;
        pointsRef.current.geometry.computeBoundingSphere();
      }
    }
  });

  return (
    <group>
      {/* Outer gold point cloud */}
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#D4AF37" size={0.07} sizeAttenuation transparent opacity={0.85}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Inner cyan accent layer */}
      <points ref={innerRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[innerPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#22d3ee" size={0.04} sizeAttenuation transparent opacity={0.5}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Pulsing scan rings */}
      <ScanPulseRing radius={2.4} delay={0} />
      <ScanPulseRing radius={2.4} delay={1} />
      <ScanPulseRing radius={2.4} delay={2} />
    </group>
  );
};


const PalmScanSVG = () => (
  <svg width="400" height="400" viewBox="0 0 400 400" className="opacity-80 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
    <motion.path
      d="M100,300 C100,200 120,100 200,80 C280,100 300,200 300,300"
      stroke="#a855f7" strokeWidth="2" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path
      d="M150,280 C150,220 170,180 250,160"
      stroke="#ec4899" strokeWidth="2" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
    />
    <motion.path
      d="M120,250 C140,200 200,220 280,240"
      stroke="#3b82f6" strokeWidth="2" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    />
    {/* Scanning line */}
    <motion.rect
      x="50" y="50" width="300" height="2"
      fill="rgba(168,85,247,0.5)"
      animate={{ y: [80, 320, 80] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  </svg>
);

// ── Dual Tarot Preview: front card (back-design) + back card (front-design) ──

const DualTarotPreview = () => {
  const TAROT_DATA = [
    {
      label: 'FATE-SYNC\nETERNAL DECK',
      sublabel: '카드 뒷면',
      numeral: '✦',
      title: '비전의 외피',
      desc: '운명은 아직 봉인되어 있습니다',
      isFront: false,
      floatDelay: 0,
    },
    {
      label: 'THE MAGICIAN',
      sublabel: '카드 앞면',
      numeral: 'I',
      title: '마법사',
      desc: '\"무한한 창조적 마법. 모든\n요소가 당신의 손끝에.\"',
      isFront: true,
      floatDelay: 0.6,
    },
  ];

  return (
    <div className="flex gap-6 items-end justify-center w-full">
      {TAROT_DATA.map((card, ci) => (
        <motion.div
          key={ci}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5 + ci * 0.5, repeat: Infinity, ease: 'easeInOut', delay: card.floatDelay }}
          className="relative flex-shrink-0"
          style={{
            width: ci === 1 ? '130px' : '110px',
            height: ci === 1 ? '200px' : '170px',
            filter: ci === 0 ? 'brightness(0.75)' : 'none',
            zIndex: ci === 1 ? 10 : 1,
          }}
        >
          {/* Card body */}
          <div
            className="absolute inset-0 rounded-xl flex flex-col overflow-hidden"
            style={{
              background: card.isFront
                ? 'linear-gradient(180deg, #1a0a2e 0%, #0c0518 100%)'
                : 'linear-gradient(160deg, #0d0b1a 0%, #0a0810 100%)',
              border: `1.5px solid ${card.isFront ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.3)'}`,
              boxShadow: card.isFront
                ? '0 0 40px rgba(212,175,55,0.25), 0 20px 60px rgba(0,0,0,0.8)'
                : '0 8px 30px rgba(0,0,0,0.6)',
            }}
          >
            {/* Inner border */}
            <div className="absolute inset-[4px] rounded-lg pointer-events-none"
              style={{ border: '1px solid rgba(212,175,55,0.15)' }} />

            {/* Pattern / content */}
            {card.isFront ? (
              <>
                {/* Top header */}
                <div className="flex-shrink-0 px-3 pt-3 flex items-center justify-between">
                  <span className="text-[7px] font-black tracking-[0.3em] uppercase"
                    style={{ color: 'rgba(212,175,55,0.7)' }}>{card.label}</span>
                  <span className="text-sm font-serif font-bold"
                    style={{ color: 'rgba(212,175,55,0.9)' }}>{card.numeral}</span>
                </div>
                {/* Centre illustration placeholder */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: '#D4AF37' }} />
                  </div>
                  {/* Stardust pattern */}
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute w-0.5 h-0.5 rounded-full"
                      style={{
                        background: '#D4AF37',
                        top: `${20 + Math.sin(i / 6 * Math.PI * 2) * 35}%`,
                        left: `${50 + Math.cos(i / 6 * Math.PI * 2) * 35}%`,
                        opacity: 0.4,
                      }} />
                  ))}
                </div>
                {/* Bottom text */}
                <div className="flex-shrink-0 px-3 pb-3 text-center">
                  <div className="rounded-md py-1.5 px-2"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    <div className="text-[7px] font-serif font-bold mb-0.5" style={{ color: 'rgba(212,175,55,0.9)' }}>{card.title}</div>
                    <div className="text-[6px] leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.desc}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[url('/image_1.png')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <p className="text-[6px] font-black tracking-[0.25em] uppercase text-white/50 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {card.label}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Label tag */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[8px] font-black tracking-[0.25em] uppercase"
              style={{ color: 'rgba(212,175,55,0.35)' }}>{card.sublabel}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ModeTarotCard = ({ title, eng, desc, icon, numeral, accentFrom, accentTo, onStart, mode, keywords, triggerHaptic }: any) => {
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const isFlipped = hovered || touched;
  const lucky = getLuckyByMode(mode);

  const modeImg = ({
    'personal': '/mode_personal.png',
    'synergy': '/mode_synergy.png',
    'business': '/mode_business.png'
  } as any)[mode] || '/image_1.png';

  // 오행별 테두리 글로우 색상
  const glowColor = lucky.colorHex;
  const glowAlpha = isFlipped ? '0.35' : '0.12';

  return (
    <div
      className="w-full cursor-pointer"
      style={{ perspective: '1200px', height: '520px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setTouched(t => !t)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.75, type: 'spring', stiffness: 80, damping: 14 }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >

        // ── 애니메이션 & 테마 설정 ───────────────────────────────────────────────────
        {/* ── Front face ── */}
        <div
          className="absolute inset-0 rounded-[2rem] overflow-hidden flex flex-col items-center justify-between py-8"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg, #0d0d1a 0%, #080810 100%)',
            border: '1.5px solid rgba(212,175,55,0.3)',
            boxShadow: '0 0 40px rgba(212,175,55,0.06), inset 0 0 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* Mode Background Image */}
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-cover bg-center"
            style={{ backgroundImage: `url(${modeImg})` }} />

          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a]/80 via-transparent to-[#080810]" />

          {/* Numeral */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <span className="text-xs font-black tracking-[0.5em] uppercase" style={{ color: 'rgba(212,175,55,0.4)' }}>
              ✦ Oracle ✦
            </span>
            <span className="text-4xl font-serif font-bold" style={{ color: 'rgba(212,175,55,0.7)' }}>{numeral}</span>
          </div>

          {/* Icon orb */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            <motion.div
              className="w-28 h-28 rounded-full flex items-center justify-center relative"
              style={{ border: `1px solid ${glowColor}50`, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', boxShadow: isFlipped ? `0 0 30px ${glowColor}40` : 'none' }}
              whileHover={{ z: 50, scale: 1.1 }}
            >
              <div className="absolute inset-[-8px] rounded-full opacity-30 animate-spin"
                style={{ border: `1px solid ${glowColor}30`, animationDuration: '12s' }} />
              <div style={{ color: glowColor }}>{icon}</div>
            </motion.div>
            <div className="text-center px-4">
              <div className="text-[9px] font-black tracking-[0.35em] uppercase mb-1 px-3 py-1 rounded border inline-block"
                style={{ color: `${glowColor}cc`, borderColor: `${glowColor}30` }}>{eng}</div>
              <h3 className="text-2xl font-serif font-bold text-white mt-2 group-hover:text-mystic-gold transition-colors">{title}</h3>
            </div>
          </div>

          {/* Bottom ornament */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-px" style={{ background: 'rgba(212,175,55,0.25)' }} />
            <span className="text-[10px] tracking-widest" style={{ color: 'rgba(212,175,55,0.3)' }}>✦</span>
            <div className="w-12 h-px" style={{ background: 'rgba(212,175,55,0.25)' }} />
          </div>
        </div>

        {/* ── Back face: 퍼스널 운명 대시보드 ── */}
        <div
          className="absolute inset-0 rounded-[2rem] flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(160deg, #0c0c20 0%, #060610 100%)',
            border: `1.5px solid ${glowColor}88`,
            boxShadow: `0 0 60px ${glowColor}${glowAlpha.replace('0.', '')}, inset 0 0 80px rgba(0,0,0,0.6)`,
            transition: 'box-shadow 0.4s',
          }}
        >
          {/* 오행 배경 그라디언트 */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 10%, ${glowColor}18, transparent 65%)` }} />

          {/* 상단: 아이콘 + 제목 */}
          <div className="relative z-10 flex items-center gap-3 px-7 pt-6 pb-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${glowColor}18`, border: `1px solid ${glowColor}50` }}>
              <div style={{ color: glowColor, transform: 'scale(0.78)' }}>{icon}</div>
            </div>
            <div>
              <div className="text-[8px] font-black tracking-[0.4em] uppercase" style={{ color: `${glowColor}80` }}>{eng}</div>
              <h3 className="text-base font-serif font-bold text-white leading-tight">{title}</h3>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[8px] font-black tracking-widest" style={{ color: `${glowColor}60` }}>ELEMENT</div>
              <div className="text-sm font-black" style={{ color: glowColor }}>{lucky.elementEn}</div>
            </div>
          </div>

          {/* ── Lucky Orbit: 행운의 좌표 ── */}
          <div className="relative z-10 mx-5 mt-4 rounded-2xl px-4 py-3 flex justify-around items-center"
            style={{
              background: `${glowColor}0d`,
              border: `1px solid ${glowColor}25`,
            }}>
            {/* 행운 숫자 */}
            <div className="text-center">
              <div className="text-[7px] font-black tracking-[0.35em] uppercase mb-1"
                style={{ color: `${glowColor}60` }}>Lucky Numbers</div>
              <div className="flex items-center gap-2">
                {lucky.numbers.map((n: number) => (
                  <motion.div key={n}
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base font-serif"
                    style={{ background: `${glowColor}15`, border: `1px solid ${glowColor}40`, color: glowColor }}
                    animate={{ boxShadow: [`0 0 0px ${glowColor}00`, `0 0 10px ${glowColor}60`, `0 0 0px ${glowColor}00`] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: n * 0.3 }}
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-px h-10 self-center" style={{ background: `${glowColor}20` }} />

            {/* 행운 색상 */}
            <div className="text-center">
              <div className="text-[7px] font-black tracking-[0.35em] uppercase mb-1"
                style={{ color: `${glowColor}60` }}>Lucky Color</div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ background: lucky.colorHex }}
                  animate={{ boxShadow: [`0 0 4px ${lucky.colorHex}60`, `0 0 14px ${lucky.colorHex}cc`, `0 0 4px ${lucky.colorHex}60`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="text-left">
                  <div className="text-[9px] font-black leading-none text-white">{lucky.colorName}</div>
                  <div className="text-[7px] mt-0.5" style={{ color: `${glowColor}70` }}>{lucky.colorKo}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 트라이어드 키워드 (선택 미리보기) ── */}
          <div className="relative z-10 px-5 mt-3">
            <div className="text-[7px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: `${glowColor}50` }}>✦ Triad of Fate</div>
            <div className="flex flex-wrap gap-1.5">
              {(keywords || ['운명의 인장', '성소의 수호자', '시간의 설계자']).map((kw: string, i: number) => (
                <motion.span
                  key={kw}
                  className="px-2.5 py-1 rounded-full text-[9px] font-black"
                  style={{
                    background: `${glowColor}12`,
                    border: `1px solid ${glowColor}${i === 0 ? '60' : '28'}`,
                    color: i === 0 ? glowColor : `${glowColor}80`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                >
                  #{kw}
                </motion.span>
              ))}
            </div>
          </div>

          {/* ── 오늘의 조언 ── */}
          <div className="relative z-10 px-5 mt-3">
            <p className="text-[10px] text-slate-400 leading-relaxed font-light">
              <span className="font-black" style={{ color: `${glowColor}90` }}>오늘의 조언 — </span>
              {lucky.dayAdvice}
            </p>
          </div>

          {/* ── 시작 버튼 ── */}
          <div className="relative z-10 mt-auto px-5 pb-6 pt-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onStart(mode);
                if (typeof triggerHaptic === 'function') triggerHaptic(10);
              }}
              className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 group"
              style={{
                background: `linear-gradient(135deg, ${glowColor}cc, ${glowColor})`,
                color: '#030305',
                boxShadow: `0 0 24px ${glowColor}50`,
              }}
            >
              운명 동기화 시작
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >→</motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface MainHomeProps {
  onStart: (mode: 'personal' | 'synergy' | 'business') => void;
  onDrawTarot: () => void;
  tarotCard: { name: string; image: string; meaning: string } | null;
  isTarotLoading: boolean;
  triggerHaptic: (pattern?: number | number[]) => void;
}

const MainHome: React.FC<MainHomeProps> = ({ onStart, onDrawTarot, tarotCard, isTarotLoading, triggerHaptic }) => {
  const [handleMouseMove, setMousePos] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-24 px-4 relative overflow-hidden"
      onMouseMove={onMouseMove}
    >
      <CustomCursor />
      <SocialProofTicker />

      {/* ── Obsidian & Gold Aurora (mouse-reactive) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <AetherSphere />
            </Suspense>
          </Canvas>
        </div>
        <div className="absolute w-[900px] h-[900px] rounded-full opacity-10 blur-[120px] transition-transform duration-700 ease-out"
          style={{
            background: 'radial-gradient(circle, #4f46e5 0%, #D4AF37 50%, transparent 70%)',
            left: '50%', top: '40%',
            transform: `translate(calc(-50% + ${handleMouseMove.x * 40}px), calc(-50% + ${handleMouseMove.y * 30}px))`,
          }} />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')" }} />

      {/* ── Hero Section (The Altar of Destiny) ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center space-y-8 relative z-10 w-full mb-16 max-w-6xl mx-auto"
      >
        {/* Research-lab authority badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border"
            style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: '#D4AF37' }} />
            <span className="text-[10px] font-black tracking-[0.45em] uppercase" style={{ color: 'rgba(212,175,55,0.85)' }}>
              Fate-Sync V48: The Altar of Destiny
            </span>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: '#D4AF37' }} />
          </div>
        </motion.div>

        {/* Hero headline */}
        <div className="space-y-4">
          <h1 className="font-serif font-black leading-none tracking-tight animate-sweep"
            style={{ fontSize: 'clamp(4rem, 11vw, 10rem)', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Fate
            <span className="ml-4 gold-leaf-text">Sync</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-3xl mx-auto uppercase">
            데이터로 증명하는 당신의 <span className="text-mystic-gold font-bold">운명적 설계도</span>
          </p>
        </div>

        {/* ── [V48] The Altar of Destiny: 3 Mode Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-7xl mx-auto w-full px-4">
          {[
            {
              id: 'personal',
              title: '개인 운명',
              eng: 'THE EMISSION',
              numeral: 'IX',
              desc: '나의 고유한 운명 궤적과 아키타입 추출',
              img: '/image_0.png',
              color: '#D4AF37',
              badge: 'Solo Analysis'
            },
            {
              id: 'synergy',
              title: '연애 궁합',
              eng: 'THE HARMONY',
              numeral: 'VI',
              desc: '두 영혼의 싱크로율과 시너지 계측',
              img: '/image_1.png',
              color: '#f43f5e',
              badge: 'Couple Sync'
            },
            {
              id: 'business',
              title: '비즈니스',
              eng: 'THE SOVEREIGN',
              numeral: 'IV',
              desc: '조직의 성공을 위한 오행 공학 설계',
              img: '/mode_business.png',
              color: '#3b82f6',
              badge: 'Team Strategy'
            }
          ].map((entry) => (
            <motion.div
              key={entry.id}
              whileHover={{ y: -15, boxShadow: `0 30px 100px ${entry.color}20` }}
              onClick={() => { onStart(entry.id as any); if (typeof triggerHaptic === 'function') triggerHaptic(10); }}
              className="group relative h-[450px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] transition-all duration-500"
              style={{ background: '#08080c' }}
            >
              {/* Background Images with Parallax/Rotate effect */}
              <motion.div
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-all duration-700"
                style={{ backgroundImage: `url(${entry.img})` }}
                whileHover={{ scale: 1.2, rotate: 2, z: 20 }}
              />

              {/* Special Couple Card Overlay (Double cards) */}
              {entry.id === 'synergy' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.img src="/image_1.png" className="absolute w-40 h-auto top-20 left-10 rotate-[-10deg] opacity-50 blur-[1px] group-hover:rotate-[-20deg] group-hover:scale-125 transition-all duration-700" />
                  <motion.img src="/image_1.png" className="absolute w-40 h-auto top-24 right-10 rotate-[10deg] opacity-80 group-hover:rotate-[20deg] group-hover:scale-125 transition-all duration-700" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/30 to-transparent" />

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${entry.color}20, transparent 70%)` }} />

              {/* Card Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-between items-center text-center">
                <div className="space-y-2">
                  <div className="text-[9px] font-black tracking-[0.4em] uppercase py-1 px-3 rounded-full border border-white/10 inline-block bg-white/5" style={{ color: entry.color }}>
                    {entry.badge}
                  </div>
                  <div className="text-4xl font-serif font-black text-white/20 select-none">{entry.numeral}</div>
                </div>

                <div className="space-y-3 relative z-20">
                  <h3 className="text-3xl font-serif font-black text-white group-hover:text-mystic-gold transition-colors">{entry.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed max-w-[200px] mx-auto opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    {entry.desc}
                  </p>
                </div>

                {/* Golden Sync Text on Hover */}
                <div className="relative h-12 flex items-center justify-center w-full z-20">
                  <motion.div
                    className="absolute opacity-60 group-hover:opacity-0 transition-opacity"
                    style={{ color: entry.color }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                  <motion.div
                    className="absolute opacity-0 group-hover:opacity-100 transition-all duration-500 text-[11px] font-black tracking-[0.3em] uppercase"
                    style={{ color: '#D4AF37', textShadow: '0 0 10px rgba(212,175,55,0.5)' }}
                  >
                    운명 동기화 시작 ✦
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── [V48] Phase 2: Visual Proof Section (The Tech) ── */}
      <section className="w-full max-w-7xl mx-auto py-32 border-t border-white/5 mt-20 px-4">
        <div className="text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">
            Proof of Technology
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-black text-white leading-tight">AI 정밀 계측 엔진</h2>
          <p className="text-slate-500 uppercase tracking-[0.4em] text-xs font-black">
            데이터로 증명되는 운명적 분석 프로세스
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* 3D Face Mesh Proof (Phased Action) */}
          <div className="group relative flex flex-col">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex-1 rounded-[3rem] overflow-hidden border border-white/10 bg-[#06060a] min-h-[500px] flex items-center justify-center p-8">
              <div className="absolute inset-0 flex items-center justify-center opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                <Suspense fallback={null}>
                  <Canvas camera={{ position: [0, 0, 5] }}>
                    <InteractiveFaceMesh />
                  </Canvas>
                </Suspense>
              </div>
              <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Engine</span>
                </div>
                <div className="text-[32px] font-mono text-white/10 font-black">468.MS</div>
              </div>
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl">
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Spatial Mapping</h4>
                <p className="text-white text-2xl font-serif font-bold mb-2">안면 랜드마크 계측</p>
                <p className="text-slate-400 text-sm font-light leading-relaxed">
                  Gemini 2.0 Flash가 실시간으로 468개의 안면 포인트를 정밀 분석하여 관상(Physiognomy) 데이터를 아키타입으로 변환합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Palm Lines Neon Proof (Phased Action) */}
          <div className="group relative flex flex-col">
            <div className="absolute -inset-4 bg-purple-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex-1 rounded-[3rem] overflow-hidden border border-white/10 bg-[#06060a] min-h-[500px] flex items-center justify-center p-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <PalmScanSVG />
              </div>
              <div className="absolute top-10 left-10 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Neural Tracing</span>
                </div>
                <div className="text-[32px] font-mono text-white/10 font-black">PALM.82%</div>
              </div>
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl">
                <h4 className="text-purple-400 font-black text-[10px] uppercase tracking-widest mb-2">Bio-Metric Analysis</h4>
                <p className="text-white text-2xl font-serif font-bold mb-2">손금 궤적 추출</p>
                <p className="text-slate-400 text-sm font-light leading-relaxed">
                  생명선, 두뇌선, 감정선, 운명선의 깊이와 굴곡을 디지털 네온 라인으로 트레이싱하여 향후 6개월간의 바이오리듬을 예측합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-20 space-y-4">
          <p className="text-slate-500 text-sm font-light italic">
            "단순한 텍스트 결과를 넘어, 당신의 <b>생체적 고유값</b>을 정밀 계측하여 데이터를 증명합니다."
          </p>
          <div className="flex items-center justify-center gap-8 opacity-30">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black tracking-widest">HIPAA COMPLIANT</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-[9px] font-black tracking-widest">CLOUD SYNC ENGINE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Original Detail Cards Section (The Ritual) ── */}
      <div className="w-full max-w-6xl mx-auto py-24 px-4 overflow-visible">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">The Selection Ritual</h2>
          <div className="h-px w-24 mx-auto mb-8" style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: 'personal', title: '개인 운명', eng: 'THE HERMIT',
              desc: '나의 고유한 운명 궤적과 잠재력을 정밀 계측합니다. 오행 흐름과 관상 에너지를 통합 분석하여 나만의 성소를 완성합니다.',
              icon: <User className="w-10 h-10" />, numeral: 'IX',
              accentFrom: '#4f46e5', accentTo: '#3b82f6',
            },
            {
              id: 'synergy', title: '연애 궁합', eng: 'THE LOVERS',
              desc: '두 영혼의 싱크로율과 인연의 깊이를 측정합니다. 운명적 공명이 현실의 언어로 번역되는 순간을 경험하세요.',
              icon: <Heart className="w-10 h-10" />, numeral: 'VI',
              accentFrom: '#db2777', accentTo: '#f43f5e',
            },
            {
              id: 'business', title: '비즈니스 전략', eng: 'THE EMPEROR',
              desc: '팀의 오행 상생 구조와 리더십 궤적을 분석합니다. 데이터 기반 의사결정으로 조직의 운명을 설계합니다.',
              icon: <Briefcase className="w-10 h-10" />, numeral: 'IV',
              accentFrom: '#f59e0b', accentTo: '#d97706',
            },
          ].map((mode) => (
            <ModeTarotCard key={mode.id} {...mode} mode={mode.id as any} onStart={onStart} triggerHaptic={triggerHaptic} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DestinyTarotCard = ({ result, onFlip }: { result: any; onFlip?: () => void }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 space-y-6 flex flex-col items-center">
      <h3 className="text-2xl font-serif font-black text-mystic-gold text-center">Destiny Archetype<br /><span className="text-[10px] tracking-widest text-slate-400 font-light mt-1 mb-4 block">당신의 영혼과 동기화된 타로 카드</span></h3>

      <div className="w-64 h-[400px] cursor-pointer" onClick={() => { setFlipped(!flipped); onFlip?.(); }} style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
          className="relative w-full h-full shadow-[0_0_50px_rgba(212,175,55,0.2)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 카드 뒷면 (Classic Mystery) */}
          <div className="absolute inset-0 rounded-2xl border-4 border-yellow-500 bg-[#0c0c1e] flex flex-col items-center justify-center overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute inset-0 bg-[url('/tarot_back.png')] bg-cover bg-center opacity-70" />
            <div className="w-full h-full border-2 border-yellow-500/20 m-2 rounded-xl flex flex-col items-center justify-center relative bg-black/40">
              <Sparkles className="w-8 h-8 text-yellow-500/80 animate-pulse mb-8" />
              <p className="mt-4 text-[10px] text-yellow-500 font-black tracking-widest text-center px-4">FATE-SYNC<br />ETERNAL DECK</p>
            </div>
          </div>

          {/* 카드 앞면 (User Face + Anime Fusion) */}
          <div className="absolute inset-0 rounded-2xl border-4 border-yellow-500 overflow-hidden bg-black" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <img
              src={result?.hybrid?.cartoonInfo?.cartoonImageUrl || "/tarot_front.png"}
              className="w-full h-full object-cover"
              alt="Fate Tarot"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-center">
              <h4 className="text-lg font-serif font-black text-yellow-500 tracking-widest uppercase mb-1">
                {result?.hybrid?.cartoonInfo?.characterName || 'THE DESTINY'}
              </h4>
              {result?.hybrid?.cartoonInfo?.originWork && (
                <p className="text-[10px] text-yellow-100/70">{result.hybrid.cartoonInfo.originWork}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <p className="text-sm text-slate-500 font-light italic text-center px-4 mt-8 max-w-[300px] leading-relaxed">
        {result?.hybrid?.cartoonInfo?.description || "카드를 터치하여 당신의 진정한 운명 캐릭터를 완성하세요."}
      </p>

    </div>
  );
};

const DestinyPrescription = ({ sajuData, worryResolution }: { sajuData: any; worryResolution?: string }) => {
  const oracleMessages = [
    sajuData?.pros && { role: 'oracle' as const, content: sajuData.pros, sentiment: 'positive' as const, label: '타고난 강점 (Pros)' },
    sajuData?.cons && { role: 'oracle' as const, content: sajuData.cons, sentiment: 'caution' as const, label: '주의할 약점 (Cons)' },
    sajuData?.remedy && { role: 'oracle' as const, content: sajuData.remedy, sentiment: 'neutral' as const, label: '운의 보완책 (Remedy)' },
    worryResolution && { role: 'oracle' as const, content: worryResolution, sentiment: 'positive' as const, label: '고민 해결 (Solution)' },
  ].filter(Boolean) as any[];

  return (
    <div className="mt-20 space-y-12 border-t border-white/5 pt-16">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-serif font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 bg-clip-text text-transparent">마스터 오라클의 운명 상담</h2>
        <p className="text-[#D4AF37]/50 text-sm font-black uppercase tracking-[0.3em]">Oracle Consultation</p>
      </div>

      <div className="bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] rounded-[3rem] p-8 md:p-12 border border-[#D4AF37]/15">
        <OracleMessenger messages={oracleMessages} />
      </div>

      {/* 상담 메시지 (CTA) */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-10 rounded-[3rem] border border-white/10 text-center space-y-8 relative overflow-hidden mt-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h3 className="text-2xl font-bold text-white relative z-10">더 깊은 운명의 해석이 필요하신가요?</h3>
        <p className="text-slate-300 text-sm font-light relative z-10 leading-relaxed">
          마스터 오라클과의 1:1 심층 상담을 통해<br />현재의 고민을 해결하고 최적의 타이밍을 선점하세요.
        </p>
        <button className="px-10 py-5 bg-yellow-500 text-black font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 relative z-10 hover:scale-105 active:scale-95 duration-300">
          마스터 오라클과 실시간 상담하기
        </button>
      </div>
    </div>
  );
};


const AetherLoungeTeaser = () => {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000 scale-110 group-hover:scale-100 blur-2xl">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
    </div>
  );
};

const EnergyPulse = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
      >
        <div className="w-[100px] h-[100px] rounded-full border-[20px] border-mystic-gold/40 shadow-[0_0_100px_#D4AF37]" />
      </motion.div>
    )}
  </AnimatePresence>
);

const App: React.FC = () => {

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const playOracleVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop existing speech
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const majesticVoice = voices.find(v => v.lang.includes('ko') && (v.name.includes('Google') || v.name.includes('Premium'))) || voices[0];
      if (majesticVoice) utterance.voice = majesticVoice;
      utterance.pitch = 0.85;
      utterance.rate = 0.95;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const [step, setStep] = useState<FateStep>('LANDING');
  const [showIntro, setShowIntro] = useState(true);
  const [isReadingAdvice, setIsReadingAdvice] = useState(false);
  const [showEnergy, setShowEnergy] = useState(false);
  const [activeMode, setActiveMode] = useState<'personal' | 'synergy' | 'business'>('personal');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminCredentials] = useState({ id: 'admin@fatesync.com', pw: 'admin1234' });

  // New States for Footer Features
  const [tarotCard, setTarotCard] = useState<{ name: string; image: string; meaning: string } | null>(null);
  const [isTarotLoading, setIsTarotLoading] = useState(false);

  const [usersData, setUsersData] = useState<UserFateData[]>([
    { saju: { birthDate: '', birthTime: '', isLunar: false, gender: 'MALE' } },
    { saju: { birthDate: '', birthTime: '', isLunar: false, gender: 'FEMALE' } }
  ]);
  const [currentUserIdx, setCurrentUserIdx] = useState<number>(0);
  const userData = usersData[currentUserIdx];
  const setUserData = (updater: React.SetStateAction<UserFateData>) => {
    setUsersData(prev => {
      const newArr = [...prev];
      newArr[currentUserIdx] = typeof updater === 'function' ? updater(newArr[currentUserIdx]) : updater;
      return newArr;
    });
  };
  const [compatResult, setCompatResult] = useState<any>(null);

  const handleSajuChange = (field: keyof SajuData, value: any) => {
    setUserData(prev => ({
      ...prev,
      saju: { ...prev.saju!, [field]: value }
    }));
  };
  const [result, setResult] = useState<FateAnalysisResult | null>(null);

  // V50: Dynamic Elemental Aura Engine
  useEffect(() => {
    if (!result) return;
    const element = result.saju.dayMasterElement || result.saju.element;
    const themeMap: Record<string, { gold: string, accent: string }> = {
      '목': { gold: '#10b981', accent: '#34d399' }, // Emerald Gold
      '화': { gold: '#ef4444', accent: '#f87171' }, // Ruby Gold
      '토': { gold: '#f59e0b', accent: '#fbbf24' }, // Amber Gold
      '금': { gold: '#f8fafc', accent: '#e2e8f0' }, // Platinum Gold
      '수': { gold: '#3b82f6', accent: '#60a5fa' }, // Sapphire Gold
    };
    const theme = themeMap[element] || { gold: '#fbbf24', accent: '#a78bfa' };

    document.documentElement.style.setProperty('--dynamic-gold', theme.gold);
    document.documentElement.style.setProperty('--dynamic-accent', theme.accent);
  }, [result]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState<{ type: string; content: string } | null>(null);
  const [scanStage, setScanStage] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Mock Tarot Data & Function
  const mockTarotDeck = [
    { name: 'The Fool', image: 'https://images.unsplash.com/photo-1601024419139-498c14856b3a?w=400', meaning: 'Beginning of a journey, innocence, spontaneity.' },
    { name: 'The Magician', image: 'https://images.unsplash.com/photo-1572991339318-7d84f04c6f9b?w=400', meaning: 'Manifestation, resourcefulness, power.' },
    { name: 'The Lovers', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400', meaning: 'Harmony, relationships, choices.' }
  ];

  const handleDrawTarot = () => {
    setIsTarotLoading(true);
    setTarotCard(null); // Clear previous
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockTarotDeck.length);
      setTarotCard(mockTarotDeck[randomIndex]);
      setIsTarotLoading(false);
    }, 1800);
  };

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [oracleCategory, setOracleCategory] = useState<string>('전체');
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarkData | null>(null);
  const [palmLandmarks, setPalmLandmarks] = useState<PalmLandmarkData | null>(null);

  // V32: Audio atmosphere
  const { toggleAmbient, playFlip, playTyping, isAmbientOn } = useAudioAtmosphere();

  // V32: Face mesh tooltip
  const [faceTooltip, setFaceTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // V33-Final: Oracle chat messages lifted to App for PDF transcript
  const [oracleChatMessages, setOracleChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  // V35: Analysis completion gate (ensures minimum cinematic duration)
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showNFT, setShowNFT] = useState(false);

  // V48: Destiny Flex & NFT Reward
  const recordFlex = () => {
    triggerHaptic([30, 50, 30, 100]);
    setShowNFT(true);
    setShowEnergy(true);
    setTimeout(() => setShowEnergy(false), 5000); // 5초 후 페이드 아웃
  };


  const handleReadAdvice = () => {
    if (!result?.hybrid?.finalAdvice) return;
    if (isReadingAdvice) {
      window.speechSynthesis.cancel();
      setIsReadingAdvice(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result.hybrid.finalAdvice.replace(/[一-龥]/g, ''));
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 0.8; // 장엄한 저음
    utterance.onend = () => setIsReadingAdvice(false);
    setIsReadingAdvice(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadPDF = async () => {
    // Double-click guard
    if (isExportingPDF || !reportRef.current || !result) return;
    setIsExportingPDF(true);

    const elementColor = ({
      '목': '#10b981', '화': '#ef4444', '토': '#f59e0b', '금': '#f8fafc', '수': '#3b82f6'
    } as any)[result.saju.dayMasterElement || result.saju.element] || '#D4AF37';

    // ① 우주의 찰나 포착: Three.js Canvas Snapshot
    let bgSnapshot: string | null = null;
    try {
      const glCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (glCanvas) bgSnapshot = glCanvas.toDataURL('image/png');
    } catch (_) { }

    // ② 오라클 상담록 섹션 활성화
    const transcriptEl = document.getElementById('oracle-transcript');
    if (transcriptEl) transcriptEl.style.display = 'block';

    // ③ 스냅샷을 reportRef 엘리먼트에 직접 주입 (+ CSS 보조)
    const reportEl = reportRef.current;
    const originalBg = reportEl.style.backgroundImage;
    const originalBgSize = reportEl.style.backgroundSize;
    const originalBgAttach = reportEl.style.backgroundAttachment;
    if (bgSnapshot) {
      reportEl.style.backgroundImage = `url(${bgSnapshot})`;
      reportEl.style.backgroundSize = 'cover';
      reportEl.style.backgroundAttachment = 'fixed';
    }

    const pdfStyle = document.createElement('style');
    pdfStyle.id = 'pdf-export-style';
    pdfStyle.innerHTML = `
      #report-content {
        ${!bgSnapshot ? `background: linear-gradient(to bottom, #030305, ${elementColor}18) !important;` : ''}
        color: #ffffff !important;
      }
      .page-break { page-break-before: always; }
      h1, h2 {
        color: #D4AF37 !important;
        text-shadow: none !important;
        border-bottom: 1px solid #D4AF3733 !important;
      }
      .print-only, #oracle-transcript { display: block !important; }
      .no-print { display: none !important; }
    `;
    document.head.appendChild(pdfStyle);

    const dateStr = new Date().toISOString().slice(0, 10);
    const userName = userData.userName || '운명';
    const characterName = result.hybrid.cartoonInfo?.characterName?.split('(')[0]?.trim() || '비전';

    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: `FateSync_EtherArchive_${userName}_${characterName}_${dateStr}.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        backgroundColor: '#050510',
        logging: false,
        letterRendering: true,
        scrollY: 0
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(reportEl).save();
      console.log('🌌 에테르 아카이브: 운명 비전이 성공적으로 기록되었습니다.');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 브라우저의 인쇄 기능을 이용해 주세요.');
    } finally {
      // ④ 원상 복구 Cleanup
      if (transcriptEl) transcriptEl.style.display = 'none';
      reportEl.style.backgroundImage = originalBg;
      reportEl.style.backgroundSize = originalBgSize;
      reportEl.style.backgroundAttachment = originalBgAttach;
      const styleNode = document.getElementById('pdf-export-style');
      if (styleNode) document.head.removeChild(styleNode);
      setIsExportingPDF(false);
    }
  };
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const loadingMessages = useMemo(() => {
    const common = [
      "오행의 상생상극 흐름을 분석하고 있습니다...",
      "관상과 손금의 미세한 특징을 추출하고 있습니다...",
      "당신과 닮은 운명적 캐릭터를 찾고 있습니다...",
      "마스터의 깊은 통찰을 리포트에 담고 있습니다..."
    ];
    if (activeMode === 'synergy') return [
      "인연의 실타래를 정교하게 풀어나가는 중입니다...",
      "두 영혼의 오행 공명 지수를 계산하고 있습니다...",
      "전생부터 이어진 인연의 깊이를 계측 중입니다...",
      ...common
    ];
    if (activeMode === 'business') return [
      "성공을 향한 최적의 좌표를 계산하는 중입니다...",
      "조직의 오행 상생 구조를 전략적으로 분석 중입니다...",
      "재물 창고(財庫)가 열리는 황금의 시기를 탐색 중입니다...",
      ...common
    ];
    return [
      "하나뿐인 자아의 북극성을 탐색하고 있습니다...",
      "천명(天命)에 깃든 잠재력을 일깨우는 중입니다...",
      "당신의 영혼과 동기화된 아키타입을 소환 중입니다...",
      ...common
    ];
  }, [activeMode]);

  // Update scan stage and loading messages periodically
  React.useEffect(() => {
    if (step === 'ANALYZING') {
      const stageInterval = setInterval(() => {
        setScanStage(prev => (prev + 1) % 4);
      }, 2000);

      const messageInterval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 4000);

      return () => {
        clearInterval(stageInterval);
        clearInterval(messageInterval);
      };
    } else {
      setScanStage(0);
      setLoadingMessageIndex(0);
    }
  }, [step]);

  const handleStart = (mode: 'personal' | 'synergy' | 'business') => {
    setActiveMode(mode);
    setCurrentUserIdx(0);
    setUsersData([
      { saju: { birthDate: '', birthTime: '', isLunar: false, gender: 'MALE' } },
      { saju: { birthDate: '', birthTime: '', isLunar: false, gender: 'FEMALE' } }
    ]);
    setStep(isLoggedIn ? 'SAJU' : 'LOGIN');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (step === 'SAJU') setStep('FACE');
    else if (step === 'FACE') setStep('MBTI');
    else if (step === 'MBTI') setStep('PALM');
    else if (step === 'PALM') setStep('WORRY');
    else if (step === 'WORRY') setStep('TAROT');
    else if (step === 'TAROT') {
      if (activeMode === 'synergy' && currentUserIdx === 0) {
        setCurrentUserIdx(1);
        setStep('SAJU');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (activeMode === 'business' && currentUserIdx < 4) {
        setUsersData(prev => {
          if (prev.length <= currentUserIdx + 1) {
            return [...prev, { saju: { birthDate: '', birthTime: '', isLunar: false, gender: 'MALE' } }];
          }
          return prev;
        });
        setCurrentUserIdx(prev => prev + 1);
        setStep('SAJU');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        startAnalysis();
      }
    }
  };

  const handleBack = () => {
    if (step === 'FACE') setStep('SAJU');
    else if (step === 'MBTI') setStep('FACE');
    else if (step === 'PALM') setStep('MBTI');
    else if (step === 'WORRY') setStep('PALM');
    else if (step === 'SAJU') {
      if (activeMode !== 'personal' && currentUserIdx > 0) {
        setCurrentUserIdx(prev => prev - 1);
        setStep('WORRY');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStep('LANDING');
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any)[0].value;
    const password = (e.target as any)[1].value;

    if (email === adminCredentials.id && password === adminCredentials.pw) {
      setIsLoggedIn(true);
      setStep('SAJU');
    } else {
      // For demo purposes, let's allow any login but highlight admin
      setIsLoggedIn(true);
      setStep('SAJU');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just log them in after signup
    setIsLoggedIn(true);
    setStep('SAJU');
  };

  const startAnalysis = async () => {
    setStep('ANALYZING');
    setAnalysisComplete(false);
    setLoading(true);
    setError(null);
    setFaceLandmarks(null);
    setPalmLandmarks(null);

    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setError("분석 시간이 너무 오래 걸립니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요. (서버 응답 지연)");
      setStep('PALM');
      setLoading(false);
    }, 120000);

    try {
      if (activeMode === 'personal' || !activeMode) {
        const [res, faceData, palmData] = await Promise.all([
          analyzeFate(userData, userData.worry, 'personal'),
          userData.faceImage ? detectFaceLandmarks(userData.faceImage).catch(e => { console.warn('Face detection failed:', e); return null; }) : Promise.resolve(null),
          userData.palmImage ? detectPalmLandmarks(userData.palmImage).catch(e => { console.warn('Palm detection failed:', e); return null; }) : Promise.resolve(null),
        ]);
        clearTimeout(timeoutId);

        if (faceData) setFaceLandmarks(faceData);
        if (palmData) setPalmLandmarks(palmData);

        if (res.hybrid.cartoonInfo && userData.faceImage) {
          const cardNameKR = res.hybrid.cartoonInfo.characterName?.split('(')[0]?.trim() || '운명의 카드';
          const cardNameEN = res.hybrid.cartoonInfo.characterName?.match(/\(([^)]+)\)/)?.[1] || 'Destiny';
          const numeral = res.hybrid.cartoonInfo.tarotNumeral || 'I';
          const colorPalette = res.hybrid.cartoonInfo.tarotColorPalette || 'purple-gold';

          let aiImageGenerated = false;
          if (res.hybrid.cartoonInfo.visualPrompt) {
            try {
              const aiImage = await generateAiTarotImage(
                res.hybrid.cartoonInfo.visualPrompt,
                numeral,
                userData.userName || '사용자',
                cardNameEN,
                userData.faceImage
              );
              if (aiImage) {
                res.hybrid.cartoonInfo.cartoonImageUrl = aiImage;
                aiImageGenerated = true;
              }
            } catch (e) { }
          }
          if (!aiImageGenerated) {
            try {
              const tarotImage = await generateTarotCard(userData.faceImage, cardNameKR, cardNameEN, numeral, colorPalette);
              res.hybrid.cartoonInfo.cartoonImageUrl = tarotImage;
              res.hybrid.cartoonInfo.cartoonImageUrl = tarotImage;
            } catch (e) { }
          }
        }
        setScanStage(4);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResult(res);
        setAnalysisComplete(true); // Signal cinematic gate

        // V49: Aether Voice — The Oracle Speaks
        const voiceTxt = `동기화 완료. 당신의 운명 아키타입은 ${res?.hybrid?.cartoonInfo?.characterName || '오라클'}입니다. ${res?.overallSummary || '당신의 운명은 이미 쓰여졌습니다.'}`;
        playOracleVoice(voiceTxt);

        console.log('FATE-SYNC: ✅ Analysis complete, waiting for cinematic minimum duration...');
      } else {
        const cRes = await analyzeCompatibility(usersData, activeMode === 'synergy' ? 'COMPAT_LOVE' : 'COMPAT_BUSINESS');
        clearTimeout(timeoutId);
        setCompatResult(cRes);
        setStep('REPORT');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Analysis Error:", err);

      let errorMessage = "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

      if (err.message?.includes("403") || err.message?.includes("PERMISSION_DENIED")) {
        errorMessage = "API 키 권한 오류가 발생했습니다. API 키 설정을 확인하거나 다시 선택해주세요.";
      } else if (err.message?.includes("429")) {
        errorMessage = "요청이 너무 많습니다 (Rate Limit). 잠시 후 다시 시도해주세요.";
      } else if (err.message?.includes("SAFETY")) {
        errorMessage = "입력된 데이터가 안전 정책에 의해 거부되었습니다. 다른 사진을 사용해보세요.";
      } else if (err.message?.includes("JSON") || err.message?.includes("parse")) {
        errorMessage = "데이터 처리 중 오류가 발생했습니다. 다시 시도해주시면 정상적으로 분석될 수 있습니다.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setAnalysisComplete(false); // 로딩 종료 신호
      setStep('PALM'); // 마지막 단계로 복귀하여 수정 유도
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (field: 'faceImage' | 'palmImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startListening = (field: keyof UserFateData | 'birthDate' | 'birthTime') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcript:', transcript);

      if (field === 'mbti') {
        const mbtiMatch = transcript.toUpperCase().match(/[E|I][N|S][T|F][J|P]/);
        if (mbtiMatch) {
          setUserData(prev => ({ ...prev, mbti: mbtiMatch[0] as MBTIType }));
        } else {
          alert(`MBTI를 인식하지 못했습니다: ${transcript}`);
        }
      } else if (field === 'birthDate') {
        // Try to parse date from speech like "2000년 1월 1일"
        const dateMatch = transcript.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
        if (dateMatch) {
          const formattedDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
          setUserData(prev => ({
            ...prev,
            saju: {
              ...prev.saju,
              birthDate: formattedDate
            } as SajuData
          }));
        } else {
          alert(`날짜를 인식하지 못했습니다: ${transcript}. "2000년 1월 1일" 형식으로 말씀해주세요.`);
        }
      } else if (field === 'birthTime') {
        // Try to parse time from speech like "오후 2시 30분" or "14시 30분"
        const timeMatch = transcript.match(/(\d{1,2})시\s*(\d{1,2})분/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2].padStart(2, '0');
          if (transcript.includes('오후') && hours < 12) hours += 12;
          if (transcript.includes('오전') && hours === 12) hours = 0;
          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
          setUserData(prev => ({
            ...prev,
            saju: {
              ...prev.saju,
              birthTime: formattedTime
            } as SajuData
          }));
        } else {
          alert(`시간을 인식하지 못했습니다: ${transcript}. "14시 30분" 또는 "오후 2시 30분" 형식으로 말씀해주세요.`);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      alert("음성 인식 중 오류가 발생했습니다.");
    };

    recognition.start();
  };

  if (showIntro) return <SanctuaryIntro onComplete={() => setShowIntro(false)} />;

  return (
    <div className="min-h-screen bg-mystic-bg text-white font-sans selection:bg-mystic-accent/30 relative">
      <div className="grain-overlay" />
      <div className="atmosphere" />

      <Navbar
        onHome={() => setStep('LANDING')}
        onLogin={() => setStep('LOGIN')}
        isLoggedIn={isLoggedIn}
        step={step}
      />

      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen flex flex-col">
        {/* Premium Modal */}
        <AnimatePresence>
          {showPremiumModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowPremiumModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#151520] border border-white/10 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Premium Detailed Report</span>
                    </div>
                    <button onClick={() => setShowPremiumModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <ChevronLeft className="w-6 h-6 rotate-180" />
                    </button>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight">{showPremiumModal.type} 정밀 분석</h2>

                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 leading-relaxed text-slate-300 text-lg max-h-[400px] overflow-y-auto custom-scrollbar prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown components={{ p: 'div' as any } as any}>{showPremiumModal.content}</ReactMarkdown>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <p className="text-xs text-yellow-200/80">
                        이 정밀 분석 리포트는 유료 서비스입니다. 현재는 데모 버전으로 무료로 제공되고 있습니다.
                      </p>
                    </div>
                    <button
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-500/20"
                      onClick={() => setShowPremiumModal(null)}
                    >
                      확인 완료
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header - Only show on landing or wizard steps */}
        {['SAJU', 'FACE', 'MBTI', 'PALM', 'LOGIN', 'SIGNUP'].includes(step) && (
          <header className="text-center mb-8 md:mb-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-mystic-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mystic-accent/80">Universal Fate Engine v2.0</span>
            </motion.div>
            <GoldLeafTitle className="text-5xl md:text-8xl tracking-tight mb-6">
              당신의 운명을 <br className="md:hidden" /> 동기화하세요
            </GoldLeafTitle>
            <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-xl font-light leading-relaxed">
              사주, 관상, 손금, MBTI를 결합한 <br className="md:hidden" />
              국내 최초의 하이브리드 인공지능 운명 분석 플랫폼
            </p>
            {activeMode !== 'personal' && !['LOGIN', 'SIGNUP'].includes(step) && (
              <div className="flex justify-center flex-wrap mt-6 gap-2 md:gap-4 max-w-2xl mx-auto">
                {usersData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentUserIdx(idx)}
                    className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold border transition-all ${currentUserIdx === idx ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-transparent border-slate-700 text-slate-400'}`}
                  >
                    {idx === 0 ? '🧑‍🚀 본인 (1)' : activeMode === 'business' ? `조직원 (${idx + 1})` : '👩‍🚀 상대 (2)'}
                  </button>
                ))}
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step === 'LANDING' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                {/* ━━━ MOBILE: Grand Master Landing ━━━ */}
                <div className="md:hidden fixed inset-0 z-30 bg-mystic-bg flex flex-col overflow-y-auto safe-area-top safe-area-bottom">
                  {/* Hero */}
                  <div className="flex-shrink-0 pt-24 pb-8 px-6 text-center space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3"
                        style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(0,0,0,0.5)' }}>
                        <Sparkles className="w-3 h-3 animate-pulse" style={{ color: '#D4AF37' }} />
                        <span className="text-[8px] font-black tracking-[0.4em] uppercase" style={{ color: 'rgba(212,175,55,0.8)' }}>
                          Oracle Thesis · Destiny Engine
                        </span>
                      </div>
                      <h1 className="font-serif font-black leading-none" style={{ fontSize: '13vw', letterSpacing: '-0.02em' }}>
                        Fate<span style={{
                          background: 'linear-gradient(135deg, #f5d87d, #D4AF37, #b8860b)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}> Sync</span>
                      </h1>
                      <p className="text-slate-400 text-sm font-light leading-relaxed mt-3 max-w-xs mx-auto">
                        사주 · 관상 · 손금 · MBTI<br />4가지 운명 데이터를 융합 계측합니다
                      </p>
                    </motion.div>
                  </div>

                  {/* Mode Cards — horizontal scroll on mobile */}
                  <div className="flex-shrink-0 px-4 pb-4">
                    <p className="text-[9px] font-black tracking-[0.4em] uppercase text-center mb-4"
                      style={{ color: 'rgba(212,175,55,0.4)' }}>분석 모드를 선택하세요 · 터치로 뒤집기</p>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-pl-4" style={{ scrollbarWidth: 'none' }}>
                      {[
                        {
                          id: 'personal', title: '개인 운명', eng: 'THE HERMIT', numeral: 'IX',
                          icon: <User className="w-7 h-7" />, accentFrom: '#4f46e5',
                          desc: '나의 고유한 운명 궤적과 잠재력을 정밀 계측합니다.',
                        },
                        {
                          id: 'synergy', title: '연애 궁합', eng: 'THE LOVERS', numeral: 'VI',
                          icon: <Heart className="w-7 h-7" />, accentFrom: '#db2777',
                          desc: '두 영혼의 싱크로율과 인연의 깊이를 측정합니다.',
                        },
                        {
                          id: 'business', title: '비즈니스', eng: 'THE EMPEROR', numeral: 'IV',
                          icon: <Briefcase className="w-7 h-7" />, accentFrom: '#f59e0b',
                          desc: '팀의 오행 상생 구조와 리더십 궤적을 분석합니다.',
                        },
                      ].map((mode) => (
                        <div key={mode.id} className="flex-shrink-0 snap-start" style={{ width: '72vw', maxWidth: '280px' }}>
                          <ModeTarotCard
                            {...mode}
                            mode={mode.id}
                            onStart={(m: string) => handleStart(m as 'personal' | 'synergy' | 'business')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom feature pills */}
                  <div className="flex-shrink-0 px-6 pb-8">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: BrainCircuit, label: 'AI 정밀분석', color: 'text-indigo-400' },
                        { icon: Sparkles, label: '3D 타로', color: 'text-yellow-400' },
                        { icon: Globe, label: '글로벌 통찰', color: 'text-emerald-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/5 border border-white/10">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ━━━ DESKTOP: MainHome Component ━━━ */}
                <div className="hidden md:block">
                  <MainHome onStart={handleStart} onDrawTarot={handleDrawTarot} tarotCard={tarotCard} isTarotLoading={isTarotLoading} triggerHaptic={triggerHaptic} />
                </div>
              </motion.div>
            )}

            {step === 'LOGIN' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md md:relative fixed inset-0 md:inset-auto z-30 md:z-auto bg-mystic-bg md:bg-transparent flex items-center justify-center md:block px-6 md:px-0"
              >
                <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl space-y-6 md:space-y-8">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <LogIn className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h2 className="display text-3xl font-bold tracking-tight">로그인</h2>
                    <p className="serif text-slate-400 text-lg italic">분석 결과를 저장하고 관리하세요.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-500/20 mt-4"
                    >
                      로그인하고 시작하기
                    </button>
                  </form>

                  <div className="text-center space-y-4">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      계정이 없으신가요? <button onClick={() => setStep('SIGNUP')} className="text-indigo-400 hover:text-indigo-300 transition-colors">회원가입</button>
                    </p>
                    <button
                      onClick={() => setStep('LANDING')}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      홈으로 돌아가기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'SIGNUP' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md md:relative fixed inset-0 md:inset-auto z-30 md:z-auto bg-mystic-bg md:bg-transparent flex items-center justify-center md:block px-6 md:px-0"
              >
                <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl space-y-6 md:space-y-8">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-purple-500" />
                    </div>
                    <h2 className="display text-3xl font-bold tracking-tight">회원가입</h2>
                    <p className="serif text-slate-400 text-lg italic">새로운 운명 분석 계정을 만드세요.</p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="홍길동"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-purple-500/20 mt-4"
                    >
                      가입하고 시작하기
                    </button>
                  </form>

                  <div className="text-center space-y-4">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      이미 계정이 있으신가요? <button onClick={() => setStep('LOGIN')} className="text-indigo-400 hover:text-indigo-300 transition-colors">로그인</button>
                    </p>
                    <button
                      onClick={() => setStep('LANDING')}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      홈으로 돌아가기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {['SAJU', 'FACE', 'MBTI', 'PALM', 'WORRY', 'TAROT'].includes(step) && (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl"
              >
                {/* ━━━ MOBILE: Full-Screen Per-Step ━━━ */}
                <div className="md:hidden fixed inset-0 z-30 bg-mystic-bg flex flex-col safe-area-top safe-area-bottom">
                  {/* 상단 프로그레스 */}
                  <div className="flex flex-col px-6 pt-4 pb-2 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-mystic-gold uppercase tracking-[0.3em] opacity-80">
                        {activeMode === 'personal' ? '✦ Solo Ritual' : activeMode === 'synergy' ? '✧ Soul Sync' : '✦ Strategic Vision'}
                        {activeMode !== 'personal' && ` (${currentUserIdx + 1}/${activeMode === 'synergy' ? 2 : usersData.length})`}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">{step} PHASE</span>
                    </div>
                    <div className="flex gap-1.5">
                      {['SAJU', 'FACE', 'MBTI', 'PALM', 'WORRY', 'TAROT'].map((s, i) => (
                        <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s === step ? 'flex-1 bg-mystic-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' :
                          ['SAJU', 'FACE', 'MBTI', 'PALM', 'WORRY', 'TAROT'].indexOf(step) > i ? 'w-4 bg-emerald-500' : 'w-4 bg-white/10'
                          }`} />
                      ))}
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="flex-1 flex flex-col justify-center px-6 overflow-hidden">
                    {step === 'SAJU' && (
                      <div className="space-y-5">
                        <div className="text-center">
                          <h2 className="display text-2xl font-bold tracking-tight">
                            {activeMode === 'business' ? '비즈니스 파트너십' : activeMode === 'synergy' ? '연애 싱크로율' : '개인 운명 기록'}
                          </h2>
                          <p className="serif text-slate-400 text-sm italic mt-1">
                            {activeMode !== 'personal' ? (currentUserIdx === 0 ? '본인의 생년월일시를 입력하세요' : '상대방의 생년월일시를 입력하세요') : '생년월일시를 입력해주세요'}
                          </p>
                        </div>
                        <input
                          type="text" placeholder="이름"
                          value={userData.userName || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, userName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 text-white"
                        />
                        <input
                          type="date"
                          value={userData.saju?.birthDate || ''}
                          onChange={(e) => handleSajuChange('birthDate', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base focus:outline-none focus:border-indigo-500/50"
                        />
                        <input
                          type="time"
                          value={userData.saju?.birthTime || ''}
                          onChange={(e) => handleSajuChange('birthTime', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base focus:outline-none focus:border-indigo-500/50"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleSajuChange('isLunar', false)}
                            className={`py-3.5 rounded-2xl text-sm font-bold transition-all ${!userData.saju?.isLunar ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                          >☀️ 양력</button>
                          <button onClick={() => handleSajuChange('isLunar', true)}
                            className={`py-3.5 rounded-2xl text-sm font-bold transition-all ${userData.saju?.isLunar ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                          >🌙 음력</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleSajuChange('gender', 'MALE')}
                            className={`py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${userData.saju?.gender === 'MALE' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                          >♂️ 남성</button>
                          <button onClick={() => handleSajuChange('gender', 'FEMALE')}
                            className={`py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${userData.saju?.gender === 'FEMALE' ? 'bg-rose-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                          >♀️ 여성</button>
                        </div>
                      </div>
                    )}

                    {step === 'FACE' && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                          <GoldLeafTitle className="text-2xl text-center mb-4">얼굴에 담긴 운명</GoldLeafTitle>
                          <p className="serif text-slate-400 text-sm italic mt-1">정면을 바라보고 타원 가이드에 맞추세요</p>
                        </div>
                        {userData.faceImage ? (
                          <div className="relative w-full rounded-3xl overflow-hidden" style={{ maxHeight: '280px' }}>
                            <img src={userData.faceImage} className="w-full h-full object-cover" alt="Face" />
                            <button onClick={() => setUserData(prev => ({ ...prev, faceImage: undefined }))}
                              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white">
                              <RefreshCw className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <Suspense fallback={<div className="w-full h-64 rounded-3xl bg-white/5 animate-pulse" />}>
                            <SmartCameraGuide
                              mode="face"
                              activeMode={activeMode}
                              onCapture={(dataUrl) => setUserData(prev => ({ ...prev, faceImage: dataUrl }))}
                            />
                          </Suspense>
                        )}
                        <span className="text-[10px] text-slate-600">(선택 사항 — 건너뛸 수 있습니다)</span>
                      </div>
                    )}

                    {step === 'MBTI' && (
                      <div className="space-y-5">
                        <div className="text-center">
                          <h2 className="display text-2xl font-bold tracking-tight">성향 분석</h2>
                          <p className="serif text-slate-400 text-sm italic mt-1">MBTI 유형을 선택하세요</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {MBTI_LIST.map(type => (
                            <button key={type}
                              onClick={() => setUserData(prev => ({ ...prev, mbti: type as MBTIType }))}
                              className={`py-3.5 rounded-xl text-sm font-black transition-all ${userData.mbti === type ? 'bg-emerald-600 text-white scale-105 shadow-lg' : 'bg-white/5 text-slate-400 border border-white/10'
                                }`}
                            >{type}</button>
                          ))}
                        </div>
                        {userData.mbti && (
                          <div className="text-center py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <span className="text-2xl font-black text-emerald-400">{userData.mbti}</span>
                            <span className="text-xs text-emerald-400/60 ml-2 font-bold">선택됨</span>
                          </div>
                        )}
                      </div>
                    )}

                    {step === 'PALM' && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                          <h2 className="display text-2xl font-bold tracking-tight">손바닥의 지도</h2>
                          <p className="serif text-slate-400 text-sm italic mt-1">손바닥을 가이드 안에 펼쳐 올려주세요</p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          <span className="text-lg">{userData.saju?.gender === 'FEMALE' ? '🤚' : '✋'}</span>
                          <span className="text-xs text-indigo-300 font-bold">
                            {userData.saju?.gender === 'FEMALE' ? '여성 → 오른손' : userData.saju?.gender === 'MALE' ? '남성 → 왼손' : '왼손 또는 오른손'}
                          </span>
                        </div>
                        {userData.palmImage ? (
                          <div className="relative w-full rounded-3xl overflow-hidden" style={{ maxHeight: '280px' }}>
                            <img src={userData.palmImage} className="w-full h-full object-cover" alt="Palm" />
                            <button onClick={() => setUserData(prev => ({ ...prev, palmImage: undefined }))}
                              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white">
                              <RefreshCw className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <Suspense fallback={<div className="w-full h-64 rounded-3xl bg-white/5 animate-pulse" />}>
                            <SmartCameraGuide
                              mode="palm"
                              activeMode={activeMode}
                              onCapture={(dataUrl) => setUserData(prev => ({ ...prev, palmImage: dataUrl }))}
                            />
                          </Suspense>
                        )}
                        <span className="text-[10px] text-slate-600">(선택 사항 — 건너뛸 수 있습니다)</span>
                      </div>
                    )}

                    {step === 'WORRY' && (
                      <div className="flex flex-col items-center gap-5">
                        <div className="text-center">
                          <h2 className="display text-2xl font-bold tracking-tight">당신의 고민</h2>
                          <p className="serif text-slate-400 text-sm italic mt-1">지금 가장 해결하고 싶은 고민거리나 목표를 적어주세요.</p>
                        </div>

                        {/* V41: 그랜드 오라클 카테고리 선택 */}
                        <div className="w-full">
                          <Suspense fallback={
                            <div className="space-y-2">
                              {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                              ))}
                            </div>
                          }>
                            <GrandOracleCategory
                              value={oracleCategory as any}
                              onChange={(cat) => setOracleCategory(cat)}
                            />
                          </Suspense>
                        </div>

                        <div className="w-full relative">
                          <textarea
                            value={userData.worry || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, worry: e.target.value }))}
                            placeholder="예시: 이직을 준비 중인데 올해 이동수가 있을까요? / 최근 사람 관계 때문에 너무 힘듭니다."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                          />
                          <MessageSquare className="absolute bottom-4 right-4 text-white/20 w-5 h-5 pointer-events-none" />
                        </div>
                        <span className="text-[10px] text-slate-600">(선택 사항 — 적어주시면 캐릭터가 솔루션을 줍니다)</span>
                      </div>
                    )}

                    {step === 'TAROT' && (
                      <div className="flex flex-col items-center gap-12 py-10 overflow-visible w-full">
                        <div className="text-center space-y-2">
                          <h2 className="display text-3xl font-bold tracking-tight text-mystic-gold">무의식의 인장 선택</h2>
                          <p className="serif text-slate-400 text-xs italic tracking-wide">22장의 카드 중 당신의 에너지가 닿는 한 장을 선택하세요</p>
                        </div>

                        <div className="relative h-[450px] w-full max-w-2xl mx-auto flex items-center justify-center perspective-[1500px] overflow-visible">
                          {[...Array(22)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ rotate: 0, x: 0, opacity: 0 }}
                              animate={{
                                rotate: (i - 10.5) * 6,
                                x: (i - 10.5) * 15,
                                y: Math.abs(i - 10.5) * 3,
                                z: -Math.abs(i - 10.5) * 10,
                                opacity: 1
                              }}
                              whileHover={{
                                y: -60,
                                scale: 1.15,
                                rotate: 0,
                                zIndex: 100,
                                transition: { type: 'spring', stiffness: 300, damping: 20 }
                              }}
                              className="absolute w-32 h-52 rounded-xl cursor-pointer border border-[#D4AF37]/40 shadow-2xl overflow-hidden bg-[#0c0c1e] group"
                              onClick={() => {
                                triggerHaptic([20, 10, 20]);
                                setShowEnergy(true);
                                setTimeout(() => { setShowEnergy(false); handleNext(); }, 800);
                              }}
                            >
                              <div className="absolute inset-0 bg-[url('/image_1.png')] bg-cover bg-center opacity-70 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2),transparent_70%)]" />
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-[9px] text-[#D4AF37]/50 font-black tracking-[0.5em] uppercase mt-4 animate-pulse">
                          당신의 무의식이 선택한 우주의 상징
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 하단 버튼 영역 */}
                  <div className="px-6 pb-4 pt-2 shrink-0 space-y-2">
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="flex gap-3">
                      {step !== 'SAJU' && (
                        <button onClick={() => { triggerHaptic(5); handleBack(); }}
                          className="flex-1 py-4 rounded-2xl font-bold text-sm bg-white/5 border border-white/10 flex items-center justify-center gap-1">
                          <ChevronLeft className="w-5 h-5" /> 이전
                        </button>
                      )}
                      <button onClick={() => { triggerHaptic(15); setShowEnergy(true); setTimeout(() => { setShowEnergy(false); handleNext(); }, 600); }}
                        className={`${step !== 'SAJU' ? 'flex-[2]' : 'w-full'} py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${step === 'WORRY' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-indigo-600 text-white'
                          }`}>
                        {step === 'WORRY'
                          ? (activeMode !== 'personal' && currentUserIdx === 0
                            ? '다음 인물 로드'
                            : (userData.worry ? '✨ 분석 시작' : '분석 시작'))
                          : step === 'FACE'
                            ? (userData.faceImage ? '다음' : '건너뛰기')
                            : step === 'PALM'
                              ? (userData.palmImage ? '다음' : '건너뛰기')
                              : step === 'MBTI'
                                ? (userData.mbti ? '다음' : '중립 선택')
                                : '다음'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ━━━ DESKTOP: Step-by-Step Wizard ━━━ */}
                <div className="hidden md:block bg-black/40 backdrop-blur-[40px] border border-mystic-gold/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(212,175,55,0.05)] relative overflow-hidden group">
                  <div className="hidden md:block mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="h-px w-12 bg-mystic-gold/30" />
                      <span className="text-xs font-black text-mystic-gold uppercase tracking-[0.5em] opacity-80 px-4">
                        {activeMode === 'personal' ? 'Independent Destiny Ritual' : activeMode === 'synergy' ? 'Synchronized Souls Ritual' : 'Strategic Business Command'}
                      </span>
                      <div className="h-px w-12 bg-mystic-gold/30" />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      {['SAJU', 'FACE', 'MBTI', 'PALM', 'WORRY', 'TAROT'].map((s, i) => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-12 bg-mystic-gold shadow-[0_0_15px_rgba(212,175,55,0.7)]' :
                          ['SAJU', 'FACE', 'MBTI', 'PALM', 'WORRY', 'TAROT'].indexOf(step) > i ? 'w-6 bg-emerald-500' : 'w-6 bg-white/15'
                          }`} />
                      ))}
                    </div>
                  </div>
                  {step === 'SAJU' && (
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="display text-3xl font-bold tracking-tight">
                          {activeMode !== 'personal'
                            ? `${currentUserIdx + 1}번째 인물 (${currentUserIdx === 0 ? '나' : activeMode === 'business' ? `조직원 ${currentUserIdx}` : '상대'})`
                            : '당신'}의 운명 데이터
                        </h2>
                        <p className="serif text-slate-400 text-lg italic">
                          {activeMode !== 'personal' ? (currentUserIdx === 0 ? '정확한 분석을 위해 먼저 본인의 생년월일시를 입력해주세요.' : '상대방의 생년월일시를 입력해주세요.') : '정확한 분석을 위해 생년월일시를 입력해주세요.'}
                        </p>
                      </div>
                      {/* 이름 입력 */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">이름</label>
                        <input
                          type="text"
                          placeholder="이름을 입력하세요"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 text-white"
                          value={userData.userName || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, userName: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">생년월일</label>
                          <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                            onChange={(e) => handleSajuChange('birthDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">태어난 시간</label>
                          <input
                            type="time"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-400"
                            onChange={(e) => handleSajuChange('birthTime', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">태어난 지역 (Birth Place)</label>
                          <span className="text-[10px] text-slate-400">진태양시 보정으로 분석 매칭도 상승</span>
                        </div>
                        <input
                          type="text"
                          placeholder="예: 서울, 부산, 대전 등"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 text-white"
                          value={userData.saju?.birthRegion || ''}
                          onChange={(e) => handleSajuChange('birthRegion', e.target.value)}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-4 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto">
                        <button
                          type="button"
                          onClick={() => handleSajuChange('isLunar', false)}
                          className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${!userData.saju?.isLunar ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                          양력 (Solar)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSajuChange('isLunar', true)}
                          className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${userData.saju?.isLunar ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                          음력 (Lunar)
                        </button>
                      </div>
                      <button
                        onClick={() => toggleAmbient(result?.saju?.dayMasterElement || result?.saju?.element)}
                        className={`p-3 rounded-full backdrop-blur-xl border transition-all ${isAmbientOn ? 'bg-mystic-accent border-mystic-accent text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-black/40 border-white/10 text-white/40 hover:text-white'}`}
                      >
                        <Volume2 className={`w-5 h-5 ${isAmbientOn ? 'animate-pulse' : ''}`} />
                      </button>
                      <div className="flex items-center justify-center gap-8 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="radio" name="gender" className="hidden" onChange={() => handleSajuChange('gender', 'MALE')} />
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${userData.saju?.gender === 'MALE' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10'}`}>
                            <User className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold">남성</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="radio" name="gender" className="hidden" onChange={() => handleSajuChange('gender', 'FEMALE')} />
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${userData.saju?.gender === 'FEMALE' ? 'bg-rose-600 border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                            <User className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold">여성</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 'FACE' && (
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h2 className="display text-2xl md:text-3xl font-bold tracking-tight">얼굴에 담긴 운명</h2>
                        <p className="serif text-slate-400 text-base md:text-lg italic">정면 사진을 업로드하거나 촬영하세요.</p>
                      </div>
                      <div className="relative aspect-square max-w-[280px] mx-auto">
                        {userData.faceImage ? (
                          <div className="relative w-full h-full">
                            <img src={userData.faceImage} className="w-full h-full object-cover rounded-2xl md:rounded-[3rem]" alt="Face" />
                            <button
                              onClick={() => setUserData(prev => ({ ...prev, faceImage: undefined }))}
                              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl md:rounded-[3rem] flex flex-col items-center justify-center gap-4">
                            <Camera className="w-10 h-10 text-slate-500" />
                            <div className="flex flex-col sm:flex-row gap-2 px-4 w-full">
                              {/* 갤러리 업로드 */}
                              <label className="flex-1 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload('faceImage', e)}
                                />
                                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-slate-300">
                                  <Download className="w-3.5 h-3.5" />
                                  갤러리
                                </div>
                              </label>
                              {/* 카메라 촬영 (모바일) */}
                              <label className="flex-1 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="user"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload('faceImage', e)}
                                />
                                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600/80 border border-indigo-500/30 hover:bg-indigo-600 transition-all text-xs font-bold text-white">
                                  <Camera className="w-3.5 h-3.5" />
                                  셀피 촬영
                                </div>
                              </label>
                            </div>
                            <span className="text-[10px] text-slate-600 font-medium">(선택 사항)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 'MBTI' && (
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="display text-3xl font-bold tracking-tight">현대적 성향 분석</h2>
                        <p className="serif text-slate-400 text-lg italic">당신의 MBTI 유형을 선택해주세요.</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {MBTI_LIST.map(type => (
                          <button
                            key={type}
                            onClick={() => setUserData(prev => ({ ...prev, mbti: type as MBTIType }))}
                            className={`py-4 rounded-2xl text-sm font-black transition-all border ${userData.mbti === type
                              ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 'PALM' && (
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h2 className="display text-2xl md:text-3xl font-bold tracking-tight">손바닥의 지도</h2>
                        <p className="serif text-slate-400 text-base md:text-lg italic">손바닥 사진을 업로드하거나 촬영하세요.</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mt-2">
                          <span className="text-lg">{userData.saju?.gender === 'FEMALE' ? '🤚' : '✋'}</span>
                          <span className="text-xs text-indigo-300 font-bold">
                            {userData.saju?.gender === 'FEMALE'
                              ? '여성 → 오른손을 촬영해 주세요'
                              : userData.saju?.gender === 'MALE'
                                ? '남성 → 왼손을 촬영해 주세요'
                                : '남성은 왼손, 여성은 오른손을 권장합니다'}
                          </span>
                        </div>
                      </div>
                      <div className="relative aspect-square max-w-[280px] mx-auto">
                        {userData.palmImage ? (
                          <div className="relative w-full h-full">
                            <img src={userData.palmImage} className="w-full h-full object-cover rounded-2xl md:rounded-[3rem]" alt="Palm" />
                            <button
                              onClick={() => setUserData(prev => ({ ...prev, palmImage: undefined }))}
                              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl md:rounded-[3rem] flex flex-col items-center justify-center gap-4">
                            <Fingerprint className="w-10 h-10 text-slate-500" />
                            <div className="flex flex-col sm:flex-row gap-2 px-4 w-full">
                              {/* 갤러리 업로드 */}
                              <label className="flex-1 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload('palmImage', e)}
                                />
                                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-slate-300">
                                  <Download className="w-3.5 h-3.5" />
                                  갤러리
                                </div>
                              </label>
                              {/* 카메라 촬영 */}
                              <label className="flex-1 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload('palmImage', e)}
                                />
                                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600/80 border border-purple-500/30 hover:bg-purple-600 transition-all text-xs font-bold text-white">
                                  <Camera className="w-3.5 h-3.5" />
                                  카메라 촬영
                                </div>
                              </label>
                            </div>
                            <span className="text-[10px] text-slate-600 font-medium">(선택 사항)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 'WORRY' && (
                    <div className="space-y-8">
                      <div className="text-center space-y-3">
                        <div className="inline-flex px-3 py-1 rounded-full bg-mystic-gold/10 border border-mystic-gold/20 text-[10px] font-black text-mystic-gold uppercase tracking-[0.2em] animate-pulse">
                          {activeMode === 'personal' ? 'Self-Reflex Ritual' : activeMode === 'synergy' ? 'Soul Sync Ritual' : 'Strategic Vision Ritual'}
                        </div>
                        <h2 className="display text-3xl md:text-4xl font-black tracking-tight">
                          {activeMode === 'business' && currentUserIdx === 0 ? '조직의 목표와 비전' : '운명의 질문'}
                        </h2>
                        <p className="serif text-slate-400 text-base italic">
                          {activeMode === 'personal' ? '가장 조언이 필요한 삶의 영역을 선택하고 고민을 들려주세요.' :
                            activeMode === 'synergy' ? '두 사람의 관계에서 가장 궁금한 점을 말씀해 주세요.' :
                              '현재 추진 중인 프로젝트나 사업적 파트너십의 핵심 과제를 적어주세요.'}
                        </p>
                      </div>

                      {activeMode === 'personal' && (
                        <div className="flex flex-wrap justify-center gap-3">
                          {['전체적 천명', '재물운/성공', '연애/인연', '건강/심리', '학업/진로'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setUserData(prev => ({ ...prev, worry: `[${cat}] ${(prev.worry || '').replace(/^\[.*?\]\s*/, '')}` }))}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${userData.worry?.includes(`[${cat}]`)
                                ? 'bg-mystic-gold text-mystic-ink border-mystic-gold'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="w-full relative">
                        <textarea
                          value={userData.worry || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, worry: e.target.value }))}
                          placeholder={
                            activeMode === 'business'
                              ? "예시: 이번 신규 프로젝트의 투자 유동성과 파트너사 대표와의 상생운이 어떻게 될까요? / 현재 채용 예정인 리더급 인사의 조직 적합성은 어떠합니까?"
                              : "예시: 올해 창업을 하려고 하는데 제 사주에 사업운이 들어와 있을까요? / 상대방과 결혼까지 생각 중인데 서로 오행이 잘 맞을까요?"
                          }
                          className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-base placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-mystic-gold/50 transition-all resize-none shadow-inner"
                        />
                        <div className="absolute top-6 right-6 p-2 bg-mystic-gold/10 rounded-xl text-mystic-gold opacity-30">
                          {activeMode === 'business' ? <Briefcase className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                        </div>
                      </div>
                      <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        ✦ {activeMode === 'personal' ? '개인 캐릭터' : activeMode === 'synergy' ? '인연 지수' : '비즈니스 로드맵'} 분석에 반영됩니다 ✦
                      </p>
                    </div>
                  )}

                  {step === 'TAROT' && (
                    <div className="space-y-12 py-8 flex flex-col items-center">
                      <div className="text-center space-y-2">
                        <h2 className="display text-4xl font-black tracking-tight text-mystic-gold">Secret Selection Ritual</h2>
                        <p className="serif text-slate-400 text-lg italic mt-2">당신의 무의식이 이끄는 카드 한 장을 선택하십시오.</p>
                      </div>

                      <div className="relative h-[500px] w-full flex items-center justify-center perspective-[2000px] overflow-visible mt-10">
                        <div className="flex gap-2">
                          {[...Array(22)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ rotate: 0, x: 0, opacity: 0 }}
                              animate={{
                                rotate: (i - 10.5) * 5,
                                x: (i - 10.5) * 18,
                                y: Math.abs(i - 10.5) * 4,
                                z: -Math.abs(i - 10.5) * 15,
                                opacity: 1
                              }}
                              whileHover={{
                                y: -100,
                                scale: 1.2,
                                rotate: 0,
                                zIndex: 100,
                                transition: { type: 'spring', stiffness: 200, damping: 25 }
                              }}
                              className="absolute w-48 h-80 rounded-2xl cursor-pointer border border-[#D4AF37]/40 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden bg-[#0a0a1a] group"
                              onClick={() => {
                                triggerHaptic([30, 15, 30]);
                                setShowEnergy(true);
                                setTimeout(() => { setShowEnergy(false); handleNext(); }, 800);
                              }}
                            >
                              {/* Classic Tarot Back from user request */}
                              <div className="absolute inset-0 bg-[url('/image_1.png')] bg-cover bg-center opacity-85 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                              {/* Selection particle glow */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.3),transparent_70%)]" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#D4AF37]/40 font-black tracking-[0.6em] uppercase mt-12 animate-pulse">
                        ✦ 당신의 무의식이 선택한 우주의 상징 ✦
                      </p>
                    </div>
                  )}


                  {/* Navigation Buttons */}
                  <div className="flex flex-col gap-4 mt-12">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs text-left"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-bold">분석 중 오류가 발생했습니다.</p>
                          <p className="opacity-80 leading-relaxed">{error}</p>
                          {error.includes("API 키") && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                              .env 파일을 확인해 주세요.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                    <div className="flex gap-4">
                      {step !== 'SAJU' && (
                        <button
                          onClick={() => { triggerHaptic(5); handleBack(); }}
                          className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          이전
                        </button>
                      )}

                      {activeMode === 'business' && step === 'WORRY' && currentUserIdx > 0 && currentUserIdx < 4 ? (
                        <div className="flex-[2] flex gap-3">
                          <button
                            onClick={() => startAnalysis()}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20"
                          >
                            이 인원수로 분석 완료 <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => { triggerHaptic(15); setShowEnergy(true); setTimeout(() => { setShowEnergy(false); handleNext(); }, 600); }}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
                          >
                            인원 더 추가하기 (+1) <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { triggerHaptic(15); setShowEnergy(true); setTimeout(() => { setShowEnergy(false); handleNext(); }, 600); }}
                          className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
                        >
                          {step === 'WORRY'
                            ? (activeMode !== 'personal' && ((activeMode === 'synergy' && currentUserIdx === 0) || (activeMode === 'business' && currentUserIdx < 4))
                              ? '다음 인물 로드'
                              : '분석 시작하기')
                            : step === 'FACE'
                              ? (userData.faceImage ? '다음 단계' : '건너뛰기')
                              : step === 'PALM'
                                ? (userData.palmImage ? '다음 단계' : '건너뛰기')
                                : step === 'MBTI'
                                  ? (userData.mbti ? '다음 단계' : '중립 선택')
                                  : '다음 단계'}
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'ANALYZING' && (
              <Suspense fallback={null}>
                <CinematicLoading
                  isAnalysisComplete={analysisComplete}
                  onMinimumDurationElapsed={() => {
                    if (analysisComplete) setStep('REPORT');
                  }}
                />
              </Suspense>
            )}



            {step === 'REPORT' && compatResult && activeMode !== 'personal' && (
              <main className="flex-1 w-full relative z-10 min-h-screen">
                <SynergyDashboard result={compatResult} usersData={usersData} />
              </main>
            )}

            {step === 'REPORT' && result && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl pb-20 relative mx-auto animate-slam"
              >
                {/* V51: Solo Archetype Spotlight */}
                <div className="pt-12 mb-12 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-gold/10 border border-mystic-gold/20 text-mystic-gold text-[10px] font-black uppercase tracking-[0.3em]">
                    <Sparkles className="w-4 h-4" /> Destiny Archetype Revealed
                  </div>
                  <h1 className="display text-4xl md:text-6xl font-black text-white">당신의 영원한 아키타입</h1>
                </div>

                <Suspense fallback={null}>
                  <CelestialBackground
                    element={result.saju.dayMasterElement || result.saju.element}
                    facialStats={{
                      eyes: (result.physiognomy.score / 100) * 0.8 + 0.1,
                      chin: Math.min(0.9, (result.physiognomy.traits?.length || 5) / 10)
                    }}
                  />
                </Suspense>

                {/* V33: Oracle Real-time Chat Bubble */}
                <Suspense fallback={null}>
                  <OracleChat
                    analysisResult={result}
                    userName={userData.userName || '사용자'}
                    onTyping={playTyping}
                    onMessagesChange={setOracleChatMessages}
                  />
                </Suspense>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-12">
                  {/* Sticky TOC Sidebar */}
                  <aside className="hidden lg:block w-64 shrink-0 px-4">
                    <div className="sticky top-32 space-y-6">
                      <div className="glass-panel p-6 space-y-4">
                        <div className="flex items-center gap-2 text-mystic-accent mb-4">
                          <List className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Analysis Index</span>
                        </div>
                        <nav className="space-y-1">
                          {[
                            { id: 'summary', label: '종합 요약', icon: Sparkles },
                            { id: 'character', label: '운명 캐릭터', icon: User },
                            { id: 'saju', label: '사주 분석', icon: Calendar },
                            { id: 'mbti', label: '성향 시너지', icon: BrainCircuit },
                            { id: 'physiognomy', label: '관상 분석', icon: Search },
                            { id: 'palmistry', label: '손금 분석', icon: Fingerprint },
                            { id: 'timeline', label: '운세 흐름', icon: TrendingUp },
                            { id: 'advice', label: '최종 조언', icon: Award },
                          ].map((item) => (
                            <a
                              key={item.id}
                              href={`#${item.id}`}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                            >
                              <item.icon className="w-4 h-4 group-hover:text-mystic-accent transition-colors" />
                              <span className="text-xs font-bold">{item.label}</span>
                            </a>
                          ))}
                        </nav>
                      </div>

                      <div className="glass-panel p-6 bg-mystic-accent/5 border-mystic-accent/10">
                        <p className="text-[10px] text-mystic-accent/60 font-black uppercase tracking-widest mb-2">Quick Actions</p>
                        <div className="space-y-2">
                          <button
                            onClick={handleDownloadPDF}
                            disabled={isExportingPDF}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {isExportingPDF ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            {isExportingPDF ? '생성 중...' : 'PDF 저장'}
                          </button>
                          <button
                            onClick={() => setStep('SAJU')}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> 다시 분석
                          </button>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* ━━━ Mobile Bottom Navigation ━━━ */}
                  <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-area-bottom">
                    <div className="bg-mystic-bg/95 backdrop-blur-xl border-t border-white/10 px-2 py-2">
                      <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {[
                          { id: 'summary', icon: '✦', label: '종합' },
                          { id: 'character', icon: '🃏', label: '카드' },
                          { id: 'saju', icon: '📊', label: '사주' },
                          { id: 'mbti', icon: '🧠', label: 'MBTI' },
                          { id: 'physiognomy', icon: '👤', label: '관상' },
                          { id: 'palmistry', icon: '✋', label: '손금' },
                          { id: 'advice', icon: '💡', label: '조언' },
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors"
                          >
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
                          </button>
                        ))}
                        <button
                          onClick={handleDownloadPDF}
                          className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors"
                        >
                          <Download className="w-4 h-4 text-mystic-accent" />
                          <span className="text-[8px] font-black text-mystic-accent uppercase tracking-wider">PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Main Report Content */}
                  <div ref={reportRef} id="report-content" className="flex-1 space-y-8 md:space-y-12 pb-20">
                    {/* V33: Today's Fate Calendar */}
                    <div className="no-print">
                      <Suspense fallback={null}>
                        <FateCalendar dayMasterElement={result.saju.dayMasterElement || result.saju.element} />
                      </Suspense>
                    </div>
                    {/* ━━━ Summary Card (Tarot Theme) ━━━ */}
                    <div id="summary" className="animate-slam bg-gradient-to-br from-[#1a0a2e] via-[#0f0620] to-[#0a0318] rounded-2xl md:rounded-[3rem] p-6 md:p-12 text-center space-y-6 md:space-y-8 shadow-2xl relative overflow-hidden scroll-mt-32 border border-mystic-gold/15">
                      <div className="prose prose-invert prose-p:leading-relaxed prose-headings:text-mystic-gold prose-strong:text-mystic-accent max-w-none text-sm md:text-base text-slate-300 bg-white/5 border border-white/5 p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-mystic-accent/10 blur-[100px] group-hover:bg-mystic-accent/20 transition-all duration-1000" />
                        <div className="relative z-10">
                          {activeMode === 'personal' ? (
                            <div className="whitespace-pre-wrap">
                              {result.overallSummary.split(/(살파랑|역마|도화|천명|아키타입)/g).map((part, i) => (
                                ['살파랑', '역마', '도화', '천명', '아키타입'].includes(part) ? (
                                  <AetherScript
                                    key={i}
                                    keyword={part}
                                    insight={`${part}는 당신의 운명 구조에서 중요한 역할을 합니다. ${userData.mbti} 성향과 결합하여 독특한 에너지를 발산합니다.`}
                                    mbtiMatch={userData.mbti}
                                  />
                                ) : part
                              ))}
                            </div>
                          ) : (
                            <ReactMarkdown>{result.overallSummary}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>

                    {activeMode === 'personal' && result?.hybrid?.cartoonInfo && (
                      <DestinyMatching archetype={result.hybrid.cartoonInfo.characterName} />
                    )}
                    <div className="text-mystic-gold/40 text-xl tracking-[0.5em]">✦ ✧ ✦ ✧ ✦</div>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-mystic-gold/10 backdrop-blur-md rounded-full text-mystic-gold text-[10px] font-black uppercase tracking-[0.3em] border border-mystic-gold/30">
                      <Sparkles className="w-4 h-4" />
                      Integrated Destiny Sync Result
                    </div>

                    <div className="space-y-4 text-center">
                      <h2 className="display text-5xl md:text-7xl font-bold tracking-tight text-white">운명 동기화 리포트</h2>
                      <p className="serif text-lg md:text-xl font-light italic text-amber-100/60 max-w-xl mx-auto">
                        사주(四柱)·MBTI·관상·손금이 만들어내는 당신만의 운명 서사
                      </p>
                      {result.hybrid.syncTimestamp && (
                        <div className="inline-flex px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-amber-200/60">
                          Sync: {result.hybrid.syncTimestamp}
                        </div>
                      )}
                    </div>

                    {/* 중앙 스코어 + 사주 4주(柱) 카드 */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-4 md:py-8">
                      {/* 운명 일치도 원형 */}
                      <div className="relative">
                        <svg className="w-48 h-48 transform -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-mystic-gold/15" />
                          <circle cx="96" cy="96" r="88" stroke="url(#goldGrad)" strokeWidth="8" fill="transparent"
                            strokeDasharray={553}
                            strokeDashoffset={553 * (1 - result.hybrid.synergyScore / 100)}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#D4AF37" />
                              <stop offset="100%" stopColor="#F5DEB3" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-mystic-gold tracking-tighter">{result.hybrid.synergyScore}</span>
                          <span className="text-[9px] font-black text-mystic-gold/50 uppercase tracking-[0.2em]">운명 일치도</span>
                        </div>
                      </div>

                      {/* 사주(四柱) 미니 카드 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(result.saju.pillars).map(([key, value]) => {
                          const labels: Record<string, string> = { '年柱': '년주(年柱)', '月柱': '월주(月柱)', '日柱': '일주(日柱)', '時柱': '시주(時柱)' };
                          return (
                            <div key={key} className="w-[72px] bg-gradient-to-b from-mystic-gold/10 to-amber-900/10 border border-mystic-gold/25 rounded-xl p-2.5 text-center hover:border-mystic-gold/50 transition-colors">
                              <div className="text-[7px] font-black text-mystic-gold/60 uppercase mb-1 truncate">{labels[key] || key}</div>
                              <div className="text-base font-black text-mystic-gold tracking-tight">{addHanjaReading(value as string)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 일간(日干) + 요약 */}
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div className="flex items-center justify-center gap-4 text-white">
                        <div className="p-3 bg-mystic-gold/15 rounded-2xl border border-mystic-gold/25">
                          <Activity className="w-7 h-7 text-mystic-gold" />
                        </div>
                        <span className="serif text-3xl font-bold tracking-tight text-mystic-gold">{addHanjaReading(result.saju.element)}</span>
                      </div>
                      <div className="prose prose-invert max-w-none text-amber-100/70 text-base leading-loose font-light text-center">
                        <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.saju.summary)}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="text-center text-mystic-gold/30 text-xl tracking-[0.5em]">✦ ✧ ✦ ✧ ✦</div>

                    {/* Premium Detailed Luck Buttons */}
                    <div className="glass-panel p-6 md:p-12 shadow-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
                        <div className="space-y-3">
                          <h3 className="serif text-3xl font-bold tracking-tight">정밀 운세 분석 서비스</h3>
                          <p className="text-slate-400 text-base font-light">일간, 주간, 연간 및 테마별 정밀 분석 리포트를 확인하세요.</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {[
                            { id: 'daily', label: '일간 운세', icon: Calendar, color: 'indigo' },
                            { id: 'weekly', label: '주간 운세', icon: TrendingUp, color: 'purple' },
                            { id: 'yearly', label: '년간 운세', icon: Star, color: 'yellow' },
                            { id: 'love', label: '연애운', icon: Heart, color: 'rose' },
                            { id: 'business', label: '사업운', icon: Zap, color: 'emerald' }
                          ].map((luck) => (
                            <button
                              key={luck.id}
                              onClick={() => setShowPremiumModal({
                                type: luck.label,
                                content: (result.hybrid.detailedLuck as any)?.[luck.id] || "정밀 분석 데이터를 불러오는 중입니다..."
                              })}
                              className={`flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-mystic-accent/20 hover:border-mystic-accent/30 transition-all group relative overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              <luck.icon className={`w-5 h-5 text-slate-400 group-hover:text-mystic-accent transition-colors`} />
                              <span className="text-sm font-bold">{luck.label}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity ml-1">Premium</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ━━━ V28: 3D 디지털 트윈 & 오리지널 캐릭터 ━━━ */}
                    {result.hybrid.cartoonInfo && (
                      <section className="animate-slam grid grid-cols-1 lg:grid-cols-2 gap-10 scroll-mt-32">
                        {/* 3D Digital Twin */}
                        <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 space-y-6">
                          <h3 className="text-2xl font-serif font-black text-mystic-gold">Digital Twin Analysis</h3>
                          <div className="aspect-square bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                            {/* 여기에 3D Mesh 렌더링 로직 (추후 연동) */}
                            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                            <p className="text-mystic-gold/50 font-black text-xs animate-pulse tracking-widest relative z-10 text-center px-4">468 FACIAL MESH POINTS SYNCED<br /><span className="text-[10px] font-light text-slate-400 mt-2 block">관상 뼈대 맵핑 완료</span></p>
                          </div>
                        </div>

                        {/* Destiny Tarot Card Replacement */}
                        <DestinyTarotCard result={result} onFlip={playFlip} />
                      </section>
                    )}

                    {/* ━━━ V31: Destiny Roadmap + Alternative Solution ━━━ */}
                    {result.hybrid.worryResolution && (
                      <div id="alternative-solution" className="animate-slam bg-gradient-to-br from-[#0a0f18] via-[#111827] to-[#0a0f18] border border-[#D4AF37]/30 rounded-[3rem] p-10 md:p-16 space-y-10 relative overflow-hidden scroll-mt-32 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
                        <div className="relative z-10 space-y-8">
                          <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center p-4 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20 mb-4">
                              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#D4AF37] tracking-tight">운명 행동 로드맵</h2>
                            <p className="text-[#D4AF37]/60 text-sm md:text-base font-black uppercase tracking-[0.3em]">Destiny Action Roadmap</p>
                          </div>

                          {/* Roadmap Diagram */}
                          {(() => {
                            const text = result.hybrid.worryResolution || '';
                            // Try to parse 3 steps: split by numbered patterns or line breaks
                            const lines = text.split(/(?:\n|\r\n)+/).filter((l: string) => l.trim().length > 0);
                            const roadmapSteps = lines.length >= 3
                              ? [
                                { title: '문제의 본질 인식', description: lines.slice(0, Math.ceil(lines.length / 3)).join('\n') },
                                { title: '최적의 전환 시기', description: lines.slice(Math.ceil(lines.length / 3), Math.ceil(lines.length * 2 / 3)).join('\n') },
                                { title: '구체적 실행 계획', description: lines.slice(Math.ceil(lines.length * 2 / 3)).join('\n') },
                              ]
                              : [
                                { title: '인식과 전환', description: text.substring(0, Math.floor(text.length / 3)) },
                                { title: '최적의 시기', description: text.substring(Math.floor(text.length / 3), Math.floor(text.length * 2 / 3)) },
                                { title: '행동 실행', description: text.substring(Math.floor(text.length * 2 / 3)) },
                              ];
                            return <DestinyRoadmap steps={roadmapSteps} />;
                          })()}

                          {/* Full text fallback */}
                          <details className="mt-6 group">
                            <summary className="cursor-pointer text-center text-[#D4AF37]/40 text-xs font-black uppercase tracking-widest hover:text-[#D4AF37]/70 transition-colors">
                              ▼ 전체 분석 텍스트 보기
                            </summary>
                            <div className="mt-4 prose prose-invert prose-lg max-w-none text-[#D4AF37]/80 leading-relaxed font-light whitespace-pre-wrap break-keep text-left bg-[#050510]/60 p-8 md:p-12 rounded-3xl border border-[#D4AF37]/20 shadow-inner">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{result.hybrid.worryResolution}</ReactMarkdown>
                            </div>
                          </details>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: Share & Download */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 no-print">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Fate-Sync 운명 동기화 리포트',
                              text: `나의 운명 캐릭터는 ${result.hybrid.cartoonInfo?.characterName}! 당신의 운명도 확인해보세요.`,
                              url: window.location.href,
                            }).catch(console.error);
                          } else {
                            alert("이 브라우저는 공유 기능을 지원하지 않습니다. 링크를 복사해주세요.");
                          }
                        }}
                        className="flex-1 max-w-xs py-5 bg-white/10 hover:bg-white/20 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/10 backdrop-blur-xl"
                      >
                        <Globe className="w-5 h-5 text-indigo-400" />
                        리포트 공유하기
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex-1 max-w-xs py-5 bg-indigo-600 hover:bg-indigo-700 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-500/40"
                      >
                        <Download className="w-5 h-5" />
                        PDF 리포트 저장
                      </button>
                    </div>

                    {/* ━━━ Saju Detailed Card (Redesigned) ━━━ */}
                    <div id="saju" className="animate-slam bg-white/5 backdrop-blur-xl border border-mystic-gold/15 rounded-2xl p-8 md:p-10 space-y-6 scroll-mt-32">
                      {/* 헤더 + 키워드 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-mystic-gold/15 flex items-center justify-center border border-mystic-gold/25">
                            <Calendar className="w-6 h-6 text-mystic-gold" />
                          </div>
                          <div>
                            <h3 className="display text-xl font-bold tracking-tight">사주(四柱) 정밀 분석</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Heavenly Stems & Earthly Branches</p>
                          </div>
                        </div>
                      </div>

                      {/* 트라이어드 오브 페이트: 키워드 칩 */}
                      {result.saju.keywords?.length > 0 && (
                        <div className="mt-4 mb-2">
                          <Suspense fallback={
                            <div className="flex gap-3 justify-center mt-4">
                              {[0, 1, 2].map(i => <div key={i} className="h-10 w-32 rounded-2xl bg-white/5 animate-pulse" />)}
                            </div>
                          }>
                            <DestinyKeywordSection
                              keywords={result.saju.keywords}
                              element={result.saju.dayMasterElement || result.saju.element}
                              title="The Three Pillars of Fate"
                              showShareHook={true}
                              autoReveal={true}
                            />
                          </Suspense>
                        </div>
                      )}

                      {/* 4주 카드 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(result.saju.pillars).map(([key, value]) => {
                          const labels: Record<string, { ko: string; en: string }> = { '年柱': { ko: '년주(年柱)', en: 'Year' }, '月柱': { ko: '월주(月柱)', en: 'Month' }, '日柱': { ko: '일주(日柱)', en: 'Day' }, '時柱': { ko: '시주(時柱)', en: 'Hour' } };
                          const label = labels[key] || { ko: key, en: '' };
                          return (
                            <div key={key} className="bg-gradient-to-b from-mystic-gold/8 to-amber-900/8 border border-mystic-gold/20 rounded-xl p-3 text-center hover:border-mystic-gold/40 transition-all">
                              <div className="text-[7px] font-black text-mystic-gold/50 uppercase tracking-widest">{label.en}</div>
                              <div className="text-[9px] font-bold text-mystic-gold/70 mb-1">{label.ko}</div>
                              <div className="text-xl font-black text-mystic-gold tracking-tight">{addHanjaReading(value as string)}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 용신 + 격국 2열 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.saju.yongSin && (
                          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-amber-500/15"><Zap className="w-5 h-5 text-amber-500" /></div>
                              <div>
                                <div className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">핵심 용신</div>
                                <div className="text-2xl font-black text-white">{addHanjaReading(result.saju.yongSin)}</div>
                              </div>
                            </div>
                            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 text-sm text-slate-300 leading-relaxed">
                              {result.saju.yongSinPrinciple && <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.saju.yongSinPrinciple)}</ReactMarkdown>}
                              {result.saju.yongSinEvidence && <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.saju.yongSinEvidence)}</ReactMarkdown>}
                              {result.saju.yongSinInterpretation && <ReactMarkdown components={{ p: 'div' as any } as any}>{result.saju.yongSinInterpretation}</ReactMarkdown>}
                            </div>
                          </div>
                        )}
                        {result.saju.gyeokGuk && (
                          <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-indigo-500/15"><Award className="w-5 h-5 text-indigo-500" /></div>
                              <div>
                                <div className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest">성격 격국</div>
                                <div className="text-2xl font-black text-white">{addHanjaReading(result.saju.gyeokGuk)}</div>
                              </div>
                            </div>
                            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 text-sm text-slate-300 leading-relaxed">
                              {result.saju.gyeokGukPrinciple && <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.saju.gyeokGukPrinciple)}</ReactMarkdown>}
                              {result.saju.gyeokGukEvidence && <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.saju.gyeokGukEvidence)}</ReactMarkdown>}
                              {result.saju.gyeokGukInterpretation && <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.saju.gyeokGukInterpretation)}</ReactMarkdown>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 오행 차트 + 흐름 분석 */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                          <div className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">오행 순환 다이어그램</div>
                          <ElementFlowDiagram data={result.saju.fiveElements} dominantElement={result.saju.element} />
                          <div className="mt-4">
                            <div className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">오행 레이더 차트</div>
                            <FiveElementsChart data={result.saju.fiveElements} />
                          </div>
                        </div>
                        <div className="space-y-3">
                          {result.saju.elementalFlow && (
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3" /> 기운의 흐름</div>
                              <div className="text-sm text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto"><ReactMarkdown components={{ p: 'div' as any } as any}>{result.saju.elementalFlow}</ReactMarkdown></div>
                            </div>
                          )}
                          {result.saju.elementalInteraction && (
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                              <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">오행 상생상극</div>
                              <div className="text-sm text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto"><ReactMarkdown components={{ p: 'div' as any } as any}>{result.saju.elementalInteraction}</ReactMarkdown></div>
                            </div>
                          )}
                          {result.saju.elementalStrength && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">오행 강약</div>
                              <div className="text-sm text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto"><ReactMarkdown components={{ p: 'div' as any } as any}>{result.saju.elementalStrength}</ReactMarkdown></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 마스터 + 심리 가교 */}
                      {(result.saju.masterInsight || result.hybrid.mbtiSajuPsychologicalBridge) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.saju.masterInsight && (
                            <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
                              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Award className="w-3 h-3" /> 마스터 비기</div>
                              <div className="text-sm text-indigo-100 leading-relaxed italic max-h-[120px] overflow-y-auto"><ReactMarkdown components={{ p: 'div' as any } as any}>{result.saju.masterInsight}</ReactMarkdown></div>
                            </div>
                          )}
                          {result.hybrid.mbtiSajuPsychologicalBridge && (
                            <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                              <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BrainCircuit className="w-3 h-3" /> 사주-MBTI 심리 가교</div>
                              <div className="text-sm text-emerald-100 leading-relaxed max-h-[120px] overflow-y-auto"><ReactMarkdown components={{ p: 'div' as any } as any}>{result.hybrid.mbtiSajuPsychologicalBridge}</ReactMarkdown></div>
                            </div>
                          )}
                        </div>
                      )}

                      {result.saju.detailedElementAnalysis && (
                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">오행별 심층 분석</div>
                          <DetailedElementAnalysis analysis={result.saju.detailedElementAnalysis} counts={result.saju.fiveElements} />
                        </div>
                      )}

                      <p className="text-slate-400 text-sm leading-relaxed">
                        당신의 사주는 <span className="text-mystic-gold font-bold">{addHanjaReading(result.saju.element)}</span>의 특성을 강하게 띠고 있습니다.
                      </p>
                    </div>
                    {/* ━━━ MBTI 성향 시너지 (Redesigned) ━━━ */}
                    <div id="mbti" className="animate-slam bg-white/5 backdrop-blur-xl border border-emerald-500/15 rounded-2xl p-8 md:p-10 space-y-6 scroll-mt-32">
                      {/* 헤더 + MBTI 타입 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
                            <BrainCircuit className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="serif text-xl font-bold tracking-tight">성향 시너지</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">MBTI & Personality Synergy</p>
                          </div>
                        </div>
                        <div className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <div className="text-3xl font-black text-emerald-500">{userData.mbti}</div>
                          <div className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest">Type</div>
                        </div>
                      </div>

                      {/* 매칭 요약 */}
                      <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 italic text-emerald-100/80 text-sm leading-relaxed">
                        "{result.hybrid.mbtiMatch}"
                      </div>

                      {/* 분석 카드 그리드 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.hybrid.mbtiDestinySynergy && (
                          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">운명 데이터 연관성</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.hybrid.mbtiDestinySynergy)}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {result.hybrid.mbtiFortuneNuance && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">운세 대응 가이드</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.hybrid.mbtiFortuneNuance)}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {result.hybrid.mbtiPsychologicalReaction && (
                          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">심리적 반응 분석</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.hybrid.mbtiPsychologicalReaction)}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {result.hybrid.mbtiAcceptanceJourney && (
                          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> 수용 여정</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{result.hybrid.mbtiAcceptanceJourney}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {result.hybrid.mbtiCognitiveProcess && (
                          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BrainCircuit className="w-3 h-3" /> 인지적 처리</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{result.hybrid.mbtiCognitiveProcess}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {result.hybrid.mbtiEmotionalResponse && (
                          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Heart className="w-3 h-3" /> 정서적 반응</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{result.hybrid.mbtiEmotionalResponse}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                      {result.hybrid.mbtiBehavioralPattern && (
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">유형별 행동 지침</div>
                          <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                            <ReactMarkdown components={{ p: 'div' as any } as any}>{result.hybrid.mbtiBehavioralPattern}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Physiognomy Card - 2-col with scan image */}
                    <div id="physiognomy" className="animate-slam bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 scroll-mt-32">
                      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
                        {/* Left: Face Scan Image */}
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                              <h3 className="serif text-xl font-bold tracking-tight">관상 정밀 분석</h3>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Physiognomy</p>
                            </div>
                          </div>
                          {/* Face scan visualization */}
                          <div className="relative aspect-square rounded-2xl overflow-hidden border border-rose-500/20 bg-gradient-to-br from-rose-950 via-slate-950 to-slate-950">
                            {userData.faceImage ? (
                              <>
                                <img src={userData.faceImage} className="w-full h-full object-cover" alt="Face" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-16 h-16 text-rose-500/20" />
                              </div>
                            )}
                            {/* MediaPipe-powered 3D scan overlay — V32: interactive tooltips */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <defs>
                                <filter id="faceGlow">
                                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                                <filter id="faceGlow2">
                                  <feGaussianBlur stdDeviation="1.5" result="blur2" />
                                  <feMerge><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                              </defs>
                              {/* Corner brackets */}
                              <path d="M5,5 L5,18" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M5,5 L18,5" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M95,5 L95,18" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M95,5 L82,5" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M5,95 L5,82" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M5,95 L18,95" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M95,95 L95,82" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />
                              <path d="M95,95 L82,95" stroke="rgba(244,63,94,0.8)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)" />

                              {faceLandmarks && (
                                <>
                                  {/* Glow layer (behind) */}
                                  <path
                                    d={faceLandmarks.faceOval.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ') + ' Z'}
                                    stroke="rgba(244,63,94,0.2)" strokeWidth="2" fill="none" filter="url(#faceGlow2)"
                                  />
                                  {/* Face oval — main line */}
                                  <path
                                    d={faceLandmarks.faceOval.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ') + ' Z'}
                                    stroke="rgba(244,63,94,0.7)" strokeWidth="0.8" fill="none" filter="url(#faceGlow)"
                                  />
                                  {/* Left eye — circle + crosshair */}
                                  <circle cx={faceLandmarks.leftEye.x * 100} cy={faceLandmarks.leftEye.y * 100} r="4" stroke="rgba(56,189,248,0.8)" strokeWidth="0.7" fill="none" filter="url(#faceGlow)" />
                                  <line x1={faceLandmarks.leftEye.x * 100 - 5} y1={faceLandmarks.leftEye.y * 100} x2={faceLandmarks.leftEye.x * 100 + 5} y2={faceLandmarks.leftEye.y * 100} stroke="rgba(56,189,248,0.5)" strokeWidth="0.3" />
                                  <line x1={faceLandmarks.leftEye.x * 100} y1={faceLandmarks.leftEye.y * 100 - 5} x2={faceLandmarks.leftEye.x * 100} y2={faceLandmarks.leftEye.y * 100 + 5} stroke="rgba(56,189,248,0.5)" strokeWidth="0.3" />
                                  {/* Right eye — circle + crosshair */}
                                  <circle cx={faceLandmarks.rightEye.x * 100} cy={faceLandmarks.rightEye.y * 100} r="4" stroke="rgba(56,189,248,0.8)" strokeWidth="0.7" fill="none" filter="url(#faceGlow)" />
                                  <line x1={faceLandmarks.rightEye.x * 100 - 5} y1={faceLandmarks.rightEye.y * 100} x2={faceLandmarks.rightEye.x * 100 + 5} y2={faceLandmarks.rightEye.y * 100} stroke="rgba(56,189,248,0.5)" strokeWidth="0.3" />
                                  <line x1={faceLandmarks.rightEye.x * 100} y1={faceLandmarks.rightEye.y * 100 - 5} x2={faceLandmarks.rightEye.x * 100} y2={faceLandmarks.rightEye.y * 100 + 5} stroke="rgba(56,189,248,0.5)" strokeWidth="0.3" />
                                  {/* Nose — diamond */}
                                  <path d={`M${faceLandmarks.nose.x * 100},${faceLandmarks.nose.y * 100 - 3} L${faceLandmarks.nose.x * 100 + 2.5},${faceLandmarks.nose.y * 100} L${faceLandmarks.nose.x * 100},${faceLandmarks.nose.y * 100 + 3} L${faceLandmarks.nose.x * 100 - 2.5},${faceLandmarks.nose.y * 100} Z`} stroke="rgba(16,185,129,0.8)" strokeWidth="0.6" fill="rgba(16,185,129,0.1)" filter="url(#faceGlow)" />
                                  {/* Mouth — ellipse */}
                                  <ellipse cx={faceLandmarks.mouth.x * 100} cy={faceLandmarks.mouth.y * 100} rx="6" ry="3" stroke="rgba(236,72,153,0.8)" strokeWidth="0.7" fill="none" filter="url(#faceGlow)" />
                                  {/* Chin — small marker */}
                                  <circle cx={faceLandmarks.chin.x * 100} cy={faceLandmarks.chin.y * 100} r="2" stroke="rgba(244,63,94,0.6)" strokeWidth="0.5" fill="rgba(244,63,94,0.1)" filter="url(#faceGlow)" />
                                  {/* Connector lines with labels */}
                                  <line x1={faceLandmarks.forehead.x * 100} y1={faceLandmarks.forehead.y * 100} x2="96" y2={faceLandmarks.forehead.y * 100} stroke="rgba(244,63,94,0.3)" strokeWidth="0.3" strokeDasharray="1.5,1" />
                                  <line x1={faceLandmarks.rightEye.x * 100 + 4} y1={faceLandmarks.rightEye.y * 100} x2="96" y2={faceLandmarks.rightEye.y * 100} stroke="rgba(56,189,248,0.3)" strokeWidth="0.3" strokeDasharray="1.5,1" />
                                  <line x1={faceLandmarks.nose.x * 100 + 2.5} y1={faceLandmarks.nose.y * 100} x2="96" y2={faceLandmarks.nose.y * 100} stroke="rgba(16,185,129,0.3)" strokeWidth="0.3" strokeDasharray="1.5,1" />
                                  <line x1={faceLandmarks.mouth.x * 100 + 6} y1={faceLandmarks.mouth.y * 100} x2="96" y2={faceLandmarks.mouth.y * 100} stroke="rgba(236,72,153,0.3)" strokeWidth="0.3" strokeDasharray="1.5,1" />
                                </>
                              )}
                            </svg>
                            {/* Data panels — positioned at detected feature heights when available */}
                            {/* Data panels — positioned at detected feature heights when available */}
                            {(() => {
                              const stats = result?.physiognomy?.facialFeatures || { forehead: '0', eyes: '0', nose: '0', mouth: '0', jaw: '0' };
                              return (
                                <>
                                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">이마 {stats.forehead}</div>
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">눈 {stats.eyes}</div>
                                  </div>
                                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">코 {stats.nose}</div>
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">입 {stats.mouth}</div>
                                  </div>
                                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">턱 {stats.jaw}</span>
                                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300">
                                      {faceLandmarks ? `468 Points` : 'AI Scan'}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                            {/* V32: Interactive tooltip click zones */}
                            {[
                              { label: '이마(天庭)', desc: '천운과 초년운을 상징합니다. 넓고 매끄러운 이마는 지혜와 관록을 나타냅니다.', top: '5%', left: '25%', w: '50%', h: '18%' },
                              { label: '눈(監察官)', desc: '관찰력과 사람을 보는 눈을 의미합니다. 눈의 크기와 형태가 대인관계 성향을 결정합니다.', top: '28%', left: '15%', w: '70%', h: '15%' },
                              { label: '코(審辨官)', desc: '재물운과 자존심을 상징합니다. 코의 높이와 넓이가 재운의 크기를 나타냅니다.', top: '43%', left: '30%', w: '40%', h: '18%' },
                              { label: '입(出納官)', desc: '언변과 식복을 나타냅니다. 입술의 형태가 소통 스타일과 식생활 운을 결정합니다.', top: '65%', left: '25%', w: '50%', h: '12%' },
                              { label: '턱(地閣)', desc: '만년운과 부하운을 상징합니다. 턱의 형태가 노후와 리더십 역량을 나타냅니다.', top: '78%', left: '20%', w: '60%', h: '15%' },
                            ].map((zone, i) => (
                              <div
                                key={i}
                                className="absolute cursor-pointer hover:bg-[#D4AF37]/10 transition-colors rounded-lg"
                                style={{ top: zone.top, left: zone.left, width: zone.w, height: zone.h }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFaceTooltip({ text: `[${zone.label}] ${zone.desc}`, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
                                  setTimeout(() => setFaceTooltip(null), 4000);
                                }}
                              />
                            ))}
                            {/* V32: Tooltip display */}
                            {faceTooltip && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute z-50 max-w-[200px] bg-black/90 border border-[#D4AF37]/40 rounded-xl p-3 shadow-xl shadow-[#D4AF37]/10 pointer-events-none"
                                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                              >
                                <p className="text-[10px] text-[#D4AF37] leading-relaxed font-medium">{faceTooltip.text}</p>
                              </motion.div>
                            )}
                          </div>
                          {/* Physiognomy Score */}
                          <div className="py-4 px-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                            <div className="text-3xl font-black text-rose-500 mb-1">{result.physiognomy?.score || 0}<span className="text-lg">/100</span></div>
                            <div className="text-[10px] font-black text-rose-400/60 uppercase tracking-[0.2em]">Overall Score</div>
                          </div>
                        </div>

                        {/* Right: Physiognomy details */}
                        <div className="space-y-4">
                          <PhysiognomyScoresChart data={result.physiognomy?.facialFeatures || {}} />
                          <div className="flex flex-wrap gap-2">
                            {(result.physiognomy?.traits || []).map((trait: string) => (
                              <span key={trait} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] font-black text-rose-300 uppercase">
                                {trait}
                              </span>
                            ))}
                          </div>
                          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 break-words whitespace-normal">
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">관상 종합 해석</div>
                            <div className="text-sm text-slate-300 leading-relaxed">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{result.physiognomy?.karmaAnalysis || '관상 해석 결과가 없습니다.'}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* V41-Phase1: 자미두수 12궁 × 3D 얼굴 하이퍼-매핑 */}
                    <div className="animate-slam bg-white/5 backdrop-blur-xl border border-mystic-gold/15 rounded-2xl p-8 md:p-10 scroll-mt-32">
                      <Suspense fallback={
                        <div className="h-80 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-10 h-10 border-2 border-mystic-gold/30 border-t-mystic-gold rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] tracking-widest text-mystic-gold/40 uppercase">12궁 매핑 로딩 중...</p>
                          </div>
                        </div>
                      }>
                        <JamiFaceMesh
                          pointsData={facePointsData as number[]}
                          facialScores={(() => {
                            const measures = physiognomyToMeasures({ score: result?.physiognomy?.score, facialFeatures: result?.physiognomy?.facialFeatures });
                            return calcAllSyncs(measures);
                          })()}
                        />
                      </Suspense>
                    </div>

                    {/* V43: Golden Mandala — 황금빛 12궁 명반 다이어그램 */}
                    <div className="animate-slam bg-white/5 backdrop-blur-xl border border-mystic-gold/15 rounded-2xl p-6 md:p-8 scroll-mt-32">
                      <Suspense fallback={
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-10 h-10 border-2 border-mystic-gold/30 border-t-mystic-gold rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] tracking-widest text-mystic-gold/40 uppercase">황금 명반 생성 중...</p>
                          </div>
                        </div>
                      }>
                        <GoldenMandala
                          syncRates={(() => {
                            const measures = physiognomyToMeasures({
                              score: result?.physiognomy?.score,
                              facialFeatures: result?.physiognomy?.facialFeatures,
                            });
                            return calcAllSyncs(measures);
                          })()}
                          pointsData={facePointsData as number[]}
                          userStarId={(() => {
                            const starName = (result?.hybrid as any)?.oracleKeywords?.[0] ||
                              (result?.hybrid as any)?.tarotCardName || '';
                            const nameMap: Record<string, string> = {
                              '자미': 'ziwei', '천기': 'tianji', '태양': 'taiyang', '무곡': 'wuqu',
                              '천동': 'tiantong', '염정': 'lianzhen', '천부': 'tianfu', '태음': 'taiyin',
                              '탐랑': 'tanlang', '거문': 'jumen', '천상': 'tianxiang', '천량': 'tianliang',
                              '칠살': 'qisha', '파군': 'pojun',
                            };
                            return Object.entries(nameMap).find(([k]) => starName.includes(k))?.[1];
                          })()}
                          oracleSummary={(result?.hybrid as any)?.grandOracleReport?.summary}
                        />
                      </Suspense>
                    </div>

                    {/* V44: Soul-Sync Equation — 트리플 퓨전 방정식 */}
                    <div className="animate-slam bg-white/5 backdrop-blur-xl border border-mystic-gold/15 rounded-2xl p-6 md:p-8 scroll-mt-32">
                      <Suspense fallback={
                        <div className="h-40 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-8 h-8 border-2 border-mystic-gold/30 border-t-mystic-gold rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] tracking-widest text-mystic-gold/40 uppercase">소울-싱크 방정식 연산 중...</p>
                          </div>
                        </div>
                      }>
                        <SoulSyncEquation
                          starId={(() => {
                            const starName = (result?.hybrid as any)?.oracleKeywords?.[0] || '';
                            const nameMap: Record<string, string> = {
                              '자미': 'ziwei', '천기': 'tianji', '태양': 'taiyang', '무곡': 'wuqu',
                              '천동': 'tiantong', '염정': 'lianzhen', '천부': 'tianfu', '태음': 'taiyin',
                              '탐랑': 'tanlang', '거문': 'jumen', '천상': 'tianxiang', '천량': 'tianliang',
                              '칠살': 'qisha', '파군': 'pojun',
                            };
                            return Object.entries(nameMap).find(([k]) => starName.includes(k))?.[1] ?? 'ziwei';
                          })()}
                          mbti={((result as any)?.personality as any)?.mbtiType ?? ((result as any)?.personality as any)?.type ?? (result?.hybrid as any)?.mbtiType ?? 'ENTJ'}
                          dominantElement={(result?.saju as any)?.dominantElement ?? (result?.saju as any)?.fiveElements?.dominant ?? '화'}
                          aiAnalysis={(result?.hybrid as any)?.soulSyncAnalysis}
                        />
                      </Suspense>
                    </div>

                    {/* V45: Destiny Flex — 황금빛 명반 마스터피스 생성기 */}
                    <div id="destiny-flex-section" className="animate-slam bg-white/5 backdrop-blur-xl border border-mystic-gold/15 rounded-2xl p-6 md:p-8 scroll-mt-32">
                      <Suspense fallback={
                        <div className="h-24 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-mystic-gold/30 border-t-mystic-gold rounded-full animate-spin" />
                        </div>
                      }>
                        <DestinyFlex onExport={recordFlex}
                          starId={(() => {
                            const starName = (result?.hybrid as any)?.oracleKeywords?.[0] || '';
                            const nameMap: Record<string, string> = {
                              '자미': 'ziwei', '천기': 'tianji', '태양': 'taiyang', '무곡': 'wuqu',
                              '천동': 'tiantong', '염정': 'lianzhen', '천부': 'tianfu', '태음': 'taiyin',
                              '탐랑': 'tanlang', '거문': 'jumen', '천상': 'tianxiang', '천량': 'tianliang',
                              '칠살': 'qisha', '파군': 'pojun',
                            };
                            return Object.entries(nameMap).find(([k]) => starName.includes(k))?.[1] ?? 'ziwei';
                          })()}
                          mbti={((result as any)?.personality as any)?.mbtiType ?? (result?.hybrid as any)?.mbtiType ?? 'ENTJ'}
                          dominantElement={(result?.saju as any)?.dominantElement ?? '화'}
                          personaTitle={(result?.hybrid as any)?.soulSyncAnalysis?.personaTitle}
                          personaSubtitle={(result?.hybrid as any)?.soulSyncAnalysis?.personaSubtitle}
                          synergyScore={(result?.hybrid as any)?.soulSyncAnalysis?.synergyScore ?? 90}
                          serial={(result?.hybrid as any)?.soulSyncAnalysis?.grandMasterpieceSerial}
                          facialSyncRate={result?.physiognomy?.score}
                          oracleSummary={(result?.hybrid as any)?.grandOracleReport?.summary}
                          syncRates={(() => {
                            const { physiognomyToMeasures: ptm, calcAllSyncs: cas } = require('./utils/starSyncEngine');
                            return cas(ptm({ score: result?.physiognomy?.score, facialFeatures: result?.physiognomy?.facialFeatures }));
                          })()}
                        />
                      </Suspense>
                    </div>

                    {/* V42: Star-Soul Archive — 14주성 소울 아카이브 */}
                    <div className="animate-slam bg-white/5 backdrop-blur-xl border border-mystic-gold/15 rounded-2xl p-8 md:p-10 scroll-mt-32">
                      <Suspense fallback={
                        <div className="h-48 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-10 h-10 border-2 border-mystic-gold/30 border-t-mystic-gold rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] tracking-widest text-mystic-gold/40 uppercase">스타-소울 아카이브 로딩 중...</p>
                          </div>
                        </div>
                      }>
                        <StarSoulArchive
                          userStarId={(() => {
                            const starName = (result?.hybrid as any)?.oracleKeywords?.[0] ||
                              (result?.hybrid as any)?.tarotCardName || '';
                            const nameMap: Record<string, string> = {
                              '자미': 'ziwei', '천기': 'tianji', '태양': 'taiyang', '무곡': 'wuqu',
                              '천동': 'tiantong', '염정': 'lianzhen', '천부': 'tianfu', '태음': 'taiyin',
                              '탐랑': 'tanlang', '거문': 'jumen', '천상': 'tianxiang', '천량': 'tianliang',
                              '칠살': 'qisha', '파군': 'pojun',
                            };
                            return Object.entries(nameMap).find(([k]) => starName.includes(k))?.[1] ??
                              (['ziwei', 'tianji', 'taiyang', 'wuqu', 'tiantong', 'lianzhen', 'tianfu', 'taiyin',
                                'tanlang', 'jumen', 'tianxiang', 'tianliang', 'qisha', 'pojun'][
                                Math.abs((userData.saju?.birthDate ?? '').charCodeAt(0) ?? 0) % 14
                              ]);
                          })()}
                          facialDesc={[
                            result?.physiognomy?.facialFeatures?.eyes && `${result.physiognomy.facialFeatures.eyes} eyes`,
                            result?.physiognomy?.facialFeatures?.nose && `${result.physiognomy.facialFeatures.nose} nose`,
                            result?.physiognomy?.facialFeatures?.jaw && `${result.physiognomy.facialFeatures.jaw} jaw`,
                          ].filter(Boolean).join(', ') || 'balanced, dignified facial features'}
                        />
                      </Suspense>
                    </div>
                    {/* V48: Aether Key — 골드 멤버십 카드 section */}
                    <div id="aether-key" className="animate-slam flex flex-col items-center justify-center space-y-10 py-16 scroll-mt-32 border-y border-white/5 my-12 bg-mystic-gold/[0.02]">
                      <div className="text-center space-y-3">
                        <GoldLeafTitle className="text-4xl md:text-5xl tracking-tighter">당신의 소유권, 에테르 키</GoldLeafTitle>
                        <p className="text-mystic-gold/50 text-[10px] font-black uppercase tracking-[0.4em]">The Sovereign's Privilege</p>
                      </div>

                      <Suspense fallback={<div className="w-[320px] h-[480px] bg-white/5 animate-pulse rounded-[2.5rem]" />}>
                        <AetherKeyCard
                          userName={userData.userName || '운명의 여행자'}
                          archetype={(result?.hybrid as any)?.soulSyncAnalysis?.personaTitle || 'Destiny Pilot'}
                          serial={(result?.hybrid as any)?.soulSyncAnalysis?.grandMasterpieceSerial || '#KEY-V48'}
                          primaryStar={(() => {
                            const starName = (result?.hybrid as any)?.oracleKeywords?.[0] || '';
                            if (starName.includes('자미')) return '자미';
                            if (starName.includes('칠살')) return '칠살';
                            if (starName.includes('천동')) return '천동';
                            if (starName.includes('탐랑')) return '탐랑';
                            if (starName.includes('태양')) return '태양';
                            return 'DEFAULT';
                          })()}
                        />
                      </Suspense>

                      <div className="max-w-md text-center space-y-4 px-6">
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          이 카드는 단순한 이미지가 아닌, Fate-Sync 성소에 소속된 선택받은 여행자임을 증명하는 **에테르 아티팩트**입니다. 앞으로 공개될 모든 프리미엄 기능과 라운지 접근 권한의 열쇠가 됩니다.
                        </p>
                      </div>
                    </div>


                    {/* Palmistry Card - 2-col with scan image */}
                    <div id="palmistry" className="animate-slam bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 scroll-mt-32">
                      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
                        {/* Left: Palm Scan Image */}
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                              <Fingerprint className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="serif text-xl font-bold tracking-tight">손금 정밀 분석</h3>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Palmistry</p>
                            </div>
                          </div>
                          {/* Palm scan visualization */}
                          <div className="relative aspect-square rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-950">
                            {userData.palmImage ? (
                              <>
                                <img src={userData.palmImage} className="w-full h-full object-cover" alt="Palm" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Fingerprint className="w-16 h-16 text-blue-500/20" />
                              </div>
                            )}
                            {/* MediaPipe-powered 3D palm overlay */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <defs>
                                <filter id="palmGlow">
                                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                                <filter id="palmGlow2">
                                  <feGaussianBlur stdDeviation="1.8" result="blur2" />
                                  <feMerge><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                              </defs>
                              {/* Corner brackets */}
                              <path d="M5,5 L5,18" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M5,5 L18,5" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M95,5 L95,18" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M95,5 L82,5" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M5,95 L5,82" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M5,95 L18,95" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M95,95 L95,82" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />
                              <path d="M95,95 L82,95" stroke="rgba(56,189,248,0.8)" strokeWidth="0.8" fill="none" filter="url(#palmGlow)" />

                              {palmLandmarks && (
                                <>
                                  {/* Glow layers (behind) */}
                                  <path d={palmLandmarks.heartLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')} stroke="rgba(251,113,133,0.25)" strokeWidth="3" fill="none" filter="url(#palmGlow2)" />
                                  <path d={palmLandmarks.headLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')} stroke="rgba(56,189,248,0.25)" strokeWidth="3" fill="none" filter="url(#palmGlow2)" />
                                  <path d={palmLandmarks.lifeLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" filter="url(#palmGlow2)" />

                                  {/* Heart line (감정선) — neon pink */}
                                  <path
                                    d={palmLandmarks.heartLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')}
                                    stroke="rgba(251,113,133,0.9)" strokeWidth="1.2" fill="none" filter="url(#palmGlow)"
                                  />
                                  {/* Head line (두뇌선) — neon cyan */}
                                  <path
                                    d={palmLandmarks.headLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')}
                                    stroke="rgba(56,189,248,0.9)" strokeWidth="1.2" fill="none" filter="url(#palmGlow)"
                                  />
                                  {/* Life line (생명선) — bright white */}
                                  <path
                                    d={palmLandmarks.lifeLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')}
                                    stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" filter="url(#palmGlow)"
                                  />
                                  {/* Fate line (운명선) — neon yellow */}
                                  <path
                                    d={palmLandmarks.fateLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * 100},${p.y * 100}`).join(' ')}
                                    stroke="rgba(250,204,21,0.8)" strokeWidth="1" fill="none" strokeDasharray="2,1" filter="url(#palmGlow)"
                                  />
                                  {/* 21 joint dots — larger, glowing */}
                                  {palmLandmarks.allLandmarks.map((lm, i) => (
                                    <circle key={i} cx={lm.x * 100} cy={lm.y * 100} r="1.2" fill="rgba(56,189,248,0.6)" filter="url(#palmGlow)" />
                                  ))}
                                </>
                              )}
                            </svg>
                            {/* Data panels */}
                            {(() => {
                              const stats = result?.palmistry?.scores || { life: 0, head: 0, heart: 0, fate: 0 };
                              return (
                                <>
                                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-[6px] font-mono text-white">생명선 {stats.life}%</div>
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-blue-500/30 text-[6px] font-mono text-cyan-400">두뇌선 {stats.head}%</div>
                                  </div>
                                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">감정선 {stats.heart}%</div>
                                    <div className="px-1.5 py-0.5 rounded bg-black/70 border border-yellow-500/30 text-[6px] font-mono text-yellow-400">운명선 {stats.fate}%</div>
                                  </div>
                                  <div className="absolute bottom-2 left-0 right-0 text-center">
                                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                                      {palmLandmarks ? '21 Points' : 'AI Scan'}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          {/* Palm line scores */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: '생명선', score: result.palmistry?.scores?.life || 0, color: 'white' },
                              { label: '두뇌선', score: result.palmistry?.scores?.head || 0, color: 'cyan' },
                              { label: '감정선', score: result.palmistry?.scores?.heart || 0, color: 'rose' },
                              { label: '운명선', score: result.palmistry?.scores?.fate || 0, color: 'yellow' },
                            ].map((line, i) => (
                              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                <div className="text-[9px] text-slate-500 font-black uppercase mb-1">{line.label}</div>
                                <div className="text-sm font-black text-blue-400">{line.score}%</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Palmistry details */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: '생명선 해석', value: result.palmistry?.lifeLine || '-', score: result.palmistry?.scores?.life || 0 },
                              { label: '운명선 해석', value: result.palmistry?.fateLine || '-', score: result.palmistry?.scores?.fate || 0 },
                            ].map((item, i) => (
                              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</div>
                                <div className="text-sm font-medium text-blue-300 text-xs">{item.value}</div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${item.score}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 break-words whitespace-normal">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">손금 종합 요약</div>
                            <div className="text-sm text-slate-300 leading-relaxed text-xs">
                              <ReactMarkdown components={{ p: 'div' as any } as any}>{`두뇌선: ${result.palmistry?.headLine || '-'}\n\n감정선: ${result.palmistry?.heartLine || '-'}`}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fortune Timeline Card */}
                    <div id="timeline" className="animate-slam bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 space-y-6 scroll-mt-32">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                          <TrendingUp className="w-7 h-7 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="serif text-2xl font-bold tracking-tight">운세 타임라인</h3>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">12-Month Fortune Forecast</p>
                        </div>
                      </div>

                      <FortuneTimelineChart data={result.hybrid.fortuneTimeline} />

                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <p className="text-[10px] text-indigo-300 font-bold leading-relaxed">
                          * 이 타임라인은 사주와 현재 기운을 바탕으로 계산된 월별 운세 지수입니다.
                          점수가 높은 달에는 적극적인 활동을, 낮은 달에는 내실을 기하는 것이 좋습니다.
                        </p>
                      </div>
                    </div>

                    {/* Final Advice */}
                    <div id="advice" className="animate-slam bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 md:p-12 space-y-6 md:space-y-8 relative overflow-hidden scroll-mt-32">
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

                      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 shrink-0">
                          <Award className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                          <h3 className="text-4xl font-serif font-bold italic text-white mb-6">당신을 향한 마스터의 조언</h3>
                          <div className="prose prose-invert max-w-none text-indigo-100 text-lg leading-relaxed font-light break-words whitespace-normal">
                            <ReactMarkdown components={{ p: 'div' as any } as any}>{addHanjaReading(result.hybrid.finalAdvice)}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 처방전 및 상담 메시지 영역 */}
                    {result?.saju && (
                      <Suspense fallback={<div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" /></div>}>
                        <DestinyPrescription sajuData={result.saju} worryResolution={result.hybrid.worryResolution} />
                      </Suspense>
                    )}

                    {/* V32: Thesis Footnotes (print only) */}
                    <ThesisFootnotes />

                    {/* V33-Final: Oracle Consultation Transcript (hidden, shown only in PDF) */}
                    <Suspense fallback={null}>
                      <OracleTranscript messages={oracleChatMessages} userName={userData.userName || '사용자'} />
                    </Suspense>

                    {/* V32: Ambient toggle */}
                    <div className="flex justify-center pt-6 no-print">
                      <button
                        onClick={() => toggleAmbient(result?.saju?.dayMasterElement || result?.saju?.element)}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${isAmbientOn
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]'
                          : 'bg-white/5 border-white/10 text-slate-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/30'
                          }`}
                      >
                        {isAmbientOn ? '🔊' : '🔇'} Ambient Sound
                      </button>
                    </div>

                    {/* V36: Final Farewell & SNS Share CTA */}
                    <Suspense fallback={null}>
                      <FinalFarewell
                        result={result}
                        activeMode={activeMode}
                        onShareCard={() => {
                          document.getElementById('share-card-trigger')?.click();
                        }}
                        onDownloadPDF={handleDownloadPDF}
                        isExportingPDF={isExportingPDF}
                      />
                    </Suspense>

                    {/* V37: Golden Ledger — 황금색 방명록 */}
                    <Suspense fallback={null}>
                      <OracleGuestbook
                        soulCard={result?.hybrid?.cartoonInfo?.characterName || 'The Oracle'}
                        userName={userData.userName || '익명'}
                        element={result?.saju?.dayMasterElement || result?.saju?.element}
                      />
                    </Suspense>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-col gap-6 pt-12">
                      <button
                        onClick={() => {
                          const flexSection = document.getElementById('destiny-flex-section');
                          flexSection?.scrollIntoView({ behavior: 'smooth' });
                          triggerHaptic(10);
                        }}
                        className="flex-1 py-6 bg-gradient-to-r from-mystic-gold/40 to-amber-600/40 hover:from-mystic-gold/60 hover:to-amber-600/60 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all border border-mystic-gold/30 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(212,175,55,0.2)] mb-4"
                      >
                        <Sparkles className="w-5 h-5 text-mystic-gold" />
                        당신의 운명을 예술로 박제하세요
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="flex flex-col md:flex-row gap-6">
                        <button
                          onClick={() => setShowReceipt(true)}
                          className="flex-1 py-6 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all border border-white/10 flex items-center justify-center gap-3"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          다시 분석하기
                        </button>
                        <ShareCardGenerator
                          id="share-card-trigger"
                          tarotImageUrl={result?.hybrid?.cartoonInfo?.cartoonImageUrl}
                          characterName={result?.hybrid?.cartoonInfo?.characterName}
                          synergyScore={result?.hybrid?.synergyScore || 0}
                          keywords={result?.saju?.keywords || []}
                          userName={userData.userName || '사용자'}
                          dayMasterElement={result?.saju?.dayMasterElement || result?.saju?.element}
                        />
                        <button
                          onClick={handleDownloadPDF}
                          disabled={isExportingPDF}
                          className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isExportingPDF ? 'PDF 생성 중...' : '리포트 PDF 저장'}
                          {isExportingPDF ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm backdrop-blur-xl"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
                <button onClick={() => setError(null)} className="ml-2 hover:text-white">✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* V48: NFT Membership Card Pop-up */}
        <AnimatePresence>
          {
            showNFT && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.8, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="relative"
                >
                  <button
                    onClick={() => setShowNFT(false)}
                    className="absolute -top-12 right-0 p-3 text-white/40 hover:text-white transition-colors"
                  >
                    [ 닫기 ]
                  </button>
                  <Suspense fallback={<div className="text-white">Aether Key Loading...</div>}>
                    <AetherKeyCard
                      userName={userData.userName || 'Sovereign'}
                      archetype={result?.hybrid?.cartoonInfo?.characterName || 'The Oracle'}
                      serial="V52-AETHER-RESONANCE"
                      primaryStar={(result?.saju as any)?.keywords?.[0] || '자미'}
                      tier="GOLD"
                    />
                  </Suspense>
                  <div className="mt-8 text-center space-y-2">
                    <p className="text-mystic-gold font-black tracking-widest text-xs uppercase animate-pulse">Destiny Authenticated</p>
                    <p className="text-white/40 text-[10px]">운명을 기록한 당신에게 수여되는 황금의 인장입니다.</p>
                  </div>
                </motion.div>
              </motion.div>
            )
          }
        </AnimatePresence>

        <Suspense fallback={null}>
          <DestinyReceipt
            isOpen={showReceipt}
            onClose={() => { setShowReceipt(false); setStep('SAJU'); }}
            userName={userData.userName || '운명의 여행자'}
            soulCard={result?.hybrid?.cartoonInfo?.characterName || 'The Oracle'}
            element={result?.saju?.dayMasterElement || result?.saju?.element}
            synergyScore={result?.hybrid?.synergyScore || 88}
            keywords={result?.saju?.keywords || []}
            oracleMessage={result?.overallSummary || '당신의 운명은 이미 쓰여졌습니다.'}
          />
        </Suspense>

        <Footer />
      </div>

      <EnergyPulse active={showEnergy} />
      <AetherTrail />

      {/* V50 Genesis: Global Error Sanctuary */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-sm space-y-6"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
              <h2 className="text-2xl font-serif font-black text-white">운명의 흐름이 잠시 끊겼습니다</h2>
              <p className="text-slate-400 text-sm leading-relaxed">우주의 데이터가 구름에 가려져 동기화에 실패했습니다. 다시 한번 시도해 주시기 바랍니다.</p>
              <button
                onClick={() => { setError(null); setStep('LANDING'); }}
                className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all font-sans uppercase tracking-[0.2em] text-[10px]"
              >
                성소로 돌아가기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
