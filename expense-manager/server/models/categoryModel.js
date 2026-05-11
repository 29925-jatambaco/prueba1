/**
 * Category model for database operations
 * @module server/models/categoryModel
 */
const { getDb } = require('./database');

/**
 * Get all categories
 * @returns {Array} List of all categories
 */
function getAllCategories() {
  const db = getDb();
  return db.prepare('SELECT * FROM categories ORDER BY name').all();
}

/**
 * Get a single category by ID
 * @param {number} id - Category ID
 * @returns {Object|null} The category or null if not found
 */
function getCategoryById(id) {
  const db = getDb();
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  return category || null;
}

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name
 * @param {string} [categoryData.color='#3498db'] - Category color
 * @returns {Object} The created category
 */
function createCategory(categoryData) {
  const db = getDb();
  const { name, color = '#3498db' } = categoryData;

  try {
    const stmt = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
    const result = stmt.run(name, color);
    return getCategoryById(result.lastInsertRowid);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Category name already exists');
    }
    throw error;
  }
}

/**
 * Update an existing category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Object|null} The updated category or null if not found
 */
function updateCategory(id, categoryData) {
  const db = getDb();
  const { name, color } = categoryData;

  try {
    const stmt = db.prepare(`
      UPDATE categories 
      SET name = ?, color = ?
      WHERE id = ?
    `);
    const result = stmt.run(name, color, id);

    if (result.changes === 0) {
      return null;
    }

    return getCategoryById(id);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Category name already exists');
    }
    throw error;
  }
}

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteCategory(id) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get category with expense count
 * @param {number} id - Category ID
 * @returns {Object|null} Category with expense count
 */
function getCategoryWithCount(id) {
  const db = getDb();
  const category = db.prepare(`
    SELECT 
      c.*,
      COUNT(e.id) as expense_count,
      COALESCE(SUM(e.amount), 0) as total_amount
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id);
  return category || null;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryWithCount
};
