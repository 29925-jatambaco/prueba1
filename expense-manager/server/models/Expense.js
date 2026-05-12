/**
 * Expense Model - Handles all database operations for expenses
 * @module server/models/Expense
 */
const { getDatabase } = require('./database');

class Expense {
  /**
   * Get all expenses with optional pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @param {number} options.categoryId - Filter by category
   * @param {string} options.startDate - Filter by start date
   * @param {string} options.endDate - Filter by end date
   * @returns {Object} Paginated expenses result
   */
  static getAll(options = {}) {
    const db = getDatabase();
    const { page = 1, limit = 10, categoryId, startDate, endDate } = options;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT e.id, e.amount, e.description, e.date, e.created_at,
             c.id as category_id, c.name as category_name, c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (categoryId) {
      query += ' AND e.category_id = ?';
      params.push(categoryId);
    }
    
    if (startDate) {
      query += ' AND e.date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND e.date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY e.date DESC, e.created_at DESC';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM expenses WHERE 1=1` + 
      (categoryId ? ' AND category_id = ?' : '') +
      (startDate ? ' AND date >= ?' : '') +
      (endDate ? ' AND date <= ?' : '');
    
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult.total;
    
    query += ' LIMIT ? OFFSET ?';
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
  static getById(id) {
    const db = getDatabase();
    const expense = db.prepare(`
      SELECT e.id, e.amount, e.description, e.date, e.created_at,
             c.id as category_id, c.name as category_name, c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `).get(id);
    
    return expense || null;
  }
  
  /**
   * Create a new expense
   * @param {Object} data - Expense data
   * @param {number} data.amount - Amount (> 0)
   * @param {string} data.description - Description (max 200 chars)
   * @param {number} data.categoryId - Category ID
   * @param {string} data.date - Date (YYYY-MM-DD)
   * @returns {Object} Created expense
   */
  static create(data) {
    const db = getDatabase();
    
    // Validation
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }
    
    if (data.description.length > 200) {
      throw new Error('Description must be less than 200 characters');
    }
    
    if (!data.categoryId) {
      throw new Error('Category is required');
    }
    
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('Valid date is required (YYYY-MM-DD)');
    }
    
    const result = db.prepare(`
      INSERT INTO expenses (amount, description, category_id, date)
      VALUES (?, ?, ?, ?)
    `).run(data.amount, data.description.trim(), data.categoryId, data.date);
    
    return this.getById(result.lastInsertRowid);
  }
  
  /**
   * Update an existing expense
   * @param {number} id - Expense ID
   * @param {Object} data - Updated expense data
   * @returns {Object|null} Updated expense or null if not found
   */
  static update(id, data) {
    const db = getDatabase();
    const existing = this.getById(id);
    
    if (!existing) {
      return null;
    }
    
    // Validation
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (data.description !== undefined) {
      if (data.description.trim().length === 0) {
        throw new Error('Description cannot be empty');
      }
      if (data.description.length > 200) {
        throw new Error('Description must be less than 200 characters');
      }
    }
    
    if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('Valid date is required (YYYY-MM-DD)');
    }
    
    const fields = [];
    const values = [];
    
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }
    
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description.trim());
    }
    
    if (data.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(data.categoryId);
    }
    
    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date);
    }
    
    if (fields.length === 0) {
      return existing;
    }
    
    values.push(id);
    
    db.prepare(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.getById(id);
  }
  
  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {boolean} True if deleted, false if not found
   */
  static delete(id) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return result.changes > 0;
  }
  
  /**
   * Get summary statistics
   * @returns {Object} Summary data
   */
  static getSummary() {
    const db = getDatabase();
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Current month total
    const currentMonthTotal = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `).get(String(currentMonth).padStart(2, '0'), String(currentYear));
    
    // Previous month total
    const prevMonthTotal = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `).get(String(prevMonth).padStart(2, '0'), String(prevYear));
    
    // Category breakdown for current month
    const categoryBreakdown = db.prepare(`
      SELECT c.name, c.color, COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
        AND strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?
      GROUP BY c.id
      ORDER BY total DESC
    `).all(String(currentMonth).padStart(2, '0'), String(currentYear));
    
    // Top 5 expenses for current month
    const topExpenses = db.prepare(`
      SELECT e.id, e.amount, e.description, e.date, c.name as category_name
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?
      ORDER BY e.amount DESC
      LIMIT 5
    `).all(String(currentMonth).padStart(2, '0'), String(currentYear));
    
    return {
      currentMonth: {
        month: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        total: currentMonthTotal.total,
        previousTotal: prevMonthTotal.total,
        change: prevMonthTotal.total > 0 
          ? ((currentMonthTotal.total - prevMonthTotal.total) / prevMonthTotal.total * 100).toFixed(2)
          : 0
      },
      categoryBreakdown,
      topExpenses
    };
  }
  
  /**
   * Export all expenses to JSON
   * @returns {Array} All expenses
   */
  static exportAll() {
    const db = getDatabase();
    return db.prepare(`
      SELECT e.id, e.amount, e.description, e.date, e.created_at,
             c.name as category_name, c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      ORDER BY e.date DESC
    `).all();
  }
  
  /**
   * Import expenses from JSON
   * @param {Array} expenses - Array of expense objects
   * @returns {number} Number of imported expenses
   */
  static import(expenses) {
    const db = getDatabase();
    const insert = db.prepare(`
      INSERT INTO expenses (amount, description, category_id, date)
      VALUES (?, ?, ?, ?)
    `);
    
    let count = 0;
    const getCategoryByName = db.prepare('SELECT id FROM categories WHERE name = ?');
    
    db.transaction(() => {
      for (const expense of expenses) {
        try {
          let categoryId = expense.category_id;
          
          // If category_id is not provided, try to find by name
          if (!categoryId && expense.category_name) {
            const cat = getCategoryByName.get(expense.category_name);
            if (cat) {
              categoryId = cat.id;
            } else {
              // Create category if doesn't exist
              const color = expense.category_color || '#95a5a6';
              const result = db.prepare(
                'INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)'
              ).run(expense.category_name, color);
              
              if (result.lastInsertRowid) {
                categoryId = result.lastInsertRowid;
              } else {
                const cat2 = getCategoryByName.get(expense.category_name);
                categoryId = cat2.id;
              }
            }
          }
          
          if (categoryId) {
            insert.run(
              expense.amount,
              expense.description,
              categoryId,
              expense.date || new Date().toISOString().split('T')[0]
            );
            count++;
          }
        } catch (error) {
          console.error('Error importing expense:', error);
        }
      }
    })();
    
    return count;
  }
}

module.exports = Expense;
