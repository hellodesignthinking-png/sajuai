import React from 'react';
import { motion } from 'framer-motion';

interface ElementFlowDiagramProps {
    data: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
    dominantElement?: string;
}

const ELEMENTS = [
    { id: 'wood', label: '목(木)', color: '#10b981', angle: -90 },
    { id: 'fire', label: '화(火)', color: '#f43f5e', angle: -18 },
    { id: 'earth', label: '토(土)', color: '#f59e0b', angle: 54 },
    { id: 'metal', label: '금(金)', color: '#94a3b8', angle: 126 },
    { id: 'water', label: '수(水)', color: '#3b82f6', angle: 198 },
];

// 상생 (Generating): Wood→Fire→Earth→Metal→Water→Wood
const GENERATING = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]
];

// 상극 (Controlling): Wood→Earth, Earth→Water, Water→Fire, Fire→Metal, Metal→Wood
const CONTROLLING = [
    [0, 2], [2, 4], [4, 1], [1, 3], [3, 0]
];

const ElementFlowDiagram: React.FC<ElementFlowDiagramProps> = ({ data, dominantElement }) => {
    const cx = 200;
    const cy = 200;
    const radius = 140;

    const getPos = (angleDeg: number) => {
        const rad = (angleDeg * Math.PI) / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    const elements = ELEMENTS.map((el) => ({
        ...el,
        count: (data as any)[el.id] || 0,
        pos: getPos(el.angle),
        isDominant: dominantElement?.toLowerCase().includes(el.id),
    }));

    const maxCount = Math.max(...elements.map((e) => e.count), 1);

    // Arrow marker
    const arrowPath = (from: { x: number; y: number }, to: { x: number; y: number }, offset: number = 0) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len;
        const ny = dy / len;
        const startX = from.x + nx * 30;
        const startY = from.y + ny * 30;
        const endX = to.x - nx * 30;
        const endY = to.y - ny * 30;

        if (offset !== 0) {
            const px = -ny * offset;
            const py = nx * offset;
            const midX = (startX + endX) / 2 + px;
            const midY = (startY + endY) / 2 + py;
            return `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;
        }
        return `M${startX},${startY} L${endX},${endY}`;
    };

    return (
        <div className="relative w-full max-w-[420px] mx-auto aspect-square">
            <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                    <marker id="arrowGen" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#D4AF37" opacity="0.6" />
                    </marker>
                    <marker id="arrowCtrl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" opacity="0.4" />
                    </marker>
                    <filter id="elementGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Center label */}
                <text x={cx} y={cx - 10} textAnchor="middle" fill="#D4AF37" opacity="0.3" fontSize="10" fontWeight="900" letterSpacing="3">
                    五行
                </text>
                <text x={cx} y={cx + 8} textAnchor="middle" fill="#D4AF37" opacity="0.2" fontSize="7" fontWeight="700" letterSpacing="2">
                    ELEMENTAL FLOW
                </text>

                {/* 상생 arrows (outer, clockwise) */}
                {GENERATING.map(([from, to], i) => (
                    <motion.path
                        key={`gen-${i}`}
                        d={arrowPath(elements[from].pos, elements[to].pos)}
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.4"
                        markerEnd="url(#arrowGen)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, delay: i * 0.15 }}
                    />
                ))}

                {/* 상극 arrows (inner, dashed star) */}
                {CONTROLLING.map(([from, to], i) => (
                    <path
                        key={`ctrl-${i}`}
                        d={arrowPath(elements[from].pos, elements[to].pos, 25)}
                        stroke="#f43f5e"
                        strokeWidth="0.8"
                        strokeDasharray="4,3"
                        fill="none"
                        opacity="0.25"
                        markerEnd="url(#arrowCtrl)"
                    />
                ))}

                {/* Element nodes */}
                {elements.map((el, i) => {
                    const nodeRadius = 18 + (el.count / maxCount) * 12;
                    return (
                        <g key={el.id}>
                            {/* Glow ring for dominant */}
                            {el.isDominant && (
                                <motion.circle
                                    cx={el.pos.x} cy={el.pos.y} r={nodeRadius + 8}
                                    fill="none" stroke={el.color} strokeWidth="2"
                                    opacity="0.3" filter="url(#elementGlow)"
                                    animate={{ r: [nodeRadius + 6, nodeRadius + 12, nodeRadius + 6] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}

                            {/* Node background */}
                            <circle
                                cx={el.pos.x} cy={el.pos.y} r={nodeRadius}
                                fill={`${el.color}15`} stroke={el.color}
                                strokeWidth={el.isDominant ? 2.5 : 1.5}
                                opacity={el.isDominant ? 1 : 0.7}
                            />

                            {/* Count */}
                            <text
                                x={el.pos.x} y={el.pos.y - 4}
                                textAnchor="middle" dominantBaseline="middle"
                                fill={el.color} fontSize="16" fontWeight="900"
                            >
                                {el.count}
                            </text>

                            {/* Label */}
                            <text
                                x={el.pos.x} y={el.pos.y + 12}
                                textAnchor="middle" dominantBaseline="middle"
                                fill={el.color} fontSize="8" fontWeight="700" opacity="0.8"
                            >
                                {el.label}
                            </text>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform="translate(10, 370)">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#D4AF37" strokeWidth="1.5" opacity="0.5" />
                    <text x="25" y="4" fill="#D4AF37" opacity="0.4" fontSize="7" fontWeight="700">상생 (Generating)</text>
                    <line x1="140" y1="0" x2="160" y2="0" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.4" />
                    <text x="165" y="4" fill="#f43f5e" opacity="0.4" fontSize="7" fontWeight="700">상극 (Controlling)</text>
                </g>
            </svg>
        </div>
    );
};

export default ElementFlowDiagram;
