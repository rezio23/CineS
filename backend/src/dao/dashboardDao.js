const { query } = require('../config/db');
const { buildWhere } = require('../utils/queryBuilder');

async function getKpiCounts() {
  const [movies, bookings, revenue] = await Promise.all([
    query('SELECT COUNT(*) AS TOTAL FROM Movie'),
    query('SELECT COUNT(*) AS TOTAL FROM Booking'),
    query('SELECT NVL(SUM(price), 0) AS TOTAL FROM Detail'),
  ]);
  return {
    totalMovies:   movies[0].TOTAL,
    totalBookings: bookings[0].TOTAL,
    totalRevenue:  Number(revenue[0].TOTAL).toFixed(2),
  };
}

async function getSessions() {
  const rows = await query(`
    SELECT DISTINCT show_time AS VALUE
    FROM Detail
    ORDER BY show_time
  `);
  return rows.map(r => r.VALUE);
}

async function getStaticCharts() {
  const [theatreType, movie, seatType] = await Promise.all([
    query(`
      SELECT hall_name AS LABEL, COUNT(*) AS VALUE
      FROM Detail
      GROUP BY hall_name
      ORDER BY VALUE DESC
    `),
    query(`
      SELECT m.title AS LABEL, COUNT(*) AS VALUE
      FROM Detail d
      JOIN Movie m ON d.movie_id = m.movie_id
      GROUP BY m.title
      ORDER BY VALUE DESC
    `),
    query(`
      SELECT s.types AS LABEL, COUNT(*) AS VALUE
      FROM Detail d
      JOIN Seat s ON d.seat_num = s.seat_num
      GROUP BY s.types
      ORDER BY VALUE DESC
    `),
  ]);
  return { theatreType, movie, seatType };
}

async function getDailyChart(session, date) {
  const conditions = ['1=1'];
  const binds      = {};

  if (session) { conditions.push('d.show_time = :sessionTime'); binds.sessionTime = session; }
  if (date)    { conditions.push('d.show_date = TO_DATE(:showDate, \'YYYY-MM-DD\')'); binds.showDate = date; }

  const rows = await query(`
    SELECT d.show_time AS LABEL,
    COUNT(DISTINCT d.booking_id) AS VALUE
    FROM Detail d
    WHERE ${conditions.join(' AND ')}
    GROUP BY d.show_time
    ORDER BY d.show_time
  `, binds);

  return rows;
}

async function getMonthlyIncome(session, dateFrom, dateTo) {
  const { where, binds } = buildWhere(session, dateFrom, dateTo);

  const rows = await query(`
    SELECT TO_CHAR(d.show_date, 'Mon YYYY')           AS LABEL,
    ROUND(SUM(d.price), 2)                     AS VALUE
    FROM Detail d
    WHERE ${where}
    GROUP BY TO_CHAR(d.show_date, 'Mon YYYY'),
    TRUNC(d.show_date, 'MM')
    ORDER BY MIN(d.show_date)
  `, binds);

  return rows;
}

async function getMonthlyBooking(session, dateFrom, dateTo) {
  const { where, binds } = buildWhere(session, dateFrom, dateTo);

  const rows = await query(`
    SELECT TO_CHAR(d.show_date, 'Mon YYYY')  AS LABEL,
    COUNT(DISTINCT d.booking_id)     AS VALUE
    FROM Detail d
    WHERE ${where}
    GROUP BY TO_CHAR(d.show_date, 'Mon YYYY'),
    TRUNC(d.show_date, 'MM')
    ORDER BY MIN(d.show_date)
  `, binds);

  return rows;
}

module.exports = {
  getKpiCounts,
  getSessions,
  getStaticCharts,
  getDailyChart,
  getMonthlyIncome,
  getMonthlyBooking,
};
