require('dotenv').config({ path: '../.env' });
const oracledb = require('oracledb');

// Jul 2025 - Jun 2026 monthly booking targets.
const TARGETS = [
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

// Total bookings = 600, detail rows = 1800.
const MOVIE_TARGETS = [
  { movieId: 'M006', target: 450 }, // Spider-Man
  { movieId: 'M007', target: 410 }, // Black Panther 3
  { movieId: 'M008', target: 370 }, // Interstellar 2
  { movieId: 'M009', target: 330 }, // Frozen 3
  { movieId: 'M010', target: 240 }, // The Batman 2
];

const HALL_TARGETS = [
  { hallName: 'Hall A', target: 780 },
  { hallName: 'Hall B', target: 620 },
  { hallName: 'IMAX Hall', target: 400 },
];

const SCREENS = ['2D', '3D', 'IMAX'];
const PRICES = { '2D': 8, '3D': 10, 'IMAX': 12 };
const TIMES = ['10:00', '14:00', '15:30', '19:00', '20:00', '21:00'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildQueue(targets) {
  const queue = [];
  let idx = 0;
  let remaining = targets.map(t => ({ ...t }));
  while (remaining.some(t => t.target > 0)) {
    if (remaining[idx].target > 0) {
      const key = remaining[idx].movieId || remaining[idx].hallName;
      queue.push(key);
      remaining[idx].target--;
    }
    idx = (idx + 1) % remaining.length;
  }
  return queue;
}

async function run() {
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  if (!user || !password) {
    throw new Error('DB_USERNAME and DB_PASSWORD must be set in ../.env');
  }

  const connection = await oracledb.getConnection({
    user,
    password,
    connectString: 'localhost:1539/Reziooo',
  });

  try {
    console.log('Deleting Jul 2025 - Jun 2026 Detail rows...');
    const delResult = await connection.execute(
      `DELETE FROM Detail WHERE show_date BETWEEN DATE '2025-07-01' AND DATE '2026-06-30'`
    );
    console.log('Deleted rows:', delResult.rowsAffected);

    const movieQueue = buildQueue(MOVIE_TARGETS);
    const hallQueue = buildQueue(HALL_TARGETS);
    let movieIdx = 0;
    let hallIdx = 0;
    let bookingId = 1;
    const detailSql = `INSERT INTO Detail (booking_id, seat_num, hall_name, movie_id, show_date, show_time, screen, price)
                       VALUES (:booking_id, :seat_num, :hall_name, :movie_id, TO_DATE(:show_date, 'YYYY-MM-DD'), :show_time, :screen, :price)`;

    for (const { year, month, count } of TARGETS) {
      for (let i = 0; i < count; i++) {
        const day = (i % 28) + 1;
        const dateStr = `${year}-${pad(month)}-${pad(day)}`;
        const time = TIMES[i % TIMES.length];

        for (let s = 0; s < 3; s++) {
          const seatNum = ((bookingId - 1) * 3 + s) % 10 + 1;
          const screen = SCREENS[s % SCREENS.length];
          await connection.execute(detailSql, {
            booking_id: bookingId,
            seat_num: seatNum,
            hall_name: hallQueue[hallIdx++],
            movie_id: movieQueue[movieIdx++],
            show_date: dateStr,
            show_time: time,
            screen,
            price: PRICES[screen],
          });
        }
        bookingId++;
      }
    }

    await connection.commit();
    console.log('Inserted Detail rows for', bookingId - 1, 'bookings');
  } finally {
    await connection.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
