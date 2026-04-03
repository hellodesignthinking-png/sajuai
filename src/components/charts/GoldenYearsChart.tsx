import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { GoldenYear } from '../../types';

interface Props {
  data: GoldenYear[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as GoldenYear;
  return (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        maxWidth: '240px',
      }}
    >
      <p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: '6px', fontSize: '14px' }}>
        {d.year}년 — {d.score}점
      </p>
      <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.5 }}>{d.reason}</p>
    </div>
  );
};

export default function GoldenYearsChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={sorted} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#888', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {sorted.map((entry, i) => (
              <Cell
                key={entry.year}
                fill={
                  i === 0
                    ? '#D4AF37'
                    : i === 1
                    ? '#C9A227'
                    : i === 2
                    ? '#B8960C'
                    : 'rgba(212,175,55,0.4)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
