const express = require('express');
const { query } = require('../db');
const router  = express.Router();

// ============================================================
// Synthetic dataset used for mock-data fallbacks.
// Mirrors the seed rows in Oracle_Cinema.sql so the UI still
// responds to filters when the Oracle DB is not reachable.
// ============================================================
const MOVIES = [
  { id: 'M006', title: 'Spider-Man: Beyond the Spider-Verse', price2D: 9,  price3D: 11, priceImax: 14 },
  { id: 'M007', title: 'Black Panther 3',               price2D: 9,  price3D: 11, priceImax: 14 },
  { id: 'M008', title: 'Interstellar 2',                price2D: 10, price3D: 12, priceImax: 15 },
  { id: 'M009', title: 'Frozen 3',                      price2D: 8,  price3D: 10, priceImax: 12 },
  { id: 'M010', title: 'The Batman 2',                  price2D: 9,  price3D: 11, priceImax: 14 },
];

const HALLS = ['Hall A', 'Hall B', 'IMAX Hall'];
const SCREENS = ['2D', '3D', 'IMAX'];
const SESSIONS = ['10:00', '14:00', '15:30', '19:00', '20:00'];
const SEAT_TYPES = ['STANDARD', 'VIP', 'IMAX'];

function getSeatType(rowIndex) {
  return SEAT_TYPES[rowIndex % SEAT_TYPES.length];
}

function getScreen(seatType) {
  if (seatType === 'IMAX') return 'IMAX';
  return rowIndex >> 1 ? '3D' : '2D';
}

function generateDetailRows() {
  const rows = [];
  let bookingId = 1;
  let seatNum = 1;

  // Fallback data mirrors the seeded dataset:
  // 35 Jan-Jun bookings + 10 bookings per day for current week (8-14 Jun)
  const bookingDefs = [
    ['2026-06-13', '21:00'], ['2026-02-27', '15:30'], ['2026-04-19', '21:00'],
    ['2026-03-01', '19:00'], ['2026-02-20', '14:00'], ['2026-04-25', '14:00'],
    ['2026-04-19', '19:00'], ['2026-03-28', '14:00'], ['2026-04-02', '14:00'],
    ['2026-04-28', '10:00'], ['2026-05-22', '15:30'], ['2026-02-19', '21:00'],
    ['2026-02-28', '10:00'], ['2026-04-08', '20:00'], ['2026-04-05', '10:00'],
    ['2026-01-19', '10:00'], ['2026-04-29', '15:30'], ['2026-03-25', '15:30'],
    ['2026-04-13', '15:30'], ['2026-03-22', '21:00'], ['2026-04-28', '19:00'],
    ['2026-05-24', '15:30'], ['2026-04-13', '15:30'], ['2026-05-07', '14:00'],
    ['2026-06-10', '21:00'], ['2026-04-08', '19:00'], ['2026-01-03', '14:00'],
    ['2026-03-29', '20:00'], ['2026-04-27', '14:00'], ['2026-01-28', '10:00'],
    ['2026-04-06', '14:00'], ['2026-03-24', '19:00'], ['2026-03-20', '15:30'],
    ['2026-01-21', '21:00'], ['2026-02-02', '15:30'],
    ['2026-06-08', '14:00'], ['2026-06-08', '21:00'], ['2026-06-08', '10:00'],
    ['2026-06-08', '15:30'], ['2026-06-08', '15:30'], ['2026-06-08', '15:30'],
    ['2026-06-08', '14:00'], ['2026-06-08', '21:00'], ['2026-06-08', '14:00'],
    ['2026-06-08', '14:00'],
    ['2026-06-09', '20:00'], ['2026-06-09', '21:00'], ['2026-06-09', '19:00'],
    ['2026-06-09', '10:00'], ['2026-06-09', '20:00'], ['2026-06-09', '10:00'],
    ['2026-06-09', '10:00'], ['2026-06-09', '14:00'], ['2026-06-09', '20:00'],
    ['2026-06-09', '19:00'],
    ['2026-06-10', '10:00'], ['2026-06-10', '19:00'], ['2026-06-10', '21:00'],
    ['2026-06-10', '21:00'], ['2026-06-10', '14:00'], ['2026-06-10', '19:00'],
    ['2026-06-10', '14:00'], ['2026-06-10', '10:00'], ['2026-06-10', '14:00'],
    ['2026-06-10', '19:00'],
    ['2026-06-11', '14:00'], ['2026-06-11', '15:30'], ['2026-06-11', '21:00'],
    ['2026-06-11', '14:00'], ['2026-06-11', '20:00'], ['2026-06-11', '15:30'],
    ['2026-06-11', '19:00'], ['2026-06-11', '20:00'], ['2026-06-11', '20:00'],
    ['2026-06-11', '10:00'],
    ['2026-06-12', '20:00'], ['2026-06-12', '21:00'], ['2026-06-12', '14:00'],
    ['2026-06-12', '19:00'], ['2026-06-12', '15:30'], ['2026-06-12', '20:00'],
    ['2026-06-12', '20:00'], ['2026-06-12', '15:30'], ['2026-06-12', '15:30'],
    ['2026-06-12', '21:00'],
    ['2026-06-13', '20:00'], ['2026-06-13', '15:30'], ['2026-06-13', '20:00'],
    ['2026-06-13', '20:00'], ['2026-06-13', '21:00'], ['2026-06-13', '10:00'],
    ['2026-06-13', '10:00'], ['2026-06-13', '21:00'], ['2026-06-13', '19:00'],
    ['2026-06-13', '10:00'],
    ['2026-06-14', '14:00'], ['2026-06-14', '20:00'], ['2026-06-14', '14:00'],
    ['2026-06-14', '10:00'], ['2026-06-14', '14:00'], ['2026-06-14', '19:00'],
    ['2026-06-14', '14:00'], ['2026-06-14', '21:00'], ['2026-06-14', '21:00'],
    ['2026-06-14', '21:00'],
  ];

  bookingDefs.forEach((def, idx) => {
    const [date, time] = def;
    const movie = MOVIES[idx % MOVIES.length];
    const hall = HALLS[idx % HALLS.length];
    const screen = SCREENS[idx % SCREENS.length];
    const price = screen === 'IMAX' ? movie.priceImax : screen === '3D' ? movie.price3D : movie.price2D;
    const ticketCount = 3;

    for (let t = 0; t < ticketCount; t++) {
      rows.push({
        booking_id: bookingId,
        seat_num: seatNum,
        hall_name: hall,
        movie_id: movie.id,
        show_date: date,
        show_time: time,
        screen,
        price: Number(price.toFixed(2)),
      });
      seatNum++;
    }
    bookingId++;
  });
  return rows;
}

