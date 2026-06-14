require('dotenv').config({ path: '../.env' });
const oracledb = require('oracledb');

async function run() {
  const connection = await oracledb.getConnection({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectString: 'localhost:1539/Reziooo',
  });

  try {
    const result = await connection.execute(
      `SELECT column_name FROM user_tab_columns WHERE table_name = 'BOOKING'`
    );
    console.log(result.rows);
  } finally {
    await connection.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
