import { useEffect, useState } from 'react';
import Navbar            from './components/Navbar';
import KpiSection        from './components/KpiSection';
import LeftSidebar       from './components/LeftSidebar';
import DailyBookingCard  from './components/DailyBookingCard';
import MonthlyIncomeCard from './components/MonthlyIncomeCard';
import MonthlyBookingCard from './components/MonthlyBookingCard';
import { fetchKpi, fetchSessions, fetchStaticCharts } from './api/dashboard';

export default function App() {
  const [kpi,          setKpi]     = useState(null);
  const [sessions,     setSessions] = useState([]);
  const [staticCharts, setStatic]  = useState(null);
  const [loading,      setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKpi(), fetchSessions(), fetchStaticCharts()])
      .then(([k, s, c]) => {
        setKpi(k.data);
        setSessions(s.data);
        setStatic(c.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-loading">
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <KpiSection kpi={kpi} />
        <div className="dashboard-grid">
          <LeftSidebar charts={staticCharts} />
          <div className="right-panel">
            <DailyBookingCard  sessions={sessions} />
            <MonthlyIncomeCard  sessions={sessions} />
            <MonthlyBookingCard sessions={sessions} />
          </div>
        </div>
      </main>
    </div>
  );
}
