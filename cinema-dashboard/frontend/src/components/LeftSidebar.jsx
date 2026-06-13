import DonutChart from './DonutChart';

function SideCard({ title, data }) {
  return (
    <div className="side-card">
      <h3 className="chart-title">{title}</h3>
      <DonutChart data={data} />
    </div>
  );
}

export default function LeftSidebar({ charts }) {
  if (!charts) return null;
  return (
    <aside className="left-sidebar">
      <SideCard title="Theatre Type" data={charts.theatreType} />
      <SideCard title="Movie"        data={charts.movie}       />
      <SideCard title="Seat Type"    data={charts.seatType}    />
    </aside>
  );
}