const DETAIL_ROWS = generateDetailRows();

function generateSeatRows() {
  const rows = [];
  const totalSeats = DETAIL_ROWS.length;
  for (let i = 1; i <= totalSeats; i++) {
    rows.push({ seat_num: i, names: `S${i}`, types: SEAT_TYPES[i % SEAT_TYPES.length] });
  }
  return rows;
}

const SEAT_ROWS = generateSeatRows();

const MOVIE_ROWS = [
  { movie_id: 'M006', movie_title: 'Spider-Man: Beyond the Spider-Verse' },
  { movie_id: 'M007', movie_title: 'Black Panther 3' },
  { movie_id: 'M008', movie_title: 'Interstellar 2' },
  { movie_id: 'M009', movie_title: 'Frozen 3' },
  { movie_id: 'M010', movie_title: 'The Batman 2' },
];

// ============================================================
// Helpers: build dynamic WHERE clause for live Oracle queries
// ============================================================
function buildWhere(session, dateFrom, dateTo) {
  const conditions = ['1=1'];
  const binds      = {};
  if (session)  { conditions.push('d.show_time = :sessionTime');                            binds.sessionTime = session; }
  if (dateFrom) { conditions.push('d.show_date >= TO_DATE(:dateFrom, \'YYYY-MM-DD\')');     binds.dateFrom    = dateFrom; }
  if (dateTo)   { conditions.push('d.show_date <= TO_DATE(:dateTo,   \'YYYY-MM-DD\')');     binds.dateTo      = dateTo;   }
  return { where: conditions.join(' AND '), binds };
}

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
    groups[r.show_time] = (groups[r.show_time] || 0) + 1;
  });
  return Object.entries(groups)
    .map(([LABEL, VALUE]) => ({ LABEL, VALUE }))
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
    groups[LABEL] = (groups[LABEL] || 0) + 1;
  });
  return Object.entries(groups)
    .map(([LABEL, VALUE]) => ({ LABEL, VALUE }))
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

// ============================================================
// GET /api/kpi
// ============================================================
router.get('/kpi', async (req, res) => {
  try {
    const [movies, bookings, revenue] = await Promise.all([
      query('SELECT COUNT(*) AS TOTAL FROM Movie'),
      query('SELECT COUNT(*) AS TOTAL FROM Booking'),
      query('SELECT NVL(SUM(price), 0) AS TOTAL FROM Detail'),
    ]);
    res.json({
      totalMovies:   movies[0].TOTAL,
      totalBookings: bookings[0].TOTAL,
      totalRevenue:  Number(revenue[0].TOTAL).toFixed(2),
    });
  } catch (err) {
    console.warn('[MOCK] /api/kpi falling back to mock data:', err.message);
    res.json({
      totalMovies:   MOVIE_ROWS.length,
      totalBookings: new Set(DETAIL_ROWS.map(r => r.booking_id)).size,
      totalRevenue:  DETAIL_ROWS.reduce((sum, r) => sum + r.price, 0).toFixed(2),
    });
  }
});

