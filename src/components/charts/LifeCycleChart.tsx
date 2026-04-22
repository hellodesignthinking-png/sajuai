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
      <p style={{ color: '#1a1a1a', fontWeight: 800, marginBottom: '5px', fontSize: '14px' }}>
        {d.age_range} — <span style={{ color: '#404040' }}>{d.score}</span>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="age_range"
            tick={{ fill: '#404040', fontSize: 13, fontWeight: 700 }}
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
            cursor={{ stroke: '#1a1a1a', strokeWidth: 1, strokeDasharray: '4 2' }}
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
                fontWeight: 800,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#1a1a1a"
            strokeWidth={2}
            fill="#1a1a1a"
            fillOpacity={0.06}
            dot={{ fill: '#1a1a1a', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#84cc16', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
