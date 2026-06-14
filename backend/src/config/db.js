const path    = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// .env stores the connect string as a JDBC URL; extract the host:port/service part.
function parseConnectString(url) {
  if (!url) return undefined;
  const match = url.match(/@([^\s]+)$/);
  return match ? match[1] : url;
}

let pool;

async function getPool() {
  if (!pool) {
    const connectString = parseConnectString(process.env.DB_URL);
    pool = await oracledb.createPool({
      user:          process.env.DB_USERNAME,
      password:      process.env.DB_PASSWORD,
      connectString,
      poolMin:       2,
      poolMax:       10,
      poolIncrement: 1,
    });
  }
  return pool;
}

async function query(sql, binds = {}) {
  const p    = await getPool();
  const conn = await p.getConnection();
  try {
    const result = await conn.execute(sql, binds);
    return result.rows;
  } finally {
    await conn.close();
  }
}

module.exports = { query };