// ============================================================
// GET /api/sessions
// ============================================================
router.get('/sessions', async (req, res) => {
  try {
    const rows = await query(`
      SELECT DISTINCT show_time AS VALUE
      FROM Detail
      ORDER BY show_time
    `);
    res.json(rows.map(r => r.VALUE));
  } catch (err) {
    console.warn('[MOCK] /api/sessions falling back to mock data:', err.message);
    const sessions = [...new Set(DETAIL_ROWS.map(r => r.show_time))].sort();
    res.json(sessions);
  }
});

// ============================================================
// GET /api/charts/static
// ============================================================
router.get('/charts/static', async (req, res) => {
  try {
    const [theatreType, movie, seatType] = await Promise.all([
      query(`
        SELECT hall_name AS LABEL, COUNT(*) AS VALUE
        FROM Detail
        GROUP BY hall_name
        ORDER BY VALUE DESC
      `),
      query(`
        SELECT m.movie_title AS LABEL, COUNT(*) AS VALUE
        FROM Detail d
        JOIN Movie m ON d.movie_id = m.movie_id
        GROUP BY m.movie_title
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
    res.json({ theatreType, movie, seatType });
  } catch (err) {
    console.warn('[MOCK] /api/charts/static falling back to mock data:', err.message);
    res.json(aggregateStatic());
  }
});

// ============================================================
// GET /api/charts/daily?session=&date=
// ============================================================
// Returns booking counts grouped by session (show_time) for the selected date.
router.get('/charts/daily', async (req, res) => {
  try {
    const { session, date } = req.query;
    const conditions = ['1=1'];
    const binds      = {};

    if (session) { conditions.push('d.show_time = :sessionTime'); binds.sessionTime = session; }
    if (date)    { conditions.push('d.show_date = TO_DATE(:showDate, \'YYYY-MM-DD\')'); binds.showDate = date; }

    const rows = await query(`
      SELECT d.show_time AS LABEL,
             COUNT(*)    AS VALUE
      FROM Detail d
      WHERE ${conditions.join(' AND ')}
      GROUP BY d.show_time
      ORDER BY d.show_time
    `, binds);

    res.json(rows);
  } catch (err) {
    console.warn('[MOCK] /api/charts/daily falling back to mock data:', err.message);
    const { session, date } = req.query;
    const details = filterDetailsByDate(session, date);
    res.json(aggregateDaily(details));
  }
});

// ============================================================
// GET /api/charts/monthly-income?session=&dateFrom=&dateTo=
// ============================================================
router.get('/charts/monthly-income', async (req, res) => {
  try {
    const { session, dateFrom, dateTo } = req.query;
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

    const mockDetails = filterDetails(session, dateFrom, dateTo);
    const mockRows = aggregateMonthlyIncome(mockDetails);

    // Merge live DB rows with generated mock rows so every month in the range has data.
    const merged = new Map();
    mockRows.forEach(r => merged.set(r.LABEL, r));
    (rows || []).forEach(r => merged.set(r.LABEL, r));
    res.json([...merged.values()].sort((a, b) => new Date('1 ' + a.LABEL) - new Date('1 ' + b.LABEL)));
  } catch (err) {
    console.warn('[MOCK] /api/charts/monthly-income falling back to mock data:', err.message);
    const { session, dateFrom, dateTo } = req.query;
    const details = filterDetails(session, dateFrom, dateTo);
    res.json(aggregateMonthlyIncome(details));
  }
});

// ============================================================
// GET /api/charts/monthly-booking?session=&dateFrom=&dateTo=
// ============================================================
router.get('/charts/monthly-booking', async (req, res) => {
  try {
    const { session, dateFrom, dateTo } = req.query;
    const { where, binds } = buildWhere(session, dateFrom, dateTo);

    const rows = await query(`
      SELECT TO_CHAR(d.show_date, 'Mon YYYY')  AS LABEL,
             COUNT(*)                          AS VALUE
      FROM Detail d
      WHERE ${where}
      GROUP BY TO_CHAR(d.show_date, 'Mon YYYY'),
               TRUNC(d.show_date, 'MM')
      ORDER BY MIN(d.show_date)
    `, binds);

    const mockDetails = filterDetails(session, dateFrom, dateTo);
    const mockRows = aggregateMonthlyBooking(mockDetails);

    const merged = new Map();
    mockRows.forEach(r => merged.set(r.LABEL, r));
    (rows || []).forEach(r => merged.set(r.LABEL, r));
    res.json([...merged.values()].sort((a, b) => new Date('1 ' + a.LABEL) - new Date('1 ' + b.LABEL)));
  } catch (err) {
    console.warn('[MOCK] /api/charts/monthly-booking falling back to mock data:', err.message);
    const { session, dateFrom, dateTo } = req.query;
    const details = filterDetails(session, dateFrom, dateTo);
    res.json(aggregateMonthlyBooking(details));
  }
});

module.exports = router;
