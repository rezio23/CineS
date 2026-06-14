require('dotenv').config();
const express         = require('express');
const cors            = require('cors');
const path            = require('path');
const fs              = require('fs');
const dashboardRoutes = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', dashboardRoutes);

// Serve built frontend
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
