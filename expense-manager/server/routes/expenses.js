/**
 * Expense routes
 * @module server/routes/expenses
 */
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

/**
 * @route GET /api/expenses
 * @description Get all expenses with pagination and filtering
 * @queryparam {number} page - Page number (default: 1)
 * @queryparam {number} limit - Items per page (default: 10)
 * @queryparam {number} category - Filter by category ID
 * @queryparam {string} startDate - Filter by start date (YYYY-MM-DD)
 * @queryparam {string} endDate - Filter by end date (YYYY-MM-DD)
 */
router.get('/', async (req, res, next) => {
  try {
    const expenses = await expenseController.getAllExpenses(req.query);
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/:id
 * @description Get a single expense by ID
 * @param {string} id - Expense ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const expense = await expenseController.getExpense(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/expenses
 * @description Create a new expense
 * @body {number} amount - Expense amount (required, > 0)
 * @body {number} category_id - Category ID (required)
 * @body {string} description - Expense description (max 200 chars)
 * @body {string} date - Expense date (required, YYYY-MM-DD)
 */
router.post('/', async (req, res, next) => {
  try {
    const expense = await expenseController.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ 
        error: error.message, 
        details: error.details 
      });
    }
    next(error);
  }
});

/**
 * @route PUT /api/expenses/:id
 * @description Update an existing expense
 * @param {string} id - Expense ID
 * @body {number} amount - Expense amount (required, > 0)
 * @body {number} category_id - Category ID (required)
 * @body {string} description - Expense description (max 200 chars)
 * @body {string} date - Expense date (required, YYYY-MM-DD)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const expense = await expenseController.updateExpense(req.params.id, req.body);
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ 
        error: error.message, 
        details: error.details 
      });
    }
    next(error);
  }
});

/**
 * @route DELETE /api/expenses/:id
 * @description Delete an expense
 * @param {string} id - Expense ID
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await expenseController.deleteExpense(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
