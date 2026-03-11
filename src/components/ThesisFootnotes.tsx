import React from 'react';

/**
 * Print-only footnotes for 명리학 terminology.
 * Hidden on screen, visible in PDF / print output.
 */

const FOOTNOTES = [
    { id: 1, term: '용신(用神)', definition: '사주의 불균형을 보완해주는 핵심 오행으로, 억부법·조후법·통관법 등의 원리로 선정된다. 인생 전략의 핵심 키워드.' },
    { id: 2, term: '격국(格局)', definition: '사주 원국의 월령(月令)과 지장간(地藏干)을 기준으로 판단하는 삶의 구조적 틀. 정관격, 편재격 등으로 분류.' },
    { id: 3, term: '오행(五行)', definition: '목(木)·화(火)·토(土)·금(金)·수(水)의 다섯 가지 기본 에너지. 상생(相生)과 상극(相剋)의 순환 원리로 만물을 설명.' },
    { id: 4, term: '대운(大運)', definition: '10년 단위로 변화하는 운의 큰 흐름. 월주(月柱)를 기점으로 순행 또는 역행하여 산출.' },
    { id: 5, term: '십이운성(十二運星)', definition: '일간(日干)이 각 지지(地支)를 만났을 때의 에너지 상태를 12단계(장생~양)로 표현한 생애 주기 체계.' },
    { id: 6, term: '관성(官星)', definition: '나를 극(剋)하는 오행. 직장, 명예, 사회적 위치를 상징. 정관(正官)과 편관(偏官)으로 나뉨.' },
    { id: 7, term: '재성(財星)', definition: '내가 극(剋)하는 오행. 재물, 경제력, 현실적 능력을 상징. 정재(正財)와 편재(偏財)로 나뉨.' },
    { id: 8, term: '인성(印星)', definition: '나를 생(生)해주는 오행. 학문, 지혜, 모성(母性)을 상징. 정인(正印)과 편인(偏印)으로 나뉨.' },
];

const ThesisFootnotes: React.FC = () => {
    return (
        <div className="hidden print:block mt-16 pt-8 border-t-2 border-[#D4AF37]/30">
            <h4 className="text-lg font-serif font-bold text-[#D4AF37] mb-6">
                ─ 용어 해설 (Glossary) ─
            </h4>
            <div className="grid grid-cols-1 gap-3">
                {FOOTNOTES.map((fn) => (
                    <div key={fn.id} className="flex gap-3 text-sm leading-relaxed">
                        <span className="text-[#D4AF37] font-bold flex-shrink-0 w-6 text-right">
                            {fn.id}.
                        </span>
                        <div>
                            <span className="font-bold text-[#D4AF37]">{fn.term}</span>
                            <span className="text-slate-300 ml-2">{fn.definition}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center text-xs text-slate-500 italic">
                본 리포트는 Fate-Sync AI의 4차원 융합 분석 엔진에 의해 자동 생성되었습니다.
            </div>
        </div>
    );
};

/** Map of terms to their footnote numbers for inline superscript markers */
export const FOOTNOTE_MAP: Record<string, number> = {};
FOOTNOTES.forEach(fn => {
    // Extract the Korean term before parenthesis
    const koreanTerm = fn.term.split('(')[0];
    FOOTNOTE_MAP[koreanTerm] = fn.id;
});

export default ThesisFootnotes;
