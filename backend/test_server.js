require('dotenv').config();
const express = require('express');
const cors = require('cors');

const projectRoutes = require('./routes/projects');
const lineItemRoutes = require('./routes/lineItems');
const clientRoutes = require('./routes/clients');

const app = express();
const port = 5002;

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/line-items', lineItemRoutes);
app.use('/api/v1/clients', clientRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ClearGig API is running.' });
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(port, () => {
  console.log(`Test server running on port: ${port}`);
});
