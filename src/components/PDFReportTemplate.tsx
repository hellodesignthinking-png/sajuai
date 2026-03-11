import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FateAnalysisResult, UserFateData } from '../types';
import { SajuAdvancedVisuals } from './SajuAdvancedVisuals';
import { PhysiognomyAdvancedVisuals } from './PhysiognomyAdvancedVisuals';
import { PalmistryAdvancedVisuals } from './PalmistryAdvancedVisuals';

interface Props {
  userData: UserFateData;
  result: FateAnalysisResult;
}

export const PDFReportTemplate: React.FC<Props> = ({ userData, result }) => {
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="bg-[#fcf9f2] text-[#2c231f] font-serif print-container" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '15mm', boxSizing: 'border-box' }}>
      
      {/* 테두리 (Vintage Border Box) */}
      <div className="border-[8px] border-double border-[#8b7355] p-[10mm] h-full rounded-sm relative">
        {/* 네 모서리 장식 */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-[4px] border-l-[4px] border-[#8b7355]" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-[4px] border-r-[4px] border-[#8b7355]" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-[4px] border-l-[4px] border-[#8b7355]" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-[4px] border-r-[4px] border-[#8b7355]" />

        {/* ================= 표지 (Cover Page) ================= */}
        <div className="text-center mb-[40mm] pt-[20mm] page-break-after">
          <h3 className="text-[#8b7355] tracking-[0.3em] font-bold uppercase text-sm mb-6">Fate-Sync Advanced Analysis Report</h3>
          <h1 className="text-5xl font-black mb-8 border-b-[3px] border-double border-[#8b7355] inline-block pb-6 px-10 text-[#3f312b]">종합 운명 분석 보고서</h1>
          
          <div className="text-xl mb-16 text-[#4a3f35]">
            <p className="mb-2"><strong>성명:</strong> {userData.userName || '고객'}</p>
            <p className="mb-2"><strong>분석 일자:</strong> {currentDate}</p>
            <p><strong>운명 캐릭터:</strong> {result.hybrid.cartoonInfo?.characterName || '미지정'}</p>
          </div>

          {/* 사주 명식 (요약) */}
          {result.saju.pillars && (
            <div className="w-[120mm] mx-auto border-[3px] border-double border-[#8b7355] p-6 bg-[#f4efe6] shadow-inner">
              <h2 className="text-lg font-bold mb-4 border-b border-[#c1a173] pb-2 text-[#4a3f35]">사주 명식 (四柱 命式)</h2>
              <div className="grid grid-cols-4 gap-4 text-center text-xl">
                <div>
                  <div className="text-sm text-[#8b7355] mb-1">시주</div>
                  <div className="font-bold text-[#2c231f]">{result.saju.pillars.hour || '??'}</div>
                </div>
                <div>
                  <div className="text-sm text-[#8b7355] mb-1">일주</div>
                  <div className="font-bold text-[#2c231f]">{result.saju.pillars.day}</div>
                </div>
                <div>
                  <div className="text-sm text-[#8b7355] mb-1">월주</div>
                  <div className="font-bold text-[#2c231f]">{result.saju.pillars.month}</div>
                </div>
                <div>
                  <div className="text-sm text-[#8b7355] mb-1">년주</div>
                  <div className="font-bold text-[#2c231f]">{result.saju.pillars.year}</div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-16 border-b border-[#c1a173] w-1/3 mx-auto" />
        </div>

        {/* ================= 성향 및 캐릭터 (MBTI & Character) ================= */}
        <div className="mb-[20mm]">
          <h2 className="text-3xl font-bold border-b-2 border-dashed border-[#8b7355] pb-3 mb-6 flex items-center gap-3 text-[#3f312b]">
            <span className="text-4xl text-[#c1a173]">I.</span> 선천적 성향 파악
          </h2>
          
          <div className="flex gap-8 items-start mb-8">
            {result.hybrid.cartoonInfo?.cartoonImageUrl && (
              <div className="p-2 border border-[#8b7355] bg-[#f4efe6] shadow-md shrink-0">
                <img src={result.hybrid.cartoonInfo.cartoonImageUrl} alt="Destiny Character" className="w-[50mm] h-[50mm] object-cover border border-[#c1a173]" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold mb-4 inline-flex items-center gap-2">
                <span className="bg-[#2c231f] text-[#fcf9f2] px-2 py-1 text-sm font-sans tracking-wide">MBTI: {userData.mbti}</span>
                <span className="text-[#4a3f35]">나의 운명 캐릭터: {result.hybrid.cartoonInfo?.characterName}</span>
              </h3>
              <p className="text-[#4a3f35] leading-relaxed text-justify text-[15px]">
                <ReactMarkdown>{result.hybrid.mbtiBehavioralPattern}</ReactMarkdown>
              </p>
            </div>
          </div>
        </div>

        <div className="page-break-after" />

        {/* ================= 사주 정밀 분석 (Saju) ================= */}
        <div className="mb-[20mm]">
          <h2 className="text-3xl font-bold border-b-2 border-dashed border-[#8b7355] pb-3 mb-6 flex items-center gap-3 text-[#3f312b]">
             <span className="text-4xl text-[#c1a173]">II.</span> 명리(사주) 정밀 구조 분석
          </h2>
          
          <div className="bg-[#f4efe6] p-6 mb-6 shadow-inner border border-[#d4c4a8] relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#8b7355]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#8b7355]" />
            <p className="text-lg font-bold mb-3 text-[#3f312b] border-b border-[#d4c4a8] pb-1 inline-block">핵심 통찰 (Summary)</p>
            <p className="text-[#4a3f35] leading-relaxed text-justify">{result.saju.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold border-l-[3px] border-[#8b7355] pl-3 mb-4 text-[#3f312b]">용신 & 격국</h3>
              <ul className="list-none pl-2 space-y-2 text-[#4a3f35]">
                <li className="flex gap-2"><span className="text-[#c1a173]">✦</span><strong className="text-[#2c231f] w-20">일간(기준)</strong> {result.saju.element}</li>
                <li className="flex gap-2"><span className="text-[#c1a173]">✦</span><strong className="text-[#2c231f] w-20">기질 강약</strong> {result.saju.elementalStrength}</li>
                <li className="flex gap-2"><span className="text-[#c1a173]">✦</span><strong className="text-[#2c231f] w-20">용신(도움)</strong> {result.saju.yongSin || '분석 중'}</li>
                <li className="flex gap-2"><span className="text-[#c1a173]">✦</span><strong className="text-[#2c231f] w-20">격국(그릇)</strong> {result.saju.gyeokGuk || '분석 중'}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold border-l-[3px] border-[#8b7355] pl-3 mb-4 text-[#3f312b]">강점과 약점</h3>
              <div className="mb-3">
                <strong className="text-[#2c231f]">[강점]</strong>
                <ul className="list-disc pl-5 text-[#4a3f35] text-sm mt-1">
                  {result.saju.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <strong className="text-[#2c231f]">[약점/보완]</strong>
                <ul className="list-disc pl-5 text-[#4a3f35] text-sm mt-1">
                  {result.saju.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* 대운 표 */}
          {result.saju.daewun && result.saju.daewun.length > 0 && (
            <div className="mt-8 border border-[#c1a173] p-1">
              <h3 className="text-lg font-bold bg-[#efeade] border-b border-[#c1a173] px-3 py-2 text-center text-[#3f312b] tracking-widest">대운 (10년 주기 운세 흐름)</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4efe6] border-b border-[#8b7355] text-[#4a3f35]">
                    <th className="p-3 w-1/6 font-bold">나이</th>
                    <th className="p-3 w-1/6 font-bold">간지</th>
                    <th className="p-3 w-4/6 font-bold">해석</th>
                  </tr>
                </thead>
                <tbody>
                  {result.saju.daewun.map((d, i) => (
                    <tr key={i} className="border-b border-[#d4c4a8] hover:bg-[#faf7f2]">
                      <td className="p-3 font-bold text-[#2c231f]">{d.ageRange}세</td>
                      <td className="p-3 text-[#2c231f]">{d.pillar}</td>
                      <td className="p-3 text-sm text-[#4a3f35] leading-relaxed">{d.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Saju Advanced Visuals (Charts) */}
          <div className="mt-10 bg-slate-950 p-[8mm] rounded-sm print-color-adjust border-[3px] border-double border-[#8b7355] shadow-lg">
            <h4 className="text-[#c1a173] text-center text-sm font-bold tracking-widest mb-2 font-sans border-b border-[#c1a173]/30 pb-2">ASTROLOGICAL CHART</h4>
            <SajuAdvancedVisuals saju={result.saju} />
          </div>
        </div>

        <div className="page-break-after" />

        {/* ================= 관상 및 카르마 (Physiognomy) ================= */}
        <div className="mb-[20mm]">
          <h2 className="text-3xl font-bold border-b-2 border-dashed border-[#8b7355] pb-3 mb-6 flex items-center gap-3 text-[#3f312b]">
             <span className="text-4xl text-[#c1a173]">III.</span> 관상 및 미세 카르마 분석
          </h2>
          
          <div className="flex flex-row-reverse gap-8 items-start mb-8">
            <div className="shrink-0 text-center">
              {userData.faceImage ? (
                <div className="p-2 border border-[#8b7355] bg-[#f4efe6] shadow-md">
                   <img src={userData.faceImage} alt="Face Scan" className="w-[60mm] h-[80mm] object-cover border border-[#c1a173]" />
                </div>
              ) : (
                <div className="w-[60mm] h-[80mm] bg-[#f4efe6] border border-[#d4c4a8] flex items-center justify-center text-[#c1a173] italic">No Face Image</div>
              )}
              <div className="mt-4 text-2xl font-black text-[#2c231f]">관상 점수: {result.physiognomy.score}점</div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4 border-l-[3px] border-[#8b7355] pl-3 text-[#3f312b]">주요 특징</h3>
              <ul className="list-none pl-2 space-y-3 mb-6 text-[#4a3f35]">
                {result.physiognomy.traits.map((trait, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[#8b7355]">✦</span> {trait}</li>
                ))}
              </ul>
              
              {result.physiognomy.karmaAnalysis && (
                <div className="bg-[#f4efe6] border border-[#d4c4a8] p-5 shadow-inner relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8b7355]" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#8b7355]" />
                  <h4 className="font-bold mb-3 text-[#3f312b]">안면에 새겨진 카르마 흔적 (Karma Overview)</h4>
                  <p className="text-[#4a3f35] text-[14px] leading-relaxed text-justify">
                    {result.physiognomy.karmaAnalysis}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Physiognomy Advanced Visuals (AR & Karma) */}
          <div className="mt-10 bg-slate-950 p-[8mm] rounded-sm print-color-adjust border-[3px] border-double border-[#8b7355] shadow-lg">
             <h4 className="text-[#c1a173] text-center text-sm font-bold tracking-widest mb-2 font-sans border-b border-[#c1a173]/30 pb-2">PHYSIOGNOMY MAP</h4>
            <PhysiognomyAdvancedVisuals physiognomy={result.physiognomy} faceImage={userData.faceImage || undefined} />
          </div>
        </div>

        <div className="page-break-after" />

        {/* ================= 손금 정밀 분석 (Palmistry) ================= */}
        <div className="mb-[20mm]">
          <h2 className="text-3xl font-bold border-b-2 border-dashed border-[#8b7355] pb-3 mb-6 flex items-center gap-3 text-[#3f312b]">
             <span className="text-4xl text-[#c1a173]">IV.</span> 손금(장문) 4대 선 정밀 스캔
          </h2>
          
          <div className="flex gap-8 items-start mb-8">
            <div className="shrink-0 text-center">
              {userData.palmImage ? (
                <div className="p-2 border border-[#8b7355] bg-[#f4efe6] shadow-md">
                   <img src={userData.palmImage} alt="Palm Scan" className="w-[60mm] h-[80mm] object-cover border border-[#c1a173]" />
                </div>
              ) : (
                 <div className="w-[60mm] h-[80mm] bg-[#f4efe6] border border-[#d4c4a8] flex items-center justify-center text-[#c1a173] italic">No Palm Image</div>
              )}
            </div>
            <div className="flex-1 space-y-5">
              <h3 className="text-xl font-bold mb-2 border-l-[3px] border-[#8b7355] pl-3 text-[#3f312b]">주요 선(Line) 활성도 분석</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-[#c1a173] bg-[#f4efe6] p-3 shadow-inner">
                  <div className="text-xs text-[#8b7355] font-bold mb-2">생명선 (활력/건강)</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-[#2c231f]">{result.palmistry.scores.life}점</span>
                     <div className="w-24 h-1.5 bg-[#d4c4a8] rounded-sm"><div className="h-full bg-[#8b7355]" style={{width: `${result.palmistry.scores.life}%`}} /></div>
                  </div>
                </div>
                <div className="border border-[#c1a173] bg-[#f4efe6] p-3 shadow-inner">
                  <div className="text-xs text-[#8b7355] font-bold mb-2">두뇌선 (지능/적성)</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-[#2c231f]">{result.palmistry.scores.head}점</span>
                     <div className="w-24 h-1.5 bg-[#d4c4a8] rounded-sm"><div className="h-full bg-[#8b7355]" style={{width: `${result.palmistry.scores.head}%`}} /></div>
                  </div>
                </div>
                <div className="border border-[#c1a173] bg-[#f4efe6] p-3 shadow-inner">
                  <div className="text-xs text-[#8b7355] font-bold mb-2">감정선 (정서/애정)</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-[#2c231f]">{result.palmistry.scores.heart}점</span>
                     <div className="w-24 h-1.5 bg-[#d4c4a8] rounded-sm"><div className="h-full bg-[#8b7355]" style={{width: `${result.palmistry.scores.heart}%`}} /></div>
                  </div>
                </div>
                <div className="border border-[#c1a173] bg-[#f4efe6] p-3 shadow-inner">
                  <div className="text-xs text-[#8b7355] font-bold mb-2">운명선 (직업/성공)</div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-[#2c231f]">{result.palmistry.scores.fate}점</span>
                     <div className="w-24 h-1.5 bg-[#d4c4a8] rounded-sm"><div className="h-full bg-[#8b7355]" style={{width: `${result.palmistry.scores.fate}%`}} /></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#f4efe6] border border-[#d4c4a8] p-5 shadow-inner relative">
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8b7355]" />
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#8b7355]" />
                 <h4 className="font-bold mb-2 text-sm text-[#3f312b]">생명선 특징</h4>
                 <p className="text-[#4a3f35] text-sm mb-4 leading-relaxed">{result.palmistry.lifeLine}</p>
                 <h4 className="font-bold mb-2 text-sm text-[#3f312b]">기타 주요 특징 (두뇌/감정/운명)</h4>
                 <p className="text-[#4a3f35] text-sm leading-relaxed">{result.palmistry.fateLine || result.palmistry.headLine || result.palmistry.heartLine}</p>
              </div>
            </div>
          </div>

          {/* Palmistry Advanced Visuals (Biorhythm & Lines) */}
          <div className="mt-10 bg-slate-950 p-[8mm] rounded-sm print-color-adjust border-[3px] border-double border-[#8b7355] shadow-lg">
            <h4 className="text-[#c1a173] text-center text-sm font-bold tracking-widest mb-2 font-sans border-b border-[#c1a173]/30 pb-2">PALMISTRY BIORHYTHM</h4>
            <PalmistryAdvancedVisuals palmistry={result.palmistry} palmImage={userData.palmImage || undefined} gender={userData.saju?.gender} />
          </div>
        </div>

        {/* ================= 최종 분석 (Final Hybrid Synthesis) ================= */}
        <div className="mb-[2mm] bg-[#2c231f] text-[#fcf9f2] p-[12mm] rounded-sm print-color-adjust border border-[#c1a173] shadow-xl relative">
          <div className="absolute inset-2 border border-[#c1a173]/30 pointer-events-none" />
          <h2 className="text-2xl font-bold border-b border-[#8b7355] pb-3 mb-6 text-center tracking-wide text-[#c1a173]">V. 운명 마스터 통합 조언 (Synthesis Review)</h2>
          
          <div className="mb-8 prose prose-invert max-w-none text-[#efeade] leading-relaxed text-justify">
            <ReactMarkdown>
              {result.hybrid.finalAdvice}
            </ReactMarkdown>
          </div>

          {result.hybrid.worryResolution && (
            <div className="mt-8 border-t border-[#8b7355] pt-6 text-center">
              <h3 className="text-lg font-bold mb-4 text-[#c1a173] tracking-widest text-center">"당신의 고민에 대한 해답"</h3>
              <div className="bg-[#1f1815] p-6 border border-[#8b7355]/40 prose prose-invert max-w-none text-[#d4c4a8] text-[15px] leading-relaxed text-justify inline-block text-left shadow-inner">
                 <ReactMarkdown>
                    {result.hybrid.worryResolution}
                 </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-[#8b7355] mt-[15mm] border-t border-[#d4c4a8] pt-4 tracking-widest font-sans">
          © {new Date().getFullYear()} FATE-SYNC AI. 본 보고서는 통계적 사주 명리학 및 생체 데이터 측정에 기반한 분석 결과입니다.
        </div>

      </div> {/* End Vintage Border Box */}
    </div>
  );
};
