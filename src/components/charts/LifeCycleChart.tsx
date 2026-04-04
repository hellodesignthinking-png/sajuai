import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot,
} from 'recharts';
import type { LifeCycleScore } from '../../types';

interface Props {
  data: LifeCycleScore[];
  currentAge: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as LifeCycleScore;
  return (
    <div
      style={{
        background: '#181510',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: '12px',
        padding: '14px 18px',
        maxWidth: '220px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: 'var(--gold)', fontWeight: 800, marginBottom: '5px', fontSize: '14px' }}>
        {d.age_range} — <span style={{ color: '#F0D060' }}>{d.score}점</span>
      </p>
      <p style={{ color: 'rgba(240,238,232,0.75)', fontSize: '13px', lineHeight: 1.6 }}>{d.description}</p>
    </div>
  );
};

function getCurrentAgeRange(age: number): string {
  if (age < 30) return '20대';
  if (age < 40) return '30대';
  if (age < 50) return '40대';
  if (age < 60) return '50대';
  return '60대';
}

export default function LifeCycleChart({ data, currentAge }: Props) {
  const currentRange = getCurrentAgeRange(currentAge);

  return (
    <div style={{ width: '100%', height: 270 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 8 }}>
          <defs>
            <linearGradient id="goldGradLC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="age_range"
            tick={{ fill: '#888', fontSize: 13, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#666', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(212,175,55,0.4)', strokeWidth: 1.5, strokeDasharray: '4 2' }}
          />
          {data.find((d) => d.age_range === currentRange) && (
            <ReferenceLine
              x={currentRange}
              stroke="rgba(212,175,55,0.7)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{
                value: '현재',
                position: 'insideTopRight',
                fill: 'var(--gold)',
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#D4AF37"
            strokeWidth={3}
            fill="url(#goldGradLC)"
            dot={{ fill: '#D4AF37', r: 5, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: '#F0D060', strokeWidth: 2, stroke: 'rgba(212,175,55,0.4)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
