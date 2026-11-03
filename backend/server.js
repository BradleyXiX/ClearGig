const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
require('dotenv').config();

const projectRoutes = require('./routes/projects');
const lineItemRoutes = require('./routes/lineItems');
const clientRoutes = require('./routes/clients');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/line-items', lineItemRoutes);
app.use('/api/v1/clients', clientRoutes);

// Health check endpoints
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ClearGig API is running.' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ClearGig API is running.' });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ClearGig API is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Helper to run database migrations with a safety timeout so it never blocks web traffic
function runMigrations() {
  console.log('Running database migrations...');
  exec('npx prisma migrate deploy', { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.warn('Migration status notice:', error.message);
      if (stderr) console.warn(stderr);
    } else {
      console.log('Database migrations applied successfully:\n', stdout);
    }
  });
}

// Bind explicitly to 0.0.0.0 for cloud platforms like Render
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
  runMigrations();
});
