import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { 
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
  List
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
import { analyzeFate } from './services/fateService';
import { detectFaceLandmarks, detectPalmLandmarks, FaceLandmarkData, PalmLandmarkData } from './services/mediapipeAnalysis';
import { generateTarotCard, downloadTarotCard, generateAiTarotImage } from './services/characterGen';
import { addHanjaReading, formatPillars } from './utils/hanjaUtils';

// Window type declarations removed - using .env for API key management

// --- Sub-components ---

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
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-mystic-accent ${
                (item === 'Home' && step === 'LANDING') ? 'text-mystic-accent' : 'text-slate-500'
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
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
              <div className="w-6 h-6 bg-mystic-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">My Destiny</span>
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              isActive ? 'bg-indigo-600 text-white shadow-lg scale-110' : 
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

const App: React.FC = () => {
  const [step, setStep] = useState<FateStep>('LANDING');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminCredentials] = useState({ id: 'admin@fatesync.com', pw: 'admin1234' });
  const [userData, setUserData] = useState<UserFateData>({
    saju: { birthDate: '', birthTime: '', isLunar: false, gender: 'MALE' }
  });

  const handleSajuChange = (field: keyof SajuData, value: any) => {
    setUserData(prev => ({
      ...prev,
      saju: { ...prev.saju!, [field]: value }
    }));
  };
  const [result, setResult] = useState<FateAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState<{ type: string; content: string } | null>(null);
  const [scanStage, setScanStage] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarkData | null>(null);
  const [palmLandmarks, setPalmLandmarks] = useState<PalmLandmarkData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExportingPDF(true);
    
    const element = reportRef.current;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `FateSync_Report_${result?.hybrid.cartoonInfo?.characterName || 'Destiny'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#030305',
        logging: false
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 브라우저의 인쇄 기능을 이용해 주세요.');
    } finally {
      setIsExportingPDF(false);
    }
  };
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const loadingMessages = [
    "우주의 기운을 모으고 있습니다...",
    "당신의 생년월일에 담긴 비밀을 해독 중입니다...",
    "오행의 상생상극 흐름을 분석하고 있습니다...",
    "관상과 손금의 미세한 특징을 추출하고 있습니다...",
    "MBTI 성향과 운명의 시너지를 계산 중입니다...",
    "당신과 닮은 운명적 캐릭터를 찾고 있습니다...",
    "거의 다 되었습니다. 잠시만 기다려주세요...",
    "마스터의 깊은 통찰을 리포트에 담고 있습니다..."
  ];

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

  const handleNext = () => {
    if (step === 'SAJU') setStep('FACE');
    else if (step === 'FACE') setStep('MBTI');
    else if (step === 'MBTI') setStep('PALM');
    else if (step === 'PALM') startAnalysis();
  };

  const handleBack = () => {
    if (step === 'FACE') setStep('SAJU');
    else if (step === 'MBTI') setStep('FACE');
    else if (step === 'PALM') setStep('MBTI');
    else if (step === 'SAJU') setStep('LANDING');
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
      // MediaPipe 랜드마크 감지 (Gemini 호출과 병렬 실행)
      const [res, faceData, palmData] = await Promise.all([
        analyzeFate(userData),
        userData.faceImage ? detectFaceLandmarks(userData.faceImage).catch(e => { console.warn('Face detection failed:', e); return null; }) : Promise.resolve(null),
        userData.palmImage ? detectPalmLandmarks(userData.palmImage).catch(e => { console.warn('Palm detection failed:', e); return null; }) : Promise.resolve(null),
      ]);
      clearTimeout(timeoutId);
      
      if (faceData) setFaceLandmarks(faceData);
      if (palmData) setPalmLandmarks(palmData);
      console.log('MEDIAPIPE: Face landmarks:', faceData ? '✅ detected' : '❌ none', ', Palm landmarks:', palmData ? '✅ detected' : '❌ none');
      
      // 타로카드 생성: AI 이미지 생성 시도 → 실패 시 Canvas 합성
      if (res.hybrid.cartoonInfo && userData.faceImage) {
        const cardNameKR = res.hybrid.cartoonInfo.characterName?.split('(')[0]?.trim() || '운명의 카드';
        const cardNameEN = res.hybrid.cartoonInfo.characterName?.match(/\(([^)]+)\)/)?.[1] || 'Destiny';
        const numeral = res.hybrid.cartoonInfo.tarotNumeral || 'I';
        const colorPalette = res.hybrid.cartoonInfo.tarotColorPalette || 'purple-gold';
        
        // 1차: AI 이미지 생성 시도 (Gemini의 visualPrompt 사용)
        let aiImageGenerated = false;
        if (res.hybrid.cartoonInfo.visualPrompt) {
          console.log('TAROT-AI: AI 타로카드 이미지 생성 시도...');
          try {
            const userName = userData.userName || '사용자';
            const aiImage = await generateAiTarotImage(
              res.hybrid.cartoonInfo.visualPrompt, 
              numeral, 
              userName, 
              cardNameEN,
              userData.faceImage
            );
            if (aiImage) {
              res.hybrid.cartoonInfo.cartoonImageUrl = aiImage;
              aiImageGenerated = true;
              console.log('TAROT-AI: ✅ AI 타로카드 이미지 생성 성공!');
            }
          } catch (e) {
            console.warn('TAROT-AI: AI 생성 실패, Canvas fallback 사용:', e);
          }
        }
        
        // 2차: Canvas 합성 fallback
        if (!aiImageGenerated) {
          console.log('TAROT-CANVAS: Canvas 타로카드 합성 시작...');
          try {
            const tarotImage = await generateTarotCard(
              userData.faceImage, cardNameKR, cardNameEN, numeral, colorPalette
            );
            res.hybrid.cartoonInfo.cartoonImageUrl = tarotImage;
            console.log('TAROT-CANVAS: ✅ 타로카드 합성 완료!');
          } catch (e) {
            console.warn('TAROT-CANVAS: 합성 실패:', e);
          }
        }
      }
      
      setScanStage(4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult(res);
      setStep('REPORT');
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
      setStep('PALM');
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
                    <ReactMarkdown>{showPremiumModal.content}</ReactMarkdown>
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
          <header className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-mystic-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mystic-accent/80">Universal Fate Engine v2.0</span>
            </motion.div>
            <h1 className="serif text-5xl md:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">
              당신의 운명을 <br className="md:hidden" /> 동기화하세요
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-xl font-light leading-relaxed">
              사주, 관상, MBTI, 손금을 결합한 <br className="md:hidden" />
              국내 최초의 하이브리드 인공지능 운명 분석 플랫폼
            </p>
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
                className="text-center space-y-32 w-full pt-20"
              >
                <div className="space-y-12 max-w-6xl mx-auto px-6">
                  <motion.div
                    initial={{ scale: 1.2, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-6"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                      <Film className="w-4 h-4 text-mystic-accent" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mystic-accent/80">Anime Destiny Transformation</span>
                    </div>
                    <h1 className="display text-[15vw] md:text-[12vw] leading-[0.85] tracking-tighter text-white">
                      SYNC YOUR <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-mystic-accent via-indigo-400 to-mystic-gold">ANIME FATE</span>
                    </h1>
                    <p className="serif text-xl md:text-3xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
                      사주, 관상, 손금, MBTI를 통합 분석하여 <br className="md:hidden" />
                      당신과 가장 닮은 만화 캐릭터로 변신하고 운명을 확인하세요.
                    </p>
                  </motion.div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStep(isLoggedIn ? 'SAJU' : 'LOGIN')}
                      className="group relative px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-mystic-accent hover:text-white shadow-[0_20px_50px_rgba(255,255,255,0.1)] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-4">
                        운명 분석 시작하기
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
                  {[
                    { icon: ShieldCheck, title: "AI 정밀 분석", desc: "고도화된 AI 명리학 엔진", color: "text-emerald-400" },
                    { icon: Film, title: "캐릭터 변신", desc: "당신과 닮은 주인공으로 변신", color: "text-mystic-accent" },
                    { icon: Globe, title: "글로벌 통찰", desc: "동서양을 아우르는 운명학", color: "text-mystic-gold" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="p-10 rounded-[2.5rem] glass-panel hover:bg-white/5 transition-all group text-left border-white/5"
                    >
                      <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <h3 className="serif text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6">{item.desc}</p>
                      <div className="h-px w-12 bg-white/10 group-hover:w-full transition-all duration-500" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'LOGIN' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
              >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl space-y-8">
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
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                className="w-full max-w-md"
              >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl space-y-8">
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
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="name@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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

            {['SAJU', 'FACE', 'MBTI', 'PALM'].includes(step) && (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl"
              >
                <StepIndicator currentStep={step} />

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                  {step === 'SAJU' && (
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="display text-3xl font-bold tracking-tight">태어난 순간의 기록</h2>
                        <p className="serif text-slate-400 text-lg italic">정확한 사주 분석을 위해 생년월일시를 입력해주세요.</p>
                      </div>
                      {/* 이름 입력 */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">이름</label>
                        <input 
                          type="text" 
                          placeholder="이름을 입력하세요"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                          value={userData.userName || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, userName: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">생년월일</label>
                          <input 
                            type="date" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            onChange={(e) => handleSajuChange('birthDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">태어난 시간</label>
                          <input 
                            type="time" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            onChange={(e) => handleSajuChange('birthTime', e.target.value)}
                          />
                        </div>
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
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="display text-3xl font-bold tracking-tight">얼굴에 담긴 운명</h2>
                        <p className="serif text-slate-400 text-lg italic">정면 사진을 업로드하여 관상을 분석합니다.</p>
                      </div>
                      <div className="relative aspect-square max-w-[280px] mx-auto group">
                        <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-[3rem] group-hover:border-indigo-500 transition-colors" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleImageUpload('faceImage', e)}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          {userData.faceImage ? (
                            <img src={userData.faceImage} className="w-full h-full object-cover rounded-[3rem]" alt="Face" />
                          ) : (
                            <>
                              <Camera className="w-12 h-12 text-slate-500" />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">사진 업로드</span>
                              <span className="text-[10px] text-slate-600 font-medium">(선택 사항)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 'MBTI' && (
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="display text-3xl font-bold tracking-tight">현대적 성향 분석</h2>
                        <p className="serif text-slate-400 text-lg italic">당신의 MBTI 유형을 선택해주세요.</p>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {MBTI_LIST.map(type => (
                          <button
                            key={type}
                            onClick={() => setUserData(prev => ({ ...prev, mbti: type as MBTIType }))}
                            className={`py-4 rounded-2xl text-sm font-black transition-all border ${
                              userData.mbti === type 
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
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="display text-3xl font-bold tracking-tight">손바닥의 지도</h2>
                        <p className="serif text-slate-400 text-lg italic">손바닥 사진을 업로드하여 손금을 분석합니다.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mt-2">
                          <Info className="w-3 h-3 text-indigo-400" />
                          <span className="text-[10px] text-indigo-300 font-bold">남성은 왼손, 여성은 오른손을 권장합니다.</span>
                        </div>
                      </div>
                      <div className="relative aspect-square max-w-[280px] mx-auto group">
                        <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-[3rem] group-hover:border-indigo-500 transition-colors" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleImageUpload('palmImage', e)}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          {userData.palmImage ? (
                            <img src={userData.palmImage} className="w-full h-full object-cover rounded-[3rem]" alt="Palm" />
                          ) : (
                            <>
                              <Fingerprint className="w-12 h-12 text-slate-500" />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">사진 업로드</span>
                              <span className="text-[10px] text-slate-600 font-medium">(선택 사항)</span>
                            </>
                          )}
                        </div>
                      </div>
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
                          onClick={handleBack}
                          className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          이전
                        </button>
                      )}
                      <button 
                        onClick={handleNext}
                        className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
                      >
                        {step === 'PALM' 
                          ? (userData.palmImage ? '분석 시작하기' : '건너뛰고 분석하기') 
                          : step === 'FACE' 
                            ? (userData.faceImage ? '다음 단계' : '건너뛰기') 
                            : '다음 단계'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'ANALYZING' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-12 w-full max-w-4xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
                  {/* Face Scan */}
                  {userData.faceImage ? (
                    <div className="relative aspect-square max-w-[300px] mx-auto rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                      <img src={userData.faceImage} className="w-full h-full object-cover opacity-40" alt="Face Scan" />
                      <div className="absolute inset-0 bg-indigo-500/10" />
                      
                      {/* Scan Line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] z-20"
                      />

                      {/* Face Landmarks SVG */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                        {/* Eyes - Stage 1 */}
                        <motion.ellipse cx="35" cy="40" rx="6" ry="4" stroke="cyan" strokeWidth="0.8" fill="none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: scanStage >= 1 ? 1 : 0, scale: scanStage === 1 ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <motion.ellipse cx="65" cy="40" rx="6" ry="4" stroke="cyan" strokeWidth="0.8" fill="none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: scanStage >= 1 ? 1 : 0, scale: scanStage === 1 ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        {/* Iris/Pupil */}
                        <motion.circle cx="35" cy="40" r="1.5" fill="cyan" 
                          animate={{ opacity: scanStage >= 1 ? [0.4, 1, 0.4] : 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.circle cx="65" cy="40" r="1.5" fill="cyan" 
                          animate={{ opacity: scanStage >= 1 ? [0.4, 1, 0.4] : 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />

                        {/* Nose - Stage 2 */}
                        <motion.path d="M50,35 L46,55 L54,55 Z" stroke="cyan" strokeWidth="0.8" fill="none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: scanStage >= 2 ? 1 : 0 }}
                          transition={{ duration: 0.5 }}
                        />

                        {/* Mouth - Stage 3 */}
                        <motion.path d="M38,68 Q50,75 62,68" stroke="cyan" strokeWidth="0.8" fill="none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: scanStage >= 3 ? 1 : 0 }}
                          transition={{ duration: 0.5 }}
                        />
                        <motion.path d="M42,70 Q50,73 58,70" stroke="cyan" strokeWidth="0.4" fill="none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: scanStage >= 3 ? 1 : 0 }}
                          transition={{ duration: 0.5 }}
                        />

                        {/* Face Outline - Stage 0 */}
                        <motion.path d="M30,20 Q50,10 70,20 Q85,50 70,80 Q50,95 30,80 Q15,50 30,20" stroke="indigo" strokeWidth="0.5" fill="none" strokeDasharray="4,2"
                          animate={{ rotate: [0, 1, -1, 0] }}
                          transition={{ duration: 5, repeat: Infinity }}
                        />
                      </svg>

                      {/* Landmark Dots */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              x: Math.random() * 300,
                              y: Math.random() * 300
                            }}
                            transition={{ duration: 2, delay: Math.random() * 2, repeat: Infinity }}
                            className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
                          />
                        ))}
                      </div>
                      
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-500 ${
                          scanStage === 4 
                            ? "bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                            : "bg-black/80 border-indigo-500/30 text-indigo-300"
                        }`}>
                          {scanStage === 0 && "Initializing Face Map..."}
                          {scanStage === 1 && "Detecting Eye Patterns..."}
                          {scanStage === 2 && "Analyzing Nasal Structure..."}
                          {scanStage === 3 && "Mapping Oral Features..."}
                          {scanStage === 4 && "Face Analysis Complete"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square max-w-[300px] mx-auto rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5">
                      <Camera className="w-12 h-12 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Face Data Estimated by AI</span>
                    </div>
                  )}

                  {/* Palm Scan */}
                  {userData.palmImage ? (
                    <div className="relative aspect-square max-w-[300px] mx-auto rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                      <img src={userData.palmImage} className="w-full h-full object-cover opacity-40" alt="Palm Scan" />
                      <div className="absolute inset-0 bg-purple-500/10" />
                      
                      {/* Scan Line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        className="absolute left-0 right-0 h-1 bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.8)] z-20"
                      />

                      {/* Palm Lines Overlay */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                        {/* Life Line */}
                        <motion.path 
                          d="M35,35 Q45,65 55,85" 
                          stroke="white" strokeWidth="1.2" fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: scanStage >= 1 ? 1 : 0 }}
                          transition={{ duration: 1.5 }}
                        />
                        {/* Wisdom Line */}
                        <motion.path 
                          d="M35,45 Q65,55 85,50" 
                          stroke="cyan" strokeWidth="1.2" fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: scanStage >= 2 ? 1 : 0 }}
                          transition={{ duration: 1.5 }}
                        />
                        {/* Heart Line */}
                        <motion.path 
                          d="M35,30 Q65,25 85,35" 
                          stroke="#ff007f" strokeWidth="1.2" fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: scanStage >= 3 ? 1 : 0 }}
                          transition={{ duration: 1.5 }}
                        />
                        {/* Fate Line */}
                        <motion.path 
                          d="M55,85 L55,15" 
                          stroke="gold" strokeWidth="1.2" fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: scanStage >= 0 ? 1 : 0 }}
                          transition={{ duration: 2 }}
                        />
                      </svg>
                      
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-500 ${
                          scanStage === 4 
                            ? "bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                            : "bg-black/80 border-purple-500/30 text-purple-300"
                        }`}>
                          {scanStage === 0 && "Tracing Fate Line..."}
                          {scanStage === 1 && "Analyzing Life Vitality..."}
                          {scanStage === 2 && "Measuring Wisdom Depth..."}
                          {scanStage === 3 && "Decoding Heart Resonance..."}
                          {scanStage === 4 && "Palmistry Analysis Complete"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square max-w-[300px] mx-auto rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5">
                      <Fingerprint className="w-12 h-12 text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Palm Data Estimated by AI</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black tracking-tight">
                      {scanStage === 4 ? "동기화 완료!" : "운명 동기화 중..."}
                    </h2>
                    <div className="w-full max-w-xs mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: scanStage === 4 ? "100%" : "95%" }}
                        transition={{ duration: scanStage === 4 ? 0.5 : 15, ease: "linear" }}
                        className={`h-full bg-gradient-to-r ${scanStage === 4 ? "from-emerald-500 to-teal-500" : "from-indigo-500 to-purple-500"}`}
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
                      <motion.p 
                        key={loadingMessageIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-indigo-300 min-h-[1.5em]"
                      >
                        {loadingMessages[loadingMessageIndex]}
                      </motion.p>
                      <motion.p 
                        animate={{ opacity: scanStage === 4 ? 1 : [0.4, 1, 0.4] }} 
                        transition={{ duration: 1.5, repeat: scanStage === 4 ? 0 : Infinity }}
                        className={scanStage === 4 ? "text-emerald-400" : ""}
                      >
                        {scanStage === 0 && "Saju Engine Initialization"}
                        {scanStage === 1 && "Biometric Feature Extraction"}
                        {scanStage === 2 && "Neural Pattern Matching"}
                        {scanStage === 3 && "Destiny Synergy Calculation"}
                        {scanStage === 4 && "Synchronized with Universal Flow"}
                      </motion.p>
                      <p className="text-[8px] opacity-50">
                        Reference Time: {new Date().toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'REPORT' && result && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl space-y-12 pb-20 relative px-4 md:px-8"
              >
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Sticky TOC Sidebar */}
                  <aside className="hidden lg:block w-64 shrink-0">
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

                  {/* Main Report Content */}
                  <div ref={reportRef} id="report-content" className="flex-1 space-y-12 pb-20">
                    {/* ━━━ Summary Card (Tarot Theme) ━━━ */}
                    <div id="summary" className="animate-slam bg-gradient-to-br from-[#1a0a2e] via-[#0f0620] to-[#0a0318] rounded-[3rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden scroll-mt-32 border border-mystic-gold/15">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-mystic-gold/8 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                   
                      <div className="relative z-10 space-y-8">
                        {/* 타로카드 스타일 장식 */}
                        <div className="text-center space-y-2">
                          <div className="text-mystic-gold/40 text-xl tracking-[0.5em]">✦ ✧ ✦ ✧ ✦</div>
                          <div className="inline-flex items-center gap-2 px-6 py-2 bg-mystic-gold/10 backdrop-blur-md rounded-full text-mystic-gold text-[10px] font-black uppercase tracking-[0.3em] border border-mystic-gold/30">
                            <Sparkles className="w-4 h-4" />
                            Integrated Destiny Sync Result
                          </div>
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
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8">
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
                          <div className="grid grid-cols-4 gap-3">
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
                            <ReactMarkdown>{addHanjaReading(result.saju.summary)}</ReactMarkdown>
                          </div>
                        </div>

                        <div className="text-center text-mystic-gold/30 text-xl tracking-[0.5em]">✦ ✧ ✦ ✧ ✦</div>
                      </div>
                    </div>

                {/* Premium Detailed Luck Buttons */}
                <div className="glass-panel p-10 md:p-12 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
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

                {/* ━━━ Destiny Character Card (Redesigned) ━━━ */}
                {result.hybrid.cartoonInfo && (
                  <div id="character" className="animate-slam glass-panel p-8 md:p-12 shadow-2xl overflow-hidden relative scroll-mt-32">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-mystic-accent/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    {/* 헤더 */}
                    <div className="text-center mb-8 relative z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mystic-accent/10 border border-mystic-accent/20 mb-4">
                        <BrainCircuit className="w-4 h-4 text-mystic-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-mystic-accent/80">Destiny Character Card</span>
                      </div>
                      <h2 className="serif text-xl md:text-2xl font-bold tracking-tight mb-2">
                        {userData.userName || '사용자'}님의 운명 캐릭터
                      </h2>
                      <div className="text-transparent bg-clip-text bg-gradient-to-r from-mystic-gold via-mystic-accent to-indigo-400 text-2xl md:text-3xl font-black tracking-tight">
                        {result.hybrid.cartoonInfo.characterName}
                      </div>
                      {result.hybrid.cartoonInfo.originWork && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 mt-3">
                          🃏 {result.hybrid.cartoonInfo.originWork}
                        </div>
                      )}
                    </div>

                    {/* 카드 + 정보 그리드 */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
                      
                      {/* 좌측: 플립 카드 */}
                      <div className="w-full lg:w-auto flex-shrink-0 mx-auto lg:mx-0">
                        <motion.div 
                          className="relative cursor-pointer w-[280px] md:w-[320px] mx-auto"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, type: 'spring' }}
                          onClick={() => setCardFlipped(!cardFlipped)}
                          style={{ perspective: '1000px' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-mystic-accent/20 to-indigo-600/20 rounded-3xl blur-2xl" />
                          <div 
                            className="relative aspect-[2/3] transition-transform duration-700" 
                            style={{ 
                              transformStyle: 'preserve-3d',
                              transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                            }}
                          >
                            {/* 앞면 */}
                            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                              {result.hybrid.cartoonInfo.cartoonImageUrl ? (
                                <motion.img 
                                  initial={{ filter: 'brightness(0) blur(10px)' }}
                                  animate={{ filter: 'brightness(1) blur(0px)' }}
                                  transition={{ delay: 0.3, duration: 0.8 }}
                                  src={result.hybrid.cartoonInfo.cartoonImageUrl} 
                                  className="w-full h-full object-cover" 
                                  alt={result.hybrid.cartoonInfo.characterName} 
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
                                  <div className="text-center space-y-3">
                                    <Sparkles className="w-12 h-12 text-mystic-accent/40 mx-auto animate-pulse" />
                                    <div className="text-sm text-white/50">이미지 생성 중...</div>
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[8px] text-white/50 font-bold">
                                탭하여 뒤집기
                              </div>
                            </div>
                            
                            {/* 뒷면 */}
                            <div 
                              className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-[#1a0e2e] via-[#12081f] to-[#0d0618] p-6 flex flex-col justify-between"
                              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                              <div className="space-y-3">
                                <div className="text-center">
                                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-mystic-gold/70 mb-1">✦ FATE-SYNC ✦</div>
                                  <div className="text-lg font-black text-white">{result.hybrid.cartoonInfo.characterName}</div>
                                  <div className="text-[10px] text-mystic-accent/50 font-bold">{result.hybrid.cartoonInfo.originWork}</div>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-mystic-gold/20 to-transparent" />
                                {result.hybrid.cartoonInfo.appearanceContext && (
                                  <p className="text-amber-100/70 text-[11px] leading-relaxed">{result.hybrid.cartoonInfo.appearanceContext}</p>
                                )}
                                {result.hybrid.cartoonInfo.archetypeTraits && (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {result.hybrid.cartoonInfo.archetypeTraits.map((trait, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-mystic-accent/10 border border-mystic-accent/20 text-mystic-accent/80">
                                        {trait}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {result.hybrid.cartoonInfo.characterQuote && (
                                  <p className="serif text-xs italic text-white/50 text-center leading-relaxed">"{result.hybrid.cartoonInfo.characterQuote}"</p>
                                )}
                              </div>
                              <div className="text-center pt-2">
                                <div className="text-sm font-black text-mystic-gold/50">{userData.userName || '사용자'}</div>
                                <div className="text-[7px] text-slate-600 uppercase tracking-widest mt-1">탭하여 앞면</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* 공유/다운로드 */}
                        {result.hybrid.cartoonInfo.cartoonImageUrl && (
                          <div className="flex gap-2 justify-center mt-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadTarotCard(result.hybrid.cartoonInfo!.cartoonImageUrl!, result.hybrid.cartoonInfo!.characterName || 'tarot'); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-mystic-gold/10 border border-mystic-gold/30 rounded-xl text-mystic-gold text-xs font-black hover:bg-mystic-gold/20 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              저장
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const imgUrl = result.hybrid.cartoonInfo!.cartoonImageUrl!;
                                if (navigator.share) {
                                  try {
                                    const response = await fetch(imgUrl);
                                    const blob = await response.blob();
                                    const file = new File([blob], 'fate-sync-tarot.png', { type: 'image/png' });
                                    await navigator.share({ title: `${userData.userName || '나'}의 운명 캐릭터`, files: [file] });
                                  } catch { downloadTarotCard(imgUrl, result.hybrid.cartoonInfo!.characterName || 'tarot'); }
                                } else { downloadTarotCard(imgUrl, result.hybrid.cartoonInfo!.characterName || 'tarot'); }
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 border border-indigo-400/30 rounded-xl text-indigo-300 text-xs font-black hover:bg-indigo-500/20 transition-all"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              공유
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 우측: 컴팩트 정보 */}
                      <div className="flex-1 min-w-0 space-y-5">
                        {/* 왜 이 캐릭터인가? */}
                        {result.hybrid.cartoonInfo.appearanceContext && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                            <div className="text-[9px] font-black text-amber-400 uppercase tracking-[0.15em] mb-1.5">💡 왜 이 캐릭터인가?</div>
                            <p className="text-amber-100/80 text-sm leading-relaxed">{result.hybrid.cartoonInfo.appearanceContext}</p>
                          </div>
                        )}

                        {/* 키워드 배지 */}
                        {result.hybrid.cartoonInfo.archetypeTraits && (
                          <div className="flex flex-wrap gap-2">
                            {result.hybrid.cartoonInfo.archetypeTraits.map((trait, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-black bg-mystic-accent/15 border border-mystic-accent/25 text-mystic-accent">
                                ✦ {trait}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 대사 */}
                        {result.hybrid.cartoonInfo.characterQuote && (
                          <div className="py-4 px-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="serif text-base italic text-white/70 leading-relaxed">
                              "{result.hybrid.cartoonInfo.characterQuote}"
                            </p>
                          </div>
                        )}

                        {/* 운명적 연결 분석 (스크롤 가능) */}
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-mystic-accent uppercase tracking-[0.2em]">운명적 연결 분석</div>
                          <div className="max-h-[280px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {result.hybrid.cartoonInfo.characterDetail && (
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-indigo-400/40 rounded-full" />
                                <div className="text-slate-300 leading-relaxed text-sm pl-4">
                                  <ReactMarkdown>{result.hybrid.cartoonInfo.characterDetail}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                            {result.hybrid.cartoonInfo.description && (
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-mystic-accent/40 rounded-full" />
                                <div className="text-slate-300 leading-relaxed text-sm pl-4">
                                  <ReactMarkdown>{result.hybrid.cartoonInfo.description}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
                      <div className="hidden md:flex flex-wrap gap-1.5 justify-end max-w-[50%]">
                        {result.saju.keywords.map(kw => (
                          <span key={kw} className="px-3 py-1 bg-mystic-gold/10 border border-mystic-gold/20 rounded-full text-[10px] font-black text-mystic-gold">#{kw}</span>
                        ))}
                      </div>
                    </div>

                    {/* 4주 카드 */}
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(result.saju.pillars).map(([key, value]) => {
                        const labels: Record<string, { ko: string; en: string }> = { '年柱': {ko:'년주(年柱)',en:'Year'}, '月柱': {ko:'월주(月柱)',en:'Month'}, '日柱': {ko:'일주(日柱)',en:'Day'}, '時柱': {ko:'시주(時柱)',en:'Hour'} };
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
                            {result.saju.yongSinPrinciple && <ReactMarkdown>{addHanjaReading(result.saju.yongSinPrinciple)}</ReactMarkdown>}
                            {result.saju.yongSinEvidence && <ReactMarkdown>{addHanjaReading(result.saju.yongSinEvidence)}</ReactMarkdown>}
                            {result.saju.yongSinInterpretation && <ReactMarkdown>{result.saju.yongSinInterpretation}</ReactMarkdown>}
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
                            {result.saju.gyeokGukPrinciple && <ReactMarkdown>{addHanjaReading(result.saju.gyeokGukPrinciple)}</ReactMarkdown>}
                            {result.saju.gyeokGukEvidence && <ReactMarkdown>{addHanjaReading(result.saju.gyeokGukEvidence)}</ReactMarkdown>}
                            {result.saju.gyeokGukInterpretation && <ReactMarkdown>{addHanjaReading(result.saju.gyeokGukInterpretation)}</ReactMarkdown>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 오행 차트 + 흐름 분석 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <div className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">오행 분포도</div>
                        <FiveElementsChart data={result.saju.fiveElements} />
                      </div>
                      <div className="space-y-3">
                        {result.saju.elementalFlow && (
                          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3" /> 기운의 흐름</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto"><ReactMarkdown>{result.saju.elementalFlow}</ReactMarkdown></div>
                          </div>
                        )}
                        {result.saju.elementalInteraction && (
                          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">오행 상생상극</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto"><ReactMarkdown>{result.saju.elementalInteraction}</ReactMarkdown></div>
                          </div>
                        )}
                        {result.saju.elementalStrength && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">오행 강약</div>
                            <div className="text-sm text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto"><ReactMarkdown>{result.saju.elementalStrength}</ReactMarkdown></div>
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
                            <div className="text-sm text-indigo-100 leading-relaxed italic max-h-[120px] overflow-y-auto"><ReactMarkdown>{result.saju.masterInsight}</ReactMarkdown></div>
                          </div>
                        )}
                        {result.hybrid.mbtiSajuPsychologicalBridge && (
                          <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BrainCircuit className="w-3 h-3" /> 사주-MBTI 심리 가교</div>
                            <div className="text-sm text-emerald-100 leading-relaxed max-h-[120px] overflow-y-auto"><ReactMarkdown>{result.hybrid.mbtiSajuPsychologicalBridge}</ReactMarkdown></div>
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
                          <ReactMarkdown>{addHanjaReading(result.hybrid.mbtiDestinySynergy)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {result.hybrid.mbtiFortuneNuance && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">운세 대응 가이드</div>
                        <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                          <ReactMarkdown>{addHanjaReading(result.hybrid.mbtiFortuneNuance)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {result.hybrid.mbtiPsychologicalReaction && (
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">심리적 반응 분석</div>
                        <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                          <ReactMarkdown>{addHanjaReading(result.hybrid.mbtiPsychologicalReaction)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {result.hybrid.mbtiAcceptanceJourney && (
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> 수용 여정</div>
                        <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                          <ReactMarkdown>{result.hybrid.mbtiAcceptanceJourney}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {result.hybrid.mbtiCognitiveProcess && (
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BrainCircuit className="w-3 h-3" /> 인지적 처리</div>
                        <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                          <ReactMarkdown>{result.hybrid.mbtiCognitiveProcess}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {result.hybrid.mbtiEmotionalResponse && (
                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Heart className="w-3 h-3" /> 정서적 반응</div>
                        <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                          <ReactMarkdown>{result.hybrid.mbtiEmotionalResponse}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                  {result.hybrid.mbtiBehavioralPattern && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">유형별 행동 지침</div>
                      <div className="text-sm text-slate-300 leading-relaxed max-h-[120px] overflow-y-auto">
                        <ReactMarkdown>{result.hybrid.mbtiBehavioralPattern}</ReactMarkdown>
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
                        {/* MediaPipe-powered 3D scan overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                              <path d={`M${faceLandmarks.nose.x*100},${faceLandmarks.nose.y*100-3} L${faceLandmarks.nose.x*100+2.5},${faceLandmarks.nose.y*100} L${faceLandmarks.nose.x*100},${faceLandmarks.nose.y*100+3} L${faceLandmarks.nose.x*100-2.5},${faceLandmarks.nose.y*100} Z`} stroke="rgba(16,185,129,0.8)" strokeWidth="0.6" fill="rgba(16,185,129,0.1)" filter="url(#faceGlow)" />
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
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">이마 {result.physiognomy.scores.forehead}%</div>
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">눈 {result.physiognomy.scores.eyes}%</div>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">코 {result.physiognomy.scores.nose}%</div>
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">입 {result.physiognomy.scores.mouth}%</div>
                        </div>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">턱 {result.physiognomy.scores.chin}%</span>
                          <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300">
                            {faceLandmarks ? `468 Points` : 'AI Scan'}
                          </span>
                        </div>
                      </div>
                      {/* Physiognomy Score */}
                      <div className="py-4 px-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <div className="text-3xl font-black text-rose-500 mb-1">{result.physiognomy.score}<span className="text-lg">/100</span></div>
                        <div className="text-[10px] font-black text-rose-400/60 uppercase tracking-[0.2em]">Overall Score</div>
                      </div>
                    </div>

                    {/* Right: Physiognomy details */}
                    <div className="space-y-4">
                      <PhysiognomyScoresChart data={result.physiognomy.scores} />
                      <div className="flex flex-wrap gap-2">
                        {result.physiognomy.traits.map(trait => (
                          <span key={trait} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] font-black text-rose-300 uppercase">
                            {trait}
                          </span>
                        ))}
                      </div>
                      <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 break-words whitespace-normal">
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">관상 종합 해석</div>
                        <div className="text-sm text-slate-300 leading-relaxed">
                          <ReactMarkdown>{result.physiognomy.description}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
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
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-[6px] font-mono text-white">생명선 {result.palmistry.lines.life}%</div>
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-blue-500/30 text-[6px] font-mono text-cyan-400">두뇌선 {result.palmistry.lines.wisdom}%</div>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-rose-500/30 text-[6px] font-mono text-rose-400">감정선 {result.palmistry.lines.heart}%</div>
                          <div className="px-1.5 py-0.5 rounded bg-black/70 border border-yellow-500/30 text-[6px] font-mono text-yellow-400">운명선 {result.palmistry.lines.fate}%</div>
                        </div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                            {palmLandmarks ? '21 Points' : 'AI Scan'}
                          </span>
                        </div>
                      </div>
                      {/* Palm line scores */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: '생명선', score: result.palmistry.lines.life, color: 'white' },
                          { label: '두뇌선', score: result.palmistry.lines.wisdom, color: 'cyan' },
                          { label: '감정선', score: result.palmistry.lines.heart, color: 'rose' },
                          { label: '운명선', score: result.palmistry.lines.fate, color: 'yellow' },
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
                          { label: '생명선 해석', value: result.palmistry.lifeLine, score: result.palmistry.lines.life },
                          { label: '재물선 해석', value: result.palmistry.wealthLine, score: result.palmistry.lines.fate },
                        ].map((item, i) => (
                          <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</div>
                            <div className="text-sm font-medium text-blue-300">{item.value}</div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${item.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 break-words whitespace-normal">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">손금 종합 해석</div>
                        <div className="text-sm text-slate-300 leading-relaxed">
                          <ReactMarkdown>{result.palmistry.description}</ReactMarkdown>
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
                <div id="advice" className="animate-slam bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-10 md:p-12 space-y-8 relative overflow-hidden scroll-mt-32">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 shrink-0">
                        <Award className="w-12 h-12 text-white" />
                      </div>
                      <div className="space-y-4 text-center md:text-left">
                        <h3 className="serif text-2xl font-bold tracking-tight text-white">마스터의 통합 조언</h3>
                        <div className="text-base leading-relaxed font-normal text-indigo-100 break-words whitespace-normal">
                          <ReactMarkdown>{addHanjaReading(result.hybrid.finalAdvice)}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col md:flex-row gap-6 pt-12">
                    <button 
                      onClick={() => setStep('SAJU')}
                      className="flex-1 py-6 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all border border-white/10 flex items-center justify-center gap-3"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      다시 분석하기
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Fate-Sync 운명 동기화 리포트',
                            text: `나의 운명 캐릭터는 ${result?.hybrid.cartoonInfo?.characterName}! AI가 분석한 나의 놀라운 운명을 확인해보세요.`,
                            url: window.location.href,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert("링크가 클립보드에 복사되었습니다. 원하는 곳에 붙여넣어 공유하세요!");
                        }
                      }}
                      className="flex-1 py-6 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all border border-white/10 flex items-center justify-center gap-3"
                    >
                      <Share2 className="w-5 h-5 text-mystic-accent" />
                      결과 공유하기
                    </button>
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
          </motion.div>
        )}
      </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;
