const { DETAIL_ROWS, SEAT_ROWS, MOVIE_ROWS } = require('../models/mockDataset');

// ============================================================
// Helpers: filter / aggregate the synthetic fallback dataset
// ============================================================
function parseDate(str) {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function filterDetails(session, dateFrom, dateTo) {
  const from = parseDate(dateFrom);
  const to   = parseDate(dateTo);
  return DETAIL_ROWS.filter(r => {
    if (session && r.show_time !== session) return false;
    const rowDate = parseDate(r.show_date);
    if (from && rowDate < from) return false;
    if (to   && rowDate > to)   return false;
    return true;
  });
}

function filterDetailsByDate(session, date) {
  const target = parseDate(date);
  return DETAIL_ROWS.filter(r => {
    if (session && r.show_time !== session) return false;
    if (target) {
      const rowDate = parseDate(r.show_date);
      if (!rowDate || rowDate.getTime() !== target.getTime()) return false;
    }
    return true;
  });
}

function aggregateDaily(details) {
  const groups = {};
  details.forEach(r => {
    if (!groups[r.show_time]) groups[r.show_time] = new Set();
    groups[r.show_time].add(r.booking_id);
  });
  return Object.entries(groups)
    .map(([LABEL, VALUE]) => ({ LABEL, VALUE: VALUE.size }))
    .sort((a, b) => a.LABEL.localeCompare(b.LABEL));
}

function aggregateMonthlyIncome(details) {
  const groups = {};
  details.forEach(r => {
    const d = new Date(r.show_date + 'T00:00:00');
    const LABEL = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    groups[LABEL] = (groups[LABEL] || 0) + r.price;
  });
  return Object.entries(groups)
    .map(([LABEL, VALUE]) => ({ LABEL, VALUE: Number(VALUE.toFixed(2)) }))
    .sort((a, b) => new Date('1 ' + a.LABEL) - new Date('1 ' + b.LABEL));
}

function aggregateMonthlyBooking(details) {
  const groups = {};
  details.forEach(r => {
    const d = new Date(r.show_date + 'T00:00:00');
    const LABEL = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    if (!groups[LABEL]) groups[LABEL] = new Set();
    groups[LABEL].add(r.booking_id);
  });
  return Object.entries(groups)
    .map(([LABEL, VALUE]) => ({ LABEL, VALUE: VALUE.size }))
    .sort((a, b) => new Date('1 ' + a.LABEL) - new Date('1 ' + b.LABEL));
}

function aggregateStatic() {
  const theatreType = {};
  const movie       = {};
  const seatType    = {};

  DETAIL_ROWS.forEach(r => {
    theatreType[r.hall_name] = (theatreType[r.hall_name] || 0) + 1;

    const m = MOVIE_ROWS.find(x => x.movie_id === r.movie_id);
    const title = m ? m.movie_title : r.movie_id;
    movie[title] = (movie[title] || 0) + 1;

    const s = SEAT_ROWS.find(x => x.seat_num === r.seat_num);
    const type = s ? s.types : 'UNKNOWN';
    seatType[type] = (seatType[type] || 0) + 1;
  });

  const toArray = obj => Object.entries(obj)
    .map(([LABEL, VALUE]) => ({ LABEL, VALUE }))
    .sort((a, b) => b.VALUE - a.VALUE);

  return { theatreType: toArray(theatreType), movie: toArray(movie), seatType: toArray(seatType) };
}

// Endpoint-shaped wrappers over the synthetic dataset.
function getKpi() {
  return {
    totalMovies:   MOVIE_ROWS.length,
    totalBookings: new Set(DETAIL_ROWS.map(r => r.booking_id)).size,
    totalRevenue:  DETAIL_ROWS.reduce((sum, r) => sum + r.price, 0).toFixed(2),
  };
}

function getSessions() {
  return [...new Set(DETAIL_ROWS.map(r => r.show_time))].sort();
}

function getStaticCharts() {
  return aggregateStatic();
}

function getDailyChart(session, date) {
  return aggregateDaily(filterDetailsByDate(session, date));
}

function getMonthlyIncome(session, dateFrom, dateTo) {
  return aggregateMonthlyIncome(filterDetails(session, dateFrom, dateTo));
}

function getMonthlyBooking(session, dateFrom, dateTo) {
  return aggregateMonthlyBooking(filterDetails(session, dateFrom, dateTo));
}

module.exports = {
  getKpi,
  getSessions,
  getStaticCharts,
  getDailyChart,
  getMonthlyIncome,
  getMonthlyBooking,
};
