// ============================================================
// Synthetic dataset used for mock-data fallbacks.
// Mirrors the full dashboard dataset (Jul 2025 - Jun 2026)
// so the UI still responds when the Oracle DB is unreachable.
// ============================================================
const MOVIES = [
  { id: 'M006', title: 'Spider-Man: Beyond the Spider-Verse', price2D: 8,  price3D: 10, priceImax: 12 },
  { id: 'M007', title: 'Black Panther 3',                     price2D: 8,  price3D: 10, priceImax: 12 },
  { id: 'M008', title: 'Interstellar 2',                      price2D: 8,  price3D: 10, priceImax: 12 },
  { id: 'M009', title: 'Frozen 3',                            price2D: 8,  price3D: 10, priceImax: 12 },
  { id: 'M010', title: 'The Batman 2',                        price2D: 8,  price3D: 10, priceImax: 12 },
];

const HALLS = ['Hall A', 'Hall B', 'IMAX Hall'];
const SCREENS = ['2D', '3D', 'IMAX'];
const SEAT_TYPES = ['STANDARD', 'VIP', 'IMAX'];

// Jul 2025 - Jun 2026 monthly booking targets.
const MONTHLY_TARGETS = [
  { year: 2025, month: 7,  count: 40 },
  { year: 2025, month: 8,  count: 50 },
  { year: 2025, month: 9,  count: 55 },
  { year: 2025, month: 10, count: 60 },
  { year: 2025, month: 11, count: 48 },
  { year: 2025, month: 12, count: 52 },
  { year: 2026, month: 1,  count: 56 },
  { year: 2026, month: 2,  count: 45 },
  { year: 2026, month: 3,  count: 36 },
  { year: 2026, month: 4,  count: 65 },
  { year: 2026, month: 5,  count: 26 },
  { year: 2026, month: 6,  count: 67 },
];

// 600 bookings * 3 tickets = 1800 detail rows.
const MOVIE_TARGETS = [
  { movieId: 'M006', target: 450 },
  { movieId: 'M007', target: 410 },
  { movieId: 'M008', target: 370 },
  { movieId: 'M009', target: 330 },
  { movieId: 'M010', target: 240 },
];

const HALL_TARGETS = [
  { hallName: 'Hall A', target: 780 },
  { hallName: 'Hall B', target: 620 },
  { hallName: 'IMAX Hall', target: 400 },
];

const TIMES = ['10:00', '14:00', '15:30', '19:00', '20:00', '21:00'];
const PRICES = { '2D': 8, '3D': 10, 'IMAX': 12 };

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildQueue(targets) {
  const queue = [];
  let idx = 0;
  const remaining = targets.map(t => ({ ...t }));
  while (remaining.some(t => t.target > 0)) {
    if (remaining[idx].target > 0) {
      queue.push(remaining[idx].movieId || remaining[idx].hallName);
      remaining[idx].target--;
    }
    idx = (idx + 1) % remaining.length;
  }
  return queue;
}

function generateDetailRows() {
  const rows = [];
  const movieQueue = buildQueue(MOVIE_TARGETS);
  const hallQueue = buildQueue(HALL_TARGETS);
  let movieIdx = 0;
  let hallIdx = 0;
  let bookingId = 1;
  let seatNum = 1;

  for (const { year, month, count } of MONTHLY_TARGETS) {
    for (let i = 0; i < count; i++) {
      const day = (i % 28) + 1;
      const date = `${year}-${pad(month)}-${pad(day)}`;
      const time = TIMES[i % TIMES.length];

      for (let s = 0; s < 3; s++) {
        const screen = SCREENS[s % SCREENS.length];
        rows.push({
          booking_id: bookingId,
          seat_num: seatNum,
          hall_name: hallQueue[hallIdx++],
          movie_id: movieQueue[movieIdx++],
          show_date: date,
          show_time: time,
          screen,
          price: PRICES[screen],
        });
        seatNum++;
      }
      bookingId++;
    }
  }
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

module.exports = {
  MOVIES,
  HALLS,
  SCREENS,
  SEAT_TYPES,
  MONTHLY_TARGETS,
  MOVIE_TARGETS,
  HALL_TARGETS,
  TIMES,
  PRICES,
  DETAIL_ROWS,
  SEAT_ROWS,
  MOVIE_ROWS,
};
