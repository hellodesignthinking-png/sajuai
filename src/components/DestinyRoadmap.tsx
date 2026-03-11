import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Clock, Rocket } from 'lucide-react';

interface RoadmapStep {
    title: string;
    description: string;
}

interface DestinyRoadmapProps {
    steps: RoadmapStep[];
}

const STEP_CONFIG = [
    { icon: Lightbulb, color: '#D4AF37', label: '1단계: 인식', sublabel: 'Recognition', gradient: 'from-amber-500/20 to-yellow-600/10' },
    { icon: Clock, color: '#6366f1', label: '2단계: 최적 시기', sublabel: 'Timing', gradient: 'from-indigo-500/20 to-purple-600/10' },
    { icon: Rocket, color: '#10b981', label: '3단계: 실행', sublabel: 'Action', gradient: 'from-emerald-500/20 to-teal-600/10' },
];

const DestinyRoadmap: React.FC<DestinyRoadmapProps> = ({ steps }) => {
    return (
        <div className="relative max-w-2xl mx-auto py-4">
            {/* Vertical connecting line */}
            <div className="absolute left-[27px] top-12 bottom-12 w-[2px] bg-gradient-to-b from-[#D4AF37]/40 via-indigo-500/40 to-emerald-500/40" />

            <div className="space-y-8">
                {steps.slice(0, 3).map((step, idx) => {
                    const config = STEP_CONFIG[idx] || STEP_CONFIG[2];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            className="relative flex gap-5"
                        >
                            {/* Node */}
                            <div className="relative z-10 flex-shrink-0">
                                <motion.div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} border-2 flex items-center justify-center shadow-lg`}
                                    style={{ borderColor: `${config.color}50` }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: config.color }} />
                                </motion.div>
                                {/* Pulse ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl border-2"
                                    style={{ borderColor: `${config.color}20` }}
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: config.color }}>
                                        {config.label}
                                    </span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${config.color}60` }}>
                                        {config.sublabel}
                                    </span>
                                </div>
                                <div
                                    className="rounded-2xl p-5 border backdrop-blur-sm"
                                    style={{
                                        backgroundColor: `${config.color}08`,
                                        borderColor: `${config.color}20`,
                                    }}
                                >
                                    <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap break-keep">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom label */}
            <div className="text-center mt-8">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/30">
                    ✦ Destiny Roadmap ✦
                </span>
            </div>
        </div>
    );
};

export default DestinyRoadmap;
