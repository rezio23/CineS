require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboard');

const testApp = express();
testApp.use(cors());
testApp.use(express.json());
testApp.use('/api', dashboardRoutes);
testApp.use(express.static(path.join(__dirname, '..', 'frontend')));
testApp.use('/node_modules', express.static(path.join(__dirname, '..', 'frontend', 'node_modules')));
testApp.use((req, res, next) => {
  if ((req.path.startsWith('/dist/') || req.path.startsWith('/shims/')) && !path.extname(req.path)) {
    const jsPath = path.join(__dirname, '..', 'frontend', req.path + '.js');
    if (fs.existsSync(jsPath)) {
      return res.sendFile(jsPath);
    }
  }
  next();
});
testApp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const server = testApp.listen(5002, () => {
  console.log('Test full server on http://localhost:5002');
});

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5002${path}`, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

setTimeout(async () => {
  try {
    console.log('index:', (await get('/')).slice(0, 80));
    console.log('sessions:', await get('/api/sessions'));
    console.log('daily 19:00:', await get('/api/charts/daily?session=19:00'));
    console.log('monthly-income 19:00:', await get('/api/charts/monthly-income?session=19:00'));
  } catch (e) {
    console.error(e);
  } finally {
    server.close(() => process.exit(0));
  }
}, 1000);
