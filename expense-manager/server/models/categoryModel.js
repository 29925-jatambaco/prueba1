/**
 * Category model for database operations
 * @module server/models/categoryModel
 */
const { getDb, saveDatabase } = require('./database');

/**
 * Get all categories
 * @returns {Array} List of all categories
 */
function getAllCategories() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  const categories = [];
  while (stmt.step()) {
    categories.push(stmt.getAsObject());
  }
  return categories;
}

/**
 * Get a single category by ID
 * @param {number} id - Category ID
 * @returns {Object|null} The category or null if not found
 */
function getCategoryById(id) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    return stmt.getAsObject();
  }
  return null;
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
    db.run('INSERT INTO categories (name, color) VALUES (?, ?)', [name, color]);
    saveDatabase();
    const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
    const lastId = lastIdResult[0].values[0][0];
    return getCategoryById(lastId);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
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
    db.run(`
      UPDATE categories 
      SET name = ?, color = ?
      WHERE id = ?
    `, [name, color, id]);
    saveDatabase();

    const changes = db.getRowsModified().changes;
    if (changes === 0) {
      return null;
    }

    return getCategoryById(id);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
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
  db.run('DELETE FROM categories WHERE id = ?', [id]);
  saveDatabase();
  const changes = db.getRowsModified().changes;
  return changes > 0;
}

/**
 * Get category with expense count
 * @param {number} id - Category ID
 * @returns {Object|null} Category with expense count
 */
function getCategoryWithCount(id) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      c.*,
      COUNT(e.id) as expense_count,
      COALESCE(SUM(e.amount), 0) as total_amount
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id
    WHERE c.id = ?
    GROUP BY c.id
  `);
  stmt.bind([id]);
  if (stmt.step()) {
    return stmt.getAsObject();
  }
  return null;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryWithCount
};
