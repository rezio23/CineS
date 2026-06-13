export default function FilterBar({
  sessions,
  session,    onSession,
  dateFrom,   onDateFrom,
  dateTo,     onDateTo,
  showDate = false,
  singleDate,
  onSingleDate,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Session</label>
        <select
          className="filter-select"
          value={session}
          onChange={e => onSession(e.target.value)}
        >
          <option value="">All sessions</option>
          {sessions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {showDate && (
        <>
          <div className="filter-group">
            <label className="filter-label">From</label>
            <input
              type="date"
              className="filter-input"
              value={dateFrom}
              onChange={e => onDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To</label>
            <input
              type="date"
              className="filter-input"
              value={dateTo}
              onChange={e => onDateTo(e.target.value)}
            />
          </div>
          <button
            className="filter-reset"
            onClick={() => { onSession(''); onDateFrom(''); onDateTo(''); }}
          >
            Reset
          </button>
        </>
      )}

      {singleDate !== undefined && (
        <>
          <div className="filter-group">
            <label className="filter-label">Date</label>
            <input
              type="date"
              className="filter-input"
              value={singleDate}
              onChange={e => onSingleDate(e.target.value)}
            />
          </div>
          <button
            className="filter-reset"
            onClick={() => { onSession(''); onSingleDate(''); }}
          >
            Reset
          </button>
        </>
      )}
    </div>
  );
}
