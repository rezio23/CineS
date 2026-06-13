require('dotenv').config();
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

    const customers = [
      [201, 'Sophea Kim', 'sophea@mail.com'],
      [202, 'Ratha Noun', 'ratha@mail.com'],
      [203, 'Dara Sok', 'dara@mail.com'],
      [204, 'Bopha Chhay', 'bopha@mail.com'],
      [205, 'Visal Chea', 'visal@mail.com'],
      [206, 'Srey Pich', 'srey@mail.com'],
      [207, 'Kosal Nhem', 'kosal@mail.com'],
      [208, 'Malis Phan', 'malis@mail.com'],
      [209, 'Sothea Mao', 'sothea@mail.com'],
      [210, 'Reasmey Lim', 'reasmey@mail.com'],
    ];

    const staff = [
      [301, 'Cashier'], [302, 'ATM'], [303, 'Supervisor'], [304, 'Manager'],
      [305, 'Security'], [306, 'Usher'], [307, 'Cashier'], [308, 'Technician'],
      [309, 'Cashier'], [310, 'Supervisor'],
    ];

    const movies = [
      ['M006', 'Spider-Man: Beyond the Spider-Verse'],
      ['M007', 'Black Panther 3'],
      ['M008', 'Interstellar 2'],
      ['M009', 'Frozen 3'],
      ['M010', 'The Batman 2'],
    ];

    const seats = [
      [1, 'A1', 'STANDARD'], [2, 'A2', 'STANDARD'], [3, 'A3', 'VIP'], [4, 'B5', 'VIP'],
      [5, 'C1', 'STANDARD'], [6, 'F1', 'IMAX'], [7, 'B1', 'STANDARD'], [8, 'C3', 'VIP'],
      [9, 'D2', 'STANDARD'], [10, 'E4', 'IMAX'],
    ];

    // 105 bookings — Jan-Jun 2026 plus 10 per day for current week
    const bookingDefs = [
      ['2026-06-13', '21:00', 201, 301, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-02-27', '15:30', 202, 302, 'AEON 2', 'Online', 'Confirmed'],
      ['2026-04-19', '21:00', 203, 303, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-03-01', '19:00', 204, 304, 'AEON 1', 'Online', 'Confirmed'],
      ['2026-02-20', '14:00', 205, 305, 'AEON 2', 'Online', 'Cancelled'],
      ['2026-04-25', '14:00', 206, 306, 'CENTRAL', 'On Counter', 'Confirmed'],
      ['2026-04-19', '19:00', 207, 307, 'CENTRAL', 'On Counter', 'Confirmed'],
      ['2026-03-28', '14:00', 208, 308, 'SORYA', 'On Counter', 'Pending'],
      ['2026-04-02', '14:00', 209, 309, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-04-28', '10:00', 210, 310, 'SORYA', 'Online', 'Pending'],
      ['2026-05-22', '15:30', 201, 301, 'CENTRAL', 'On Counter', 'Confirmed'],
      ['2026-02-19', '21:00', 202, 302, 'SORYA', 'Online', 'Pending'],
      ['2026-02-28', '10:00', 203, 303, 'CENTRAL', 'On Counter', 'Cancelled'],
      ['2026-04-08', '20:00', 204, 304, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-04-05', '10:00', 205, 305, 'AEON 1', 'Online', 'Pending'],
      ['2026-01-19', '10:00', 206, 306, 'AEON 2', 'Online', 'Pending'],
      ['2026-04-29', '15:30', 207, 307, 'SORYA', 'On Counter', 'Confirmed'],
      ['2026-03-25', '15:30', 208, 308, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-04-13', '15:30', 209, 309, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-03-22', '21:00', 210, 310, 'AEON 2', 'Online', 'Pending'],
      ['2026-04-28', '19:00', 201, 301, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-05-24', '15:30', 202, 302, 'AEON 1', 'Online', 'Confirmed'],
      ['2026-04-13', '15:30', 203, 303, 'SORYA', 'On Counter', 'Confirmed'],
      ['2026-05-07', '14:00', 204, 304, 'CENTRAL', 'On Counter', 'Confirmed'],
      ['2026-06-10', '21:00', 205, 305, 'SORYA', 'On Counter', 'Cancelled'],
      ['2026-04-08', '19:00', 206, 306, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-01-03', '14:00', 207, 307, 'CENTRAL', 'On Counter', 'Cancelled'],
      ['2026-03-29', '20:00', 208, 308, 'SORYA', 'On Counter', 'Pending'],
      ['2026-04-27', '14:00', 209, 309, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-01-28', '10:00', 210, 310, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-04-06', '14:00', 201, 301, 'SORYA', 'Online', 'Pending'],
      ['2026-03-24', '19:00', 202, 302, 'CENTRAL', 'On Counter', 'Cancelled'],
      ['2026-03-20', '15:30', 203, 303, 'CENTRAL', 'Online', 'Cancelled'],
      ['2026-01-21', '21:00', 204, 304, 'AEON 1', 'On Counter', 'Cancelled'],
      ['2026-02-02', '15:30', 205, 305, 'AEON 1', 'On Counter', 'Pending'],
      ['2026-06-08', '14:00', 206, 306, 'SORYA', 'Online', 'Cancelled'],
      ['2026-06-08', '21:00', 207, 307, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-06-08', '10:00', 208, 308, 'AEON 3', 'Online', 'Confirmed'],
      ['2026-06-08', '15:30', 209, 309, 'AEON 2', 'Online', 'Cancelled'],
      ['2026-06-08', '15:30', 210, 310, 'SORYA', 'Online', 'Confirmed'],
      ['2026-06-08', '15:30', 201, 301, 'AEON 3', 'Online', 'Confirmed'],
      ['2026-06-08', '14:00', 202, 302, 'CENTRAL', 'Online', 'Confirmed'],
      ['2026-06-08', '21:00', 203, 303, 'SORYA', 'Online', 'Cancelled'],
      ['2026-06-08', '14:00', 204, 304, 'AEON 2', 'On Counter', 'Cancelled'],
      ['2026-06-08', '14:00', 205, 305, 'AEON 3', 'On Counter', 'Confirmed'],
      ['2026-06-09', '20:00', 206, 306, 'AEON 2', 'On Counter', 'Pending'],
      ['2026-06-09', '21:00', 207, 307, 'AEON 3', 'On Counter', 'Cancelled'],
      ['2026-06-09', '19:00', 208, 308, 'AEON 1', 'Online', 'Confirmed'],
      ['2026-06-09', '10:00', 209, 309, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-06-09', '20:00', 210, 310, 'AEON 2', 'Online', 'Confirmed'],
      ['2026-06-09', '10:00', 201, 301, 'AEON 1', 'Online', 'Confirmed'],
      ['2026-06-09', '10:00', 202, 302, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-06-09', '14:00', 203, 303, 'AEON 3', 'On Counter', 'Confirmed'],
      ['2026-06-09', '20:00', 204, 304, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-09', '19:00', 205, 305, 'SORYA', 'Online', 'Confirmed'],
      ['2026-06-10', '10:00', 206, 306, 'SORYA', 'On Counter', 'Pending'],
      ['2026-06-10', '19:00', 207, 307, 'SORYA', 'Online', 'Cancelled'],
      ['2026-06-10', '21:00', 208, 308, 'AEON 1', 'Online', 'Pending'],
      ['2026-06-10', '21:00', 209, 309, 'AEON 3', 'Online', 'Confirmed'],
      ['2026-06-10', '14:00', 210, 310, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-10', '19:00', 201, 301, 'AEON 2', 'On Counter', 'Pending'],
      ['2026-06-10', '14:00', 202, 302, 'AEON 1', 'On Counter', 'Cancelled'],
      ['2026-06-10', '10:00', 203, 303, 'AEON 1', 'Online', 'Confirmed'],
      ['2026-06-10', '14:00', 204, 304, 'AEON 2', 'On Counter', 'Pending'],
      ['2026-06-10', '19:00', 205, 305, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-11', '14:00', 206, 306, 'SORYA', 'Online', 'Pending'],
      ['2026-06-11', '15:30', 207, 307, 'SORYA', 'On Counter', 'Pending'],
      ['2026-06-11', '21:00', 208, 308, 'CENTRAL', 'On Counter', 'Confirmed'],
      ['2026-06-11', '14:00', 209, 309, 'AEON 3', 'Online', 'Confirmed'],
      ['2026-06-11', '20:00', 210, 310, 'CENTRAL', 'Online', 'Cancelled'],
      ['2026-06-11', '15:30', 201, 301, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-06-11', '19:00', 202, 302, 'CENTRAL', 'Online', 'Confirmed'],
      ['2026-06-11', '20:00', 203, 303, 'AEON 1', 'Online', 'Confirmed'],
      ['2026-06-11', '20:00', 204, 304, 'AEON 1', 'Online', 'Pending'],
      ['2026-06-11', '10:00', 205, 305, 'CENTRAL', 'Online', 'Cancelled'],
      ['2026-06-12', '20:00', 206, 306, 'AEON 1', 'Online', 'Pending'],
      ['2026-06-12', '21:00', 207, 307, 'CENTRAL', 'On Counter', 'Pending'],
      ['2026-06-12', '14:00', 208, 308, 'AEON 3', 'Online', 'Pending'],
      ['2026-06-12', '19:00', 209, 309, 'AEON 2', 'On Counter', 'Pending'],
      ['2026-06-12', '15:30', 210, 310, 'AEON 1', 'Online', 'Pending'],
      ['2026-06-12', '20:00', 201, 301, 'CENTRAL', 'Online', 'Confirmed'],
      ['2026-06-12', '20:00', 202, 302, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-12', '15:30', 203, 303, 'AEON 1', 'Online', 'Pending'],
      ['2026-06-12', '15:30', 204, 304, 'AEON 2', 'On Counter', 'Cancelled'],
      ['2026-06-12', '21:00', 205, 305, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-06-13', '20:00', 206, 306, 'AEON 3', 'Online', 'Confirmed'],
      ['2026-06-13', '15:30', 207, 307, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-06-13', '20:00', 208, 308, 'AEON 2', 'On Counter', 'Pending'],
      ['2026-06-13', '20:00', 209, 309, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-13', '21:00', 210, 310, 'AEON 3', 'On Counter', 'Pending'],
      ['2026-06-13', '10:00', 201, 301, 'AEON 1', 'On Counter', 'Pending'],
      ['2026-06-13', '10:00', 202, 302, 'AEON 1', 'On Counter', 'Confirmed'],
      ['2026-06-13', '21:00', 203, 303, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-06-13', '19:00', 204, 304, 'CENTRAL', 'On Counter', 'Cancelled'],
      ['2026-06-13', '10:00', 205, 305, 'AEON 1', 'Online', 'Cancelled'],
      ['2026-06-14', '14:00', 206, 306, 'CENTRAL', 'Online', 'Pending'],
      ['2026-06-14', '20:00', 207, 307, 'CENTRAL', 'Online', 'Pending'],
      ['2026-06-14', '14:00', 208, 308, 'AEON 1', 'On Counter', 'Pending'],
      ['2026-06-14', '10:00', 209, 309, 'AEON 3', 'Online', 'Cancelled'],
      ['2026-06-14', '14:00', 210, 310, 'AEON 1', 'On Counter', 'Cancelled'],
      ['2026-06-14', '19:00', 201, 301, 'CENTRAL', 'Online', 'Confirmed'],
      ['2026-06-14', '14:00', 202, 302, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-14', '14:00', 203, 303, 'AEON 3', 'On Counter', 'Cancelled'],
      ['2026-06-14', '21:00', 204, 304, 'AEON 2', 'On Counter', 'Confirmed'],
      ['2026-06-14', '21:00', 205, 305, 'AEON 1', 'On Counter', 'Confirmed'],
    ];

    const movieIds = ['M006', 'M007', 'M008', 'M009', 'M010'];
    const halls = ['Hall A', 'Hall B', 'IMAX Hall'];
    const screens = ['2D', '3D', 'IMAX'];
    const screenPrices = { '2D': 8, '3D': 10, 'IMAX': 12 };

    const bookings = [];
    const details = [];

    bookingDefs.forEach((def, idx) => {
      const bookingId = idx + 1;
      const [date, time, customerId, staffNo, location, bookingBy, status] = def;
      bookings.push([
        bookingId,
        `${date} ${time}:00`,
        customerId,
        staffNo,
        location,
        bookingBy,
        status,
      ]);

      // 3 detail rows per booking, rotating movie / hall / screen
      for (let seatOffset = 0; seatOffset < 3; seatOffset++) {
        const seatNum = ((idx * 3 + seatOffset) % 10) + 1;
        const movieId = movieIds[idx % movieIds.length];
        const hall = halls[(idx + seatOffset) % halls.length];
        const screen = screens[seatOffset % screens.length];
        const price = screenPrices[screen];
        details.push([
          bookingId,
          seatNum,
          hall,
          movieId,
          date,
          time,
          screen,
          price,
        ]);
      }
    });

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
