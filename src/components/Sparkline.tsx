import { AreaChart, Area, ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

export function Sparkline({ data, color = '#0e8585', height = 40 }: { data: number[]; color?: string; height?: number }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color.replace('#', '')})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniForecastChart({ data, height = 36 }: { data: { day: number; demand: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <YAxis hide domain={[0, 'dataMax']} />
        <Line type="monotone" dataKey="demand" stroke="#294166" strokeWidth={2} dot={{ r: 2, fill: '#294166', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
