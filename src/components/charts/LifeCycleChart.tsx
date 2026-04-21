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
    <div style={{
      background: '#ffffff',
      border: '1px solid #e7e5e4',
      borderRadius: '12px',
      padding: '14px 18px',
      maxWidth: '220px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    }}>
      <p style={{ color: '#115e59', fontWeight: 800, marginBottom: '5px', fontSize: '14px' }}>
        {d.age_range} — <span style={{ color: '#14b8a6' }}>{d.score}점</span>
      </p>
      <p style={{ color: '#44403c', fontSize: '13px', lineHeight: 1.6 }}>{d.description}</p>
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
            <linearGradient id="tealGradLC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.35} />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="age_range"
            tick={{ fill: '#44403c', fontSize: 13, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#78716c', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#14b8a6', strokeWidth: 1.5, strokeDasharray: '4 2' }}
          />
          {data.find((d) => d.age_range === currentRange) && (
            <ReferenceLine
              x={currentRange}
              stroke="#84cc16"
              strokeDasharray="5 4"
              strokeWidth={2}
              label={{
                value: '현재',
                position: 'insideTopRight',
                fill: '#3f6212',
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#14b8a6"
            strokeWidth={3}
            fill="url(#tealGradLC)"
            dot={{ fill: '#14b8a6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#0891b2', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
