/**
 * Expense model for database operations
 * @module server/models/expenseModel
 */
const { getDb } = require('./database');

/**
 * Get all expenses with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @param {string} [options.category] - Filter by category ID
 * @param {string} [options.startDate] - Filter by start date
 * @param {string} [options.endDate] - Filter by end date
 * @returns {Object} Paginated expenses list
 */
function getAllExpenses(options = {}) {
  const db = getDb();
  const { page = 1, limit = 10, category, startDate, endDate } = options;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (category) {
    whereClause += ' AND e.category_id = ?';
    params.push(category);
  }

  if (startDate) {
    whereClause += ' AND e.date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    whereClause += ' AND e.date <= ?';
    params.push(endDate);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM expenses e ${whereClause}`;
  const { total } = db.prepare(countQuery).get(...params);

  // Get paginated results
  const query = `
    SELECT 
      e.id,
      e.amount,
      e.description,
      e.date,
      e.created_at,
      e.updated_at,
      c.id as category_id,
      c.name as category_name,
      c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    ${whereClause}
    ORDER BY e.date DESC, e.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);
  const expenses = db.prepare(query).all(...params);

  return {
    data: expenses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get a single expense by ID
 * @param {number} id - Expense ID
 * @returns {Object|null} The expense or null if not found
 */
function getExpenseById(id) {
  const db = getDb();
  const expense = db.prepare(`
    SELECT 
      e.*,
      c.name as category_name,
      c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(id);
  return expense || null;
}

/**
 * Create a new expense
 * @param {Object} expenseData - Expense data
 * @param {number} expenseData.amount - Expense amount
 * @param {number} expenseData.category_id - Category ID
 * @param {string} expenseData.description - Expense description
 * @param {string} expenseData.date - Expense date
 * @returns {Object} The created expense
 */
function createExpense(expenseData) {
  const db = getDb();
  const { amount, category_id, description, date } = expenseData;

  const stmt = db.prepare(`
    INSERT INTO expenses (amount, category_id, description, date)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(amount, category_id, description, date);

  return getExpenseById(result.lastInsertRowid);
}

/**
 * Update an existing expense
 * @param {number} id - Expense ID
 * @param {Object} expenseData - Updated expense data
 * @returns {Object|null} The updated expense or null if not found
 */
function updateExpense(id, expenseData) {
  const db = getDb();
  const { amount, category_id, description, date } = expenseData;

  const stmt = db.prepare(`
    UPDATE expenses 
    SET amount = ?, category_id = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(amount, category_id, description, date, id);

  if (result.changes === 0) {
    return null;
  }

  return getExpenseById(id);
}

/**
 * Delete an expense
 * @param {number} id - Expense ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteExpense(id) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get expenses by month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Array} List of expenses for the month
 */
function getExpensesByMonth(year, month) {
  const db = getDb();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  return db.prepare(`
    SELECT 
      e.*,
      c.name as category_name,
      c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.date BETWEEN ? AND ?
    ORDER BY e.date DESC
  `).all(startDate, endDate);
}

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByMonth
};
