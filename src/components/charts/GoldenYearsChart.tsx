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
    <div style={{
      background: '#ffffff',
      border: '1px solid #e7e5e4',
      borderRadius: '12px',
      padding: '14px 18px',
      maxWidth: '240px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    }}>
      <p style={{ color: '#3f6212', fontWeight: 800, marginBottom: '6px', fontSize: '15px' }}>
        {d.year}년 — {d.score}점
      </p>
      <p style={{ color: '#44403c', fontSize: '13px', lineHeight: 1.6 }}>{d.reason}</p>
    </div>
  );
};

// V67 monochrome — #1 gets lime, rest neutral gray ramp
const BAR_COLORS = ['#84cc16', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

export default function GoldenYearsChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

  return (
    <div style={{ width: '100%', height: 290 }}>
      <ResponsiveContainer>
        <BarChart data={sorted} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#44403c', fontSize: 13, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#78716c', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: '#ecfccb', radius: 6 }}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={56}>
            {sorted.map((entry, i) => (
              <Cell key={entry.year} fill={BAR_COLORS[i] ?? '#e5e5e5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
