/**
 * Main server entry point
 * @module server/index
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const expensesRouter = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const { initDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 6666;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/expenses', expensesRouter);
app.use('/api/categories', categoriesRouter);

// Summary endpoint
const { getSummary } = require('./controllers/expenseController');
app.get('/api/summary', async (req, res) => {
  try {
    const summary = await getSummary(req.query);
    res.json(summary);
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Serve index.html for all other routes (catch-all)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Expense Manager server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
