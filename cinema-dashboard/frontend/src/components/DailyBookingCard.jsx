import { useState, useEffect } from 'react';
import DonutChart from './DonutChart';
import FilterBar  from './FilterBar';
import { fetchDaily } from '../api/dashboard';

export default function DailyBookingCard({ sessions }) {
  const [session, setSession] = useState('');
  const [date,    setDate]    = useState('');
  const [data,    setData]    = useState([]);

  useEffect(() => {
    fetchDaily(
      session || undefined,
      date    || undefined,
    )
      .then(r => setData(r.data))
      .catch(console.error);
  }, [session, date]);

  return (
    <div className="right-card">
      <div className="card-header">
        <h3 className="chart-title">Daily Booking</h3>
        <FilterBar
          sessions={sessions}
          session={session}     onSession={setSession}
          singleDate={date}   onSingleDate={setDate}
        />
      </div>
      <DonutChart data={data} />
    </div>
  );
}
