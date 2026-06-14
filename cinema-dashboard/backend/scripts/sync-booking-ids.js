require('dotenv').config({ path: '../.env' });
const oracledb = require('oracledb');

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

const TIMES = ['10:00', '14:00', '15:30', '19:00', '20:00', '21:00'];

function pad(n) {
  return String(n).padStart(2, '0');
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
    console.log('Clearing BOOKING_SEAT...');
    await connection.execute('DELETE FROM Booking_Seat');

    console.log('Disabling FK constraint on BOOKING_SEAT...');
    await connection.execute('ALTER TABLE Booking_Seat DISABLE CONSTRAINT FK_BS_BOOKING');

    console.log('Truncating BOOKING to reset identity...');
    await connection.execute('TRUNCATE TABLE Booking');

    // Recreate Movie_Show shows (1-3) for FK.
    await connection.execute('DELETE FROM Movie_Show');
    const showSql = `INSERT INTO Movie_Show (show_id, movie_id, hall_id, show_datetime, base_price)
                     VALUES (:show_id, :movie_id, :hall_id, TO_TIMESTAMP(:show_datetime, 'YYYY-MM-DD HH24:MI:SS'), :base_price)`;
    for (let i = 0; i < 3; i++) {
      await connection.execute(showSql, {
        show_id: i + 1,
        movie_id: `M00${6 + i}`,
        hall_id: ((i) % 3) + 1,
        show_datetime: `2026-06-20 ${10 + i}:00:00`,
        base_price: 10 + i,
      });
    }

    const bookingSql = `INSERT INTO Booking (booking_id, customer_id, show_id, staff_id, booking_date, payment_method, total_amount, status)
                        VALUES (:booking_id, :customer_id, :show_id, :staff_id, TO_DATE(:booking_date, 'YYYY-MM-DD HH24:MI:SS'), :payment_method, :total_amount, :status)`;

    let bookingId = 1;
    for (const { year, month, count } of TARGETS) {
      for (let i = 0; i < count; i++) {
        const day = (i % 28) + 1;
        const dateStr = `${year}-${pad(month)}-${pad(day)}`;
        const time = TIMES[i % TIMES.length];
        const customerId = ((bookingId - 1) % 3) + 1;
        const staffId = ((bookingId - 1) % 3) + 1;
        const showId = ((bookingId - 1) % 3) + 1;

        await connection.execute(bookingSql, {
          booking_id: bookingId,
          customer_id: customerId,
          show_id: showId,
          staff_id: staffId,
          booking_date: `${dateStr} ${time}:00`,
          payment_method: 'CARD',
          total_amount: 30,
          status: 'CONFIRMED',
        });
        bookingId++;
      }
    }

    console.log('Re-enabling FK constraint on BOOKING_SEAT...');
    await connection.execute('ALTER TABLE Booking_Seat ENABLE CONSTRAINT FK_BS_BOOKING');

    await connection.commit();
    console.log('Inserted', bookingId - 1, 'Booking rows with IDs matching Detail');
  } finally {
    await connection.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
