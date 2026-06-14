require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

function parseConnectString(url) {
  if (!url) return undefined;
  const match = url.match(/@([^\s]+)$/);
  return match ? match[1] : url;
}

async function run() {
  const pool = await oracledb.createPool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectString: parseConnectString(process.env.DB_URL),
    poolMin: 1,
    poolMax: 2,
  });

  const conn = await pool.getConnection();
  try {
    for (const tbl of ['Detail', 'Booking', 'Customer', 'Staff', 'Seat', 'Movie']) {
      try {
        await conn.execute(`DROP TABLE ${tbl} CASCADE CONSTRAINTS`);
      } catch (e) {
        // ignore
      }
    }

    await conn.execute(`
      CREATE TABLE Customer (
        customer_id NUMBER(10) CONSTRAINT pk_customer PRIMARY KEY,
        customer_name VARCHAR2(100) NOT NULL,
        customer_email VARCHAR2(150)
      )
    `);

    await conn.execute(`
      CREATE TABLE Staff (
        staff_no NUMBER(10) CONSTRAINT pk_staff PRIMARY KEY,
        staff VARCHAR2(50) NOT NULL
      )
    `);

    await conn.execute(`
      CREATE TABLE Movie (
        movie_id VARCHAR2(10) CONSTRAINT pk_movie PRIMARY KEY,
        movie_title VARCHAR2(200) NOT NULL
      )
    `);

    await conn.execute(`
      CREATE TABLE Seat (
        seat_num NUMBER(10) CONSTRAINT pk_seat PRIMARY KEY,
        names VARCHAR2(10) NOT NULL,
        types VARCHAR2(20) NOT NULL
      )
    `);

    await conn.execute(`
      CREATE TABLE Booking (
        booking_id NUMBER(10) CONSTRAINT pk_booking PRIMARY KEY,
        show_datetime TIMESTAMP,
        customer_id NUMBER(10) NOT NULL,
        staff_no NUMBER(10) NOT NULL,
        location VARCHAR2(100),
        booking_by VARCHAR2(50),
        booking_status VARCHAR2(30),
        CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES Customer (customer_id),
        CONSTRAINT fk_booking_staff FOREIGN KEY (staff_no) REFERENCES Staff (staff_no)
      )
    `);

    await conn.execute(`
      CREATE TABLE Detail (
        booking_id NUMBER(10) NOT NULL,
        seat_num NUMBER(10) NOT NULL,
        hall_name VARCHAR2(50),
        movie_id VARCHAR2(10) NOT NULL,
        show_date DATE NOT NULL,
        show_time VARCHAR2(10) NOT NULL,
        screen VARCHAR2(20),
        price NUMBER(8,2) NOT NULL,
        CONSTRAINT pk_detail PRIMARY KEY (booking_id, seat_num),
        CONSTRAINT fk_detail_booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id),
        CONSTRAINT fk_detail_seat FOREIGN KEY (seat_num) REFERENCES Seat (seat_num),
        CONSTRAINT fk_detail_movie FOREIGN KEY (movie_id) REFERENCES Movie (movie_id)
      )
    `);

    const customers = Array.from({ length: 10 }, (_, i) => [
      201 + i,
      `Customer ${i + 1}`,
      `customer${i + 1}@mail.com`,
    ]);

    const staff = Array.from({ length: 10 }, (_, i) => [
      301 + i,
      ['Cashier', 'ATM', 'Supervisor', 'Manager', 'Security', 'Usher', 'Technician'][i % 7],
    ]);

    const movies = [
      ['M006', 'Spider-Man: Beyond the Spider-Verse'],
      ['M007', 'Black Panther 3'],
      ['M008', 'Interstellar 2'],
      ['M009', 'Frozen 3'],
      ['M010', 'The Batman 2'],
    ];

    const seats = Array.from({ length: 10 }, (_, i) => [
      i + 1,
      `S${i + 1}`,
      ['STANDARD', 'VIP', 'IMAX'][i % 3],
    ]);

    // Jul 2025 - Jun 2026 monthly booking targets: 600 bookings, 1800 detail rows.
    const monthlyTargets = [
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

    const movieTargets = [
      { movieId: 'M006', target: 450 },
      { movieId: 'M007', target: 410 },
      { movieId: 'M008', target: 370 },
      { movieId: 'M009', target: 330 },
      { movieId: 'M010', target: 240 },
    ];

    const hallTargets = [
      { hallName: 'Hall A', target: 780 },
      { hallName: 'Hall B', target: 620 },
      { hallName: 'IMAX Hall', target: 400 },
    ];

    const screens = ['2D', '3D', 'IMAX'];
    const prices = { '2D': 8, '3D': 10, 'IMAX': 12 };
    const times = ['10:00', '14:00', '15:30', '19:00', '20:00', '21:00'];

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

    const movieQueue = buildQueue(movieTargets);
    const hallQueue = buildQueue(hallTargets);
    let movieIdx = 0;
    let hallIdx = 0;
    let bookingId = 1;

    const bookings = [];
    const details = [];

    for (const { year, month, count } of monthlyTargets) {
      for (let i = 0; i < count; i++) {
        const day = (i % 28) + 1;
        const date = `${year}-${pad(month)}-${pad(day)}`;
        const time = times[i % times.length];
        const customerId = 201 + ((bookingId - 1) % 10);
        const staffNo = 301 + ((bookingId - 1) % 10);
        const location = ['AEON 1', 'AEON 2', 'AEON 3', 'CENTRAL', 'SORYA'][bookingId % 5];
        const bookingBy = ['Online', 'On Counter'][bookingId % 2];
        const status = ['Confirmed', 'Pending', 'Cancelled'][bookingId % 3];

        bookings.push([
          bookingId,
          `${date} ${time}:00`,
          customerId,
          staffNo,
          location,
          bookingBy,
          status,
        ]);

        for (let s = 0; s < 3; s++) {
          const seatNum = ((bookingId - 1) * 3 + s) % 10 + 1;
          const screen = screens[s % screens.length];
          details.push([
            bookingId,
            seatNum,
            hallQueue[hallIdx++],
            movieQueue[movieIdx++],
            date,
            time,
            screen,
            prices[screen],
          ]);
        }
        bookingId++;
      }
    }

    const insertMany = async (table, rows) => {
      const cols = rows[0].length;
      const placeholders = Array.from({ length: cols }, (_, i) => `:${i + 1}`).join(',');
      const sql = `INSERT INTO ${table} VALUES (${placeholders})`;
      for (const row of rows) {
        await conn.execute(sql, row);
      }
    };

    await insertMany('Customer', customers);
    await insertMany('Staff', staff);
    await insertMany('Movie', movies);
    await insertMany('Seat', seats);

    for (const b of bookings) {
      await conn.execute(
        `INSERT INTO Booking VALUES (:1, TO_TIMESTAMP(:2, 'YYYY-MM-DD HH24:MI:SS'), :3, :4, :5, :6, :7)`,
        b
      );
    }

    for (const d of details) {
      await conn.execute(
        `INSERT INTO Detail VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'), :6, :7, :8)`,
        d
      );
    }

    await conn.execute('COMMIT');

    const counts = await conn.execute(`
      SELECT 'Customer' AS tbl, COUNT(*) AS cnt FROM Customer UNION ALL
      SELECT 'Staff', COUNT(*) FROM Staff UNION ALL
      SELECT 'Movie', COUNT(*) FROM Movie UNION ALL
      SELECT 'Seat', COUNT(*) FROM Seat UNION ALL
      SELECT 'Booking', COUNT(*) FROM Booking UNION ALL
      SELECT 'Detail', COUNT(*) FROM Detail
    `);
    console.log('Database seeded. Row counts:');
    console.table(counts.rows);
  } finally {
    await conn.close();
    await pool.close(0);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
