import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
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
        background: '#1a1a1a',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        maxWidth: '220px',
      }}
    >
      <p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>
        {d.age_range} — {d.score}점
      </p>
      <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.5 }}>{d.description}</p>
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
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="age_range"
            tick={{ fill: '#888', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.3)', strokeWidth: 1 }} />
          {data.find((d) => d.age_range === currentRange) && (
            <ReferenceLine
              x={currentRange}
              stroke="rgba(212,175,55,0.6)"
              strokeDasharray="4 4"
              label={{
                value: '현재',
                position: 'insideTopRight',
                fill: 'var(--gold)',
                fontSize: 11,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#D4AF37"
            strokeWidth={2.5}
            fill="url(#goldGrad)"
            dot={{ fill: '#D4AF37', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#F0D060', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
