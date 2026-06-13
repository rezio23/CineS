import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ColumnChart({ data = [], yLabel = '', color = '#1E54D4' }) {
  if (!data.length) return <p className="chart-empty">No data - adjust filters</p>;

  const formatted = data.map(r => ({ name: r.LABEL, value: Number(r.VALUE) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 10, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" vertical={false} />
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
        <Bar
          dataKey="value"
          fill={color}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
