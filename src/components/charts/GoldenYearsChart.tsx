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
        background: '#181510',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: '12px',
        padding: '14px 18px',
        maxWidth: '240px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: 'var(--gold)', fontWeight: 800, marginBottom: '6px', fontSize: '15px' }}>
        {d.year}년 — {d.score}점
      </p>
      <p style={{ color: 'rgba(240,238,232,0.75)', fontSize: '13px', lineHeight: 1.6 }}>{d.reason}</p>
    </div>
  );
};

const BAR_COLORS = [
  '#D4AF37',
  '#C9A227',
  '#B8960C',
  'rgba(212,175,55,0.45)',
  'rgba(212,175,55,0.3)',
];

export default function GoldenYearsChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

  return (
    <div style={{ width: '100%', height: 290 }}>
      <ResponsiveContainer>
        <BarChart data={sorted} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#888', fontSize: 13, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#666', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(212,175,55,0.06)', radius: 6 }}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={56}>
            {sorted.map((entry, i) => (
              <Cell
                key={entry.year}
                fill={BAR_COLORS[i] ?? 'rgba(212,175,55,0.25)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
