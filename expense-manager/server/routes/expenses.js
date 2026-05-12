/**
 * Expenses Router - API endpoints for expense management
 * @module server/routes/expenses
 */
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

/**
 * @route GET /api/expenses
 * @description Get all expenses with pagination and filtering
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * @query {number} category - Filter by category ID
 * @query {string} startDate - Filter by start date (YYYY-MM-DD)
 * @query {string} endDate - Filter by end date (YYYY-MM-DD)
 */
router.get('/', (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      categoryId: req.query.category ? parseInt(req.query.category) : null,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const result = Expense.getAll(options);
    res.json(result);
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
});

/**
 * @route GET /api/expenses/export
 * @description Export all expenses as JSON
 */
router.get('/export', (req, res) => {
  try {
    const expenses = Expense.exportAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses-export.json"');
    res.json(expenses);
  } catch (error) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({ error: 'Failed to export expenses' });
  }
});

/**
 * @route POST /api/expenses/import
 * @description Import expenses from JSON
 * @body {Array} expenses - Array of expense objects
 */
router.post('/import', (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }
    
    const count = Expense.import(req.body);
    res.json({ message: `Successfully imported ${count} expenses`, count });
  } catch (error) {
    console.error('Error importing expenses:', error);
    res.status(500).json({ error: 'Failed to import expenses' });
  }
});

/**
 * @route POST /api/expenses
 * @description Create a new expense
 * @body {number} amount - Amount (> 0)
 * @body {string} description - Description (max 200 chars)
 * @body {number} categoryId - Category ID
 * @body {string} date - Date (YYYY-MM-DD)
 */
router.post('/', (req, res) => {
  try {
    const expense = Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/expenses/:id
 * @description Get a single expense by ID
 * @param {number} id - Expense ID
 */
router.get('/:id', (req, res) => {
  try {
    const expense = Expense.getById(parseInt(req.params.id));
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error getting expense:', error);
    res.status(500).json({ error: 'Failed to get expense' });
  }
});

/**
 * @route PUT /api/expenses/:id
 * @description Update an existing expense
 * @param {number} id - Expense ID
 * @body {number} amount - Amount (> 0)
 * @body {string} description - Description (max 200 chars)
 * @body {number} categoryId - Category ID
 * @body {string} date - Date (YYYY-MM-DD)
 */
router.put('/:id', (req, res) => {
  try {
    const expense = Expense.update(parseInt(req.params.id), req.body);
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/expenses/:id
 * @description Delete an expense
 * @param {number} id - Expense ID
 */
router.delete('/:id', (req, res) => {
  try {
    const deleted = Expense.delete(parseInt(req.params.id));
    
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
