import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PALETTE = [
  "#0D2463",
  "#1A3A8F",
  "#1E54D4",
  "#4A7EE8",
  "#7BA8F0",
  "#A8C4F8",
  "#E0EBFF",
];

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DonutChart({ data = [] }) {
  if (!data.length) return <p className="chart-empty">No data</p>;

  const formatted = data.map(r => ({ name: r.LABEL, value: Number(r.VALUE) }));
  const total = formatted.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="donut-wrapper">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {formatted.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={1.5} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => {
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
              return [`${val} (${pct}%)`, name];
            }}
            contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #E0E6F0" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-legend">
        {formatted.map((item, i) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={i} className="donut-legend-item">
              <span
                className="donut-legend-dot"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="donut-legend-label" title={item.name}>
                {item.name}
              </span>
              <span className="donut-legend-pct">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
