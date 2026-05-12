/**
 * Database initialization and configuration
 * @module server/models/database
 */
const Database = require('better-sqlite3');
const path = require('path');

let db = null;

/**
 * Initialize the SQLite database
 * @returns {Database} The database instance
 */
function initDatabase() {
  const dbPath = path.join(__dirname, '../../data/expenses.db');
  
  // Ensure data directory exists
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3498db',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);
  
  // Insert default categories if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (count.count === 0) {
    const defaultCategories = [
      { name: 'Food', color: '#e74c3c' },
      { name: 'Transport', color: '#3498db' },
      { name: 'Shopping', color: '#9b59b6' },
      { name: 'Entertainment', color: '#f39c12' },
      { name: 'Bills', color: '#2ecc71' },
      { name: 'Health', color: '#1abc9c' },
      { name: 'Education', color: '#34495e' },
      { name: 'Other', color: '#95a5a6' }
    ];
    
    const insert = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
    for (const cat of defaultCategories) {
      insert.run(cat.name, cat.color);
    }
  }
  
  console.log('✅ Database initialized successfully');
  return db;
}

/**
 * Get the database instance
 * @returns {Database} The database instance
 */
function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

module.exports = { initDatabase, getDatabase };
