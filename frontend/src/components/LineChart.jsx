import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function LineChart({ data = [], color = '#0D2463', yLabel = '' }) {
  if (!data.length) return <p className="chart-empty">No data - adjust filters</p>;

  const formatted = data.map(r => ({ name: r.LABEL, value: Number(r.VALUE) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RLineChart data={formatted} margin={{ top: 10, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6B7A99' }}
          axisLine={{ stroke: '#E0E6F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7A99' }}
          axisLine={false}
          tickLine={false}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6B7A99', offset: 14 }}
        />
        <Tooltip
          contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E0E6F0' }}
          formatter={val => [val, yLabel]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 7 }}
        />
      </RLineChart>
    </ResponsiveContainer>
  );
}
