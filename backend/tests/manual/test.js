const { query } = require('../../src/config/db');

query('SELECT 1 AS TEST FROM DUAL')
  .then(rows => console.log('SUCCESS:', rows))
  .catch(err => console.log('ERROR:', err.message));

setTimeout(() => {}, 10000);
