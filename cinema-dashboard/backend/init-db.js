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

    const bookings = [
      [4, '2026-06-08 20:00:00', 204, 303, 'AEON 3', 'On Counter', 'Confirmed'],
      [5, '2026-06-09 10:00:00', 205, 304, 'SORYA', 'Online', 'Pending'],
      [6, '2026-06-10 15:30:00', 206, 305, 'SORYA', 'On Counter', 'Confirmed'],
      [7, '2026-06-11 18:00:00', 207, 306, 'AEON 2', 'Online', 'Cancelled'],
      [8, '2026-06-12 21:00:00', 208, 307, 'CENTRAL', 'Online', 'Confirmed'],
      [9, '2026-06-13 13:00:00', 209, 308, 'CENTRAL', 'On Counter', 'Pending'],
      [10, '2026-06-14 17:00:00', 210, 309, 'AEON 1', 'Online', 'Confirmed'],
    ];

    const details = [
      [4, 8, 'Hall A', 'M006', '2026-06-08', '20:00', '3D', 10.00],
      [5, 9, 'Hall B', 'M007', '2026-06-09', '10:00', '2D', 8.00],
      [6, 10, 'IMAX Hall', 'M008', '2026-06-10', '15:30', 'IMAX', 12.00],
    ];

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
