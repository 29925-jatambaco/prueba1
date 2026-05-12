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

// Initialize database
initDatabase();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Sanitization middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS prevention - strip HTML tags
        req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
      }
    }
  }
  next();
});

// Static files
app.use('/client', express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/expenses', expensesRouter);
app.use('/api/categories', categoriesRouter);

// Summary endpoint
const Expense = require('./models/Expense');
app.get('/api/summary', (req, res) => {
  try {
    const summary = Expense.getSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Expense Manager running on http://localhost:${PORT}`);
});

module.exports = app;
