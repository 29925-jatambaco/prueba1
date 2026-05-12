/**
 * Expense model for database operations
 * @module server/models/expenseModel
 */
const { getDb, saveDatabase } = require('./database');

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
  const countResult = db.exec(countQuery, params);
  const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;

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

  const queryParams = [...params, limit, offset];
  const stmt = db.prepare(query);
  stmt.bind(queryParams);
  const expenses = [];
  while (stmt.step()) {
    expenses.push(stmt.getAsObject());
  }

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
  const stmt = db.prepare(`
    SELECT 
      e.*,
      c.name as category_name,
      c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `);
  stmt.bind([id]);
  
  if (stmt.step()) {
    const expense = stmt.getAsObject();
    return expense;
  }
  return null;
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

  db.run(`
    INSERT INTO expenses (amount, category_id, description, date)
    VALUES (?, ?, ?, ?)
  `, [amount, category_id, description, date]);
  
  saveDatabase();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const lastId = lastIdResult[0].values[0][0];
  return getExpenseById(lastId);
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

  db.run(`
    UPDATE expenses 
    SET amount = ?, category_id = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [amount, category_id, description, date, id]);
  
  saveDatabase();

  const changes = db.getRowsModified().changes;
  if (changes === 0) {
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
  db.run('DELETE FROM expenses WHERE id = ?', [id]);
  saveDatabase();
  const changes = db.getRowsModified().changes;
  return changes > 0;
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

  const stmt = db.prepare(`
    SELECT 
      e.*,
      c.name as category_name,
      c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.date BETWEEN ? AND ?
    ORDER BY e.date DESC
  `);
  stmt.bind([startDate, endDate]);
  
  const expenses = [];
  while (stmt.step()) {
    expenses.push(stmt.getAsObject());
  }
  return expenses;
}

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByMonth
};
