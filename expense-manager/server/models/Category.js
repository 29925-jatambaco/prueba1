/**
 * Category Model - Handles all database operations for categories
 * @module server/models/Category
 */
const { getDatabase } = require('./database');

class Category {
  /**
   * Get all categories
   * @returns {Array} All categories
   */
  static getAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  }
  
  /**
   * Get a single category by ID
   * @param {number} id - Category ID
   * @returns {Object|null} The category or null if not found
   */
  static getById(id) {
    const db = getDatabase();
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return category || null;
  }
  
  /**
   * Create a new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name
   * @param {string} data.color - Category color (hex)
   * @returns {Object} Created category
   */
  static create(data) {
    const db = getDatabase();
    
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    
    if (data.name.length > 50) {
      throw new Error('Category name must be less than 50 characters');
    }
    
    const color = data.color || '#3498db';
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      throw new Error('Invalid color format. Use hex format: #RRGGBB');
    }
    
    try {
      const result = db.prepare(
        'INSERT INTO categories (name, color) VALUES (?, ?)'
      ).run(data.name.trim(), color);
      
      return this.getById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE')) {
        throw new Error('Category with this name already exists');
      }
      throw error;
    }
  }
  
  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Object|null} Updated category or null if not found
   */
  static update(id, data) {
    const db = getDatabase();
    const existing = this.getById(id);
    
    if (!existing) {
      return null;
    }
    
    const fields = [];
    const values = [];
    
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error('Category name cannot be empty');
      }
      if (data.name.length > 50) {
        throw new Error('Category name must be less than 50 characters');
      }
      fields.push('name = ?');
      values.push(data.name.trim());
    }
    
    if (data.color !== undefined) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
        throw new Error('Invalid color format. Use hex format: #RRGGBB');
      }
      fields.push('color = ?');
      values.push(data.color);
    }
    
    if (fields.length === 0) {
      return existing;
    }
    
    values.push(id);
    
    try {
      db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...values);
      return this.getById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE')) {
        throw new Error('Category with this name already exists');
      }
      throw error;
    }
  }
  
  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {boolean} True if deleted, false if not found
   */
  static delete(id) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = Category;
