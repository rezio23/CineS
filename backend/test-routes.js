const http = require('http');
const express = require('express');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use('/api', dashboardRoutes);

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5001${path}`, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

const server = app.listen(5001, async () => {
  console.log('Test server on http://localhost:5001');
  try {
    console.log('sessions:', await get('/api/sessions'));
    console.log('daily 19:00:', await get('/api/charts/daily?session=19:00'));
    console.log('daily 19:00 10 Jun:', await get('/api/charts/daily?session=19:00&date=2026-06-10'));
    console.log('monthly-income 19:00:', await get('/api/charts/monthly-income?session=19:00'));
    console.log('monthly-booking 14:00 Jun:', await get('/api/charts/monthly-booking?session=14:00&dateFrom=2026-06-01&dateTo=2026-06-30'));
  } catch (e) {
    console.error(e);
  } finally {
    server.close(() => process.exit(0));
  }
});
