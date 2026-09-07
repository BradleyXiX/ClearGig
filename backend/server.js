const express = require('express');
const cors = require('cors');
require('dotenv').config();

const projectRoutes = require('./routes/projects');
const lineItemRoutes = require('./routes/lineItems');
const clientRoutes = require('./routes/clients');

const app = express();
const port = process.env.PORT || 5000;

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

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ClearGig API is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
