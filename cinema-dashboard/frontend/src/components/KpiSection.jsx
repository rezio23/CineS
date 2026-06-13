import KpiCard from './KpiCard';

export default function KpiSection({ kpi }) {
  if (!kpi) return null;
  return (
    <section className="kpi-grid">
      <KpiCard icon="??" label="Total Movies"   value={kpi.totalMovies}              />
      <KpiCard icon="???" label="Total Bookings"  value={kpi.totalBookings}             />
      <KpiCard icon="??" label="Total Revenue"  value={`$${kpi.totalRevenue}`} accent />
    </section>
  );
}
