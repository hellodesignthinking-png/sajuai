import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sun, Moon, Zap, Coffee, Heart, Briefcase } from 'lucide-react';

interface FateCalendarProps {
    dayMasterElement: string;
}

const FateCalendar: React.FC<FateCalendarProps> = ({ dayMasterElement }) => {
    const today = new Date();

    // Simplified luck calculation based on Day Master element compatibility
    const calculation = useMemo(() => {
        const day = today.getDate();
        const month = today.getMonth() + 1;

        // Elements: 목(Wood), 화(Fire), 토(Earth), 금(Metal), 수(Water)
        const elements = ['목', '화', '토', '금', '수'];
        const compatibilityMap: Record<string, string[]> = {
            '목': ['수', '목', '화'], // Good: Water (feeds wood), Wood (same), Fire (burns wood)
            '화': ['목', '화', '토'],
            '토': ['화', '토', '금'],
            '금': ['토', '금', '수'],
            '수': ['금', '수', '목'],
        };

        // Deterministic score based on day/month/element
        const dm = dayMasterElement.substring(0, 1);
        const todayElementIndex = (day + month) % 5;
        const todayElement = elements[todayElementIndex];

        const isGood = compatibilityMap[dm]?.includes(todayElement);
        const score = isGood ? 75 + ((day + 7) % 25) : 40 + ((day + 3) % 40);

        return {
            score,
            todayElement,
            status: score >= 80 ? '천재일우' : score >= 60 ? '안정적' : '주의필요',
            advice: score >= 80 ? '중요한 결정을 내리기에 최적의 날입니다.' :
                score >= 60 ? '일상적인 업무를 처리하며 내실을 다지세요.' :
                    '무리한 활동보다는 휴식과 성찰의 시간이 필요합니다.'
        };
    }, [dayMasterElement]);

    const actions = [
        { icon: <Briefcase className="w-4 h-4" />, label: '비즈니스', score: calculation.score + 5 },
        { icon: <Heart className="w-4 h-4" />, label: '연애/관계', score: calculation.score - 3 },
        { icon: <Zap className="w-4 h-4" />, label: '창의활동', score: calculation.score + 10 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a1a]/60 backdrop-blur-xl border border-[#D4AF37]/20 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calendar className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                        <Sun className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="font-serif font-black text-[#D4AF37]">오늘의 운명 기상도</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{today.toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    <span className="text-xs font-black text-[#D4AF37]">{calculation.status}</span>
                </div>
            </div>

            <div className="flex items-end gap-6 mb-8">
                <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                        <circle cx="48" cy="48" r="40" stroke="#D4AF37" strokeWidth="6" fill="transparent"
                            strokeDasharray={251}
                            strokeDashoffset={251 * (1 - calculation.score / 100)}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">{calculation.score}</span>
                        <span className="text-[8px] text-[#D4AF37] font-bold">SYNC %</span>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                        오늘은 <span className="text-[#D4AF37] font-bold">{calculation.todayElement}</span>의 기운이 강한 날입니다. {calculation.advice}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {actions.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-all group/item">
                        <div className="text-slate-400 group-hover/item:text-[#D4AF37] transition-colors">
                            {item.icon}
                        </div>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">{item.label}</span>
                        <span className="text-xs font-black text-white">{Math.min(99, Math.max(1, item.score))}%</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default FateCalendar;
