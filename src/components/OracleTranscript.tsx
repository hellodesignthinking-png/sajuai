import React from 'react';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface OracleTranscriptProps {
    messages: Message[];
    userName?: string;
}

const OracleTranscript: React.FC<OracleTranscriptProps> = ({ messages, userName = '탐구자' }) => {
    if (!messages || messages.length <= 1) return null;

    // Filter out the welcome message (first message from model)
    const transcript = messages.slice(1);
    if (transcript.length === 0) return null;

    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    return (
        <div id="oracle-transcript" className="print-only" style={{ display: 'none' }}>
            <div style={{
                fontFamily: 'Georgia, serif',
                padding: '40px',
                borderTop: '2px solid #D4AF3744',
                marginTop: '40px',
                pageBreakBefore: 'always',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '9px', color: '#D4AF37', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Fate-Sync · 비전(秘傳) 상담록
                    </p>
                    <h2 style={{ fontSize: '20px', color: '#D4AF37', fontWeight: 900, margin: '0 0 8px 0' }}>
                        마스터 오라클 심층 상담 기록
                    </h2>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>
                        {dateStr} · {userName}님과의 운명적 대화
                    </p>
                    <div style={{ width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, #D4AF37, transparent)', margin: '16px auto 0' }} />
                </div>

                {/* Transcript lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {transcript.map((msg, i) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{
                                    fontSize: '8px',
                                    fontWeight: 900,
                                    letterSpacing: '0.3em',
                                    textTransform: 'uppercase',
                                    color: isUser ? '#818cf8' : '#D4AF37',
                                }}>
                                    {isUser ? `[ SEEKER · ${userName} ]` : '[ ORACLE · 마스터 ]'}
                                </div>
                                <p style={{
                                    fontSize: '12px',
                                    lineHeight: 1.8,
                                    color: isUser ? '#c7d2fe' : '#f1f5f9',
                                    margin: '0',
                                    paddingLeft: '12px',
                                    borderLeft: `2px solid ${isUser ? '#4338ca44' : '#D4AF3744'}`,
                                }}>
                                    {msg.text}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Footer seal */}
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <div style={{ width: '40px', height: '1px', background: '#D4AF3744', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '8px', color: '#D4AF37', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                        ✦ FATE-SYNC · ETHER ARCHIVE · {today.getFullYear()} ✦
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OracleTranscript;
