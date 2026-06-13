import { useState, useEffect }  from 'react';
import ColumnChart from './ColumnChart';
import FilterBar   from './FilterBar';
import { fetchMonthlyBooking } from '../api/dashboard';

export default function MonthlyBookingCard({ sessions }) {
  const [session,  setSession]  = useState('');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo,   setDateTo]   = useState('2026-12-31');
  const [data,     setData]     = useState([]);

  useEffect(() => {
    fetchMonthlyBooking(
      session  || undefined,
      dateFrom || undefined,
      dateTo   || undefined,
    )
      .then(r => setData(r.data))
      .catch(console.error);
  }, [session, dateFrom, dateTo]);

  return (
    <div className="right-card">
      <div className="card-header">
        <h3 className="chart-title">Monthly Booking</h3>
        <FilterBar
          sessions={sessions}
          session={session}   onSession={setSession}
          dateFrom={dateFrom} onDateFrom={setDateFrom}
          dateTo={dateTo}     onDateTo={setDateTo}
          showDate
        />
      </div>
      <ColumnChart data={data} yLabel="Bookings" color="#1E54D4" />
    </div>
  );
}
