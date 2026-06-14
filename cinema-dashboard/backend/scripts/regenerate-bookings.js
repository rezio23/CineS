require('dotenv').config({ path: '../.env' });
const oracledb = require('oracledb');

const TARGETS = [
  { month: 1, count: 56 },
  { month: 2, count: 45 },
  { month: 3, count: 36 },
  { month: 4, count: 65 },
  { month: 5, count: 26 },
  { month: 6, count: 67 },
];

const MOVIES = ['M006', 'M007', 'M008', 'M009', 'M010'];
const HALLS = ['Hall A', 'Hall B', 'IMAX Hall'];
const SCREENS = ['2D', '3D', 'IMAX'];
const TIMES = ['10:00', '14:00', '15:30', '19:00', '20:00', '21:00'];
const LOCATIONS = ['AEON 1', 'AEON 2', 'AEON 3', 'CENTRAL', 'SORYA'];
const STATUS = ['Confirmed', 'Pending', 'Cancelled'];
const BOOKING_TYPES = ['Online', 'On Counter'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function generateBookings() {
  const bookings = [];
  let bookingId = 1;

  for (const { month, count } of TARGETS) {
    for (let i = 0; i < count; i++) {
      const day = (i % 28) + 1;
      const dateStr = `2026-${pad(month)}-${pad(day)}`;
      const time = TIMES[i % TIMES.length];
      const customerId = 201 + (i % 10);
      const staffNo = 301 + (i % 10);
      const location = LOCATIONS[i % LOCATIONS.length];
      const bookingBy = BOOKING_TYPES[i % BOOKING_TYPES.length];
      const status = STATUS[i % STATUS.length];

      bookings.push({
        bookingId: bookingId++,
        showDatetime: `${dateStr} ${time}:00`,
        customerId,
        staffNo,
        location,
        bookingBy,
        status,
        date: dateStr,
        time,
      });
    }
  }
  return bookings;
}

async function run() {
  const connection = await oracledb.getConnection({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectString: 'localhost:1539/Reziooo',
  });

  try {
    console.log('Deleting existing Jan-Jun 2026 bookings...');
    await connection.execute(`DELETE FROM Detail WHERE show_date BETWEEN DATE '2026-01-01' AND DATE '2026-06-30'`);
    await connection.execute(`DELETE FROM Booking WHERE show_datetime BETWEEN TIMESTAMP '2026-01-01 00:00:00' AND TIMESTAMP '2026-06-30 23:59:59'`);

    const bookings = generateBookings();
    console.log(`Inserting ${bookings.length} bookings...`);

    for (const b of bookings) {
      await connection.execute(
        `INSERT INTO Booking (booking_id, show_datetime, customer_id, staff_no, location, booking_by, booking_status)
         VALUES (:id, TO_TIMESTAMP(:dt, 'YYYY-MM-DD HH24:MI:SS'), :customerId, :staffNo, :location, :bookingBy, :status)`,
        {
          id: b.bookingId,
          dt: b.showDatetime,
          customerId: b.customerId,
          staffNo: b.staffNo,
          location: b.location,
          bookingBy: b.bookingBy,
          status: b.status,
        }
      );

      for (let s = 0; s < 3; s++) {
        const seatNum = ((b.bookingId - 1) * 3 + s) % 10 + 1;
        const movieIdx = (b.bookingId - 1 + s) % MOVIES.length;
        const hallIdx = (b.bookingId - 1 + s) % HALLS.length;
        const screenIdx = s % SCREENS.length;
        const price = screenIdx === 2 ? 12 : screenIdx === 1 ? 10 : 8;

        await connection.execute(
          `INSERT INTO Detail (booking_id, seat_num, hall_name, movie_id, show_date, show_time, screen, price)
           VALUES (:bookingId, :seatNum, :hallName, :movieId, TO_DATE(:showDate, 'YYYY-MM-DD'), :showTime, :screen, :price)`,
          {
            bookingId: b.bookingId,
            seatNum,
            hallName: HALLS[hallIdx],
            movieId: MOVIES[movieIdx],
            showDate: b.date,
            showTime: b.time,
            screen: SCREENS[screenIdx],
            price,
          }
        );
      }
    }

    await connection.commit();
    console.log('Done.');
  } finally {
    await connection.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
