require('dotenv').config({ path: '../.env' });
const oracledb = require('oracledb');

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
    // Drop existing movies so we can insert with specific IDs. Movie is referenced
    // by Movie_Show, so we must also clear Movie_Show (and its dependent Booking_Seat/Booking).
    console.log('Clearing Booking_Seat...');
    await connection.execute('DELETE FROM Booking_Seat');
    console.log('Clearing Booking...');
    await connection.execute('DELETE FROM Booking');
    console.log('Clearing Movie_Show...');
    await connection.execute('DELETE FROM Movie_Show');
    console.log('Truncating Movie to reset identity...');
    await connection.execute('TRUNCATE TABLE Movie');

    const movies = [
      { id: 'M006', title: 'Spider-Man: Beyond the Spider-Verse', genre: 'Action / Animation', director: 'Joaquim Dos Santos', duration: 140, rating: 'PG', year: 2027 },
      { id: 'M007', title: 'Black Panther 3', genre: 'Action / Sci-Fi', director: 'Ryan Coogler', duration: 150, rating: 'PG-13', year: 2027 },
      { id: 'M008', title: 'Interstellar 2', genre: 'Sci-Fi / Adventure', director: 'Christopher Nolan', duration: 169, rating: 'PG-13', year: 2026 },
      { id: 'M009', title: 'Frozen 3', genre: 'Animation / Musical', director: 'Jennifer Lee', duration: 102, rating: 'PG', year: 2027 },
      { id: 'M010', title: 'The Batman 2', genre: 'Action / Crime', director: 'Matt Reeves', duration: 155, rating: 'PG-13', year: 2027 },
    ];

    for (const m of movies) {
      await connection.execute(
        `INSERT INTO Movie (movie_id, title, genre, director, duration_min, rating, release_year)
         VALUES (:id, :title, :genre, :director, :duration, :rating, :year)`,
        {
          id: m.id,
          title: m.title,
          genre: m.genre,
          director: m.director,
          duration: m.duration,
          rating: m.rating,
          year: m.year,
        }
      );
    }

    await connection.commit();
    console.log('Inserted', movies.length, 'movies');
  } finally {
    await connection.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
