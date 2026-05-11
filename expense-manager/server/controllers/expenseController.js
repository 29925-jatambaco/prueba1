/**
 * Expense controller for handling business logic
 * @module server/controllers/expenseController
 */
const expenseModel = require('../models/expenseModel');

/**
 * Validate expense data
 * @param {Object} data - Expense data to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateExpenseData(data) {
  const errors = [];

  // Validate amount
  if (data.amount === undefined || data.amount === null) {
    errors.push('Amount is required');
  } else if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  // Validate category_id
  if (!data.category_id) {
    errors.push('Category is required');
  } else if (typeof data.category_id !== 'number') {
    errors.push('Category ID must be a number');
  }

  // Validate date
  if (!data.date) {
    errors.push('Date is required');
  } else {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date format');
    }
  }

  // Validate description length
  if (data.description && data.description.length > 200) {
    errors.push('Description must not exceed 200 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all expenses with pagination and filtering
 * @param {Object} query - Query parameters
 * @returns {Object} Paginated expenses list
 */
async function getAllExpenses(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const category = query.category ? parseInt(query.category) : undefined;
  const startDate = query.startDate;
  const endDate = query.endDate;

  return expenseModel.getAllExpenses({ page, limit, category, startDate, endDate });
}

/**
 * Get a single expense by ID
 * @param {number} id - Expense ID
 * @returns {Object|null} The expense
 */
async function getExpense(id) {
  return expenseModel.getExpenseById(id);
}

/**
 * Create a new expense
 * @param {Object} expenseData - Expense data
 * @returns {Object} The created expense
 * @throws {Error} If validation fails
 */
async function createExpense(expenseData) {
  const validation = validateExpenseData(expenseData);
  
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return expenseModel.createExpense(expenseData);
}

/**
 * Update an existing expense
 * @param {number} id - Expense ID
 * @param {Object} expenseData - Updated expense data
 * @returns {Object|null} The updated expense
 * @throws {Error} If validation fails or expense not found
 */
async function updateExpense(id, expenseData) {
  const existing = expenseModel.getExpenseById(id);
  if (!existing) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateExpenseData(expenseData);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const updated = expenseModel.updateExpense(id, expenseData);
  if (!updated) {
    const error = new Error('Failed to update expense');
    error.statusCode = 500;
    throw error;
  }

  return updated;
}

/**
 * Delete an expense
 * @param {number} id - Expense ID
 * @returns {boolean} True if deleted
 * @throws {Error} If expense not found
 */
async function deleteExpense(id) {
  const existing = expenseModel.getExpenseById(id);
  if (!existing) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  return expenseModel.deleteExpense(id);
}

/**
 * Get summary statistics
 * @param {Object} query - Query parameters
 * @returns {Object} Summary statistics
 */
async function getSummary(query = {}) {
  const db = require('../models/database').getDb();
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Previous month calculation
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear--;
  }

  const currentMonthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const currentMonthEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;
  const prevMonthStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevMonthEnd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`;

  // Total for current month
  const currentMonthTotal = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total 
    FROM expenses 
    WHERE date BETWEEN ? AND ?
  `).get(currentMonthStart, currentMonthEnd);

  // Total for previous month
  const prevMonthTotal = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total 
    FROM expenses 
    WHERE date BETWEEN ? AND ?
  `).get(prevMonthStart, prevMonthEnd);

  // Distribution by category for current month
  const categoryDistribution = db.prepare(`
    SELECT 
      c.name,
      c.color,
      COALESCE(SUM(e.amount), 0) as total,
      COUNT(e.id) as count
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id 
      AND e.date BETWEEN ? AND ?
    GROUP BY c.id, c.name, c.color
    ORDER BY total DESC
  `).all(currentMonthStart, currentMonthEnd);

  // Top 5 highest expenses (all time or current month based on query)
  const topExpenses = db.prepare(`
    SELECT 
      e.id,
      e.amount,
      e.description,
      e.date,
      c.name as category_name,
      c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    ${query.month ? 'WHERE e.date BETWEEN ? AND ?' : ''}
    ORDER BY e.amount DESC
    LIMIT 5
  `).all(query.month ? [currentMonthStart, currentMonthEnd] : []);

  // Calculate percentage change
  const prevTotal = prevMonthTotal.total;
  const currTotal = currentMonthTotal.total;
  const percentageChange = prevTotal > 0 
    ? ((currTotal - prevTotal) / prevTotal) * 100 
    : 0;

  return {
    currentMonth: {
      year: currentYear,
      month: currentMonth,
      total: currTotal,
      expenseCount: db.prepare(`
        SELECT COUNT(*) as count FROM expenses 
        WHERE date BETWEEN ? AND ?
      `).get(currentMonthStart, currentMonthEnd).count
    },
    previousMonth: {
      year: prevYear,
      month: prevMonth,
      total: prevTotal
    },
    comparison: {
      difference: currTotal - prevTotal,
      percentageChange: parseFloat(percentageChange.toFixed(2))
    },
    categoryDistribution,
    topExpenses
  };
}

module.exports = {
  validateExpenseData,
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary
};
