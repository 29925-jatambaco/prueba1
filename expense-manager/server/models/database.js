/**
 * Database initialization and configuration
 * @module server/models/database
 */
const Database = require('better-sqlite3');
const path = require('path');

let db = null;

/**
 * Initialize the SQLite database with required tables
 * @returns {Database} The database instance
 */
function initDatabase() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/expenses.db');
  
  // Ensure data directory exists
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3498db',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
  `);

  // Insert default categories if none exist
  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existingCategories.count === 0) {
    const defaultCategories = [
      { name: 'Food & Dining', color: '#e74c3c' },
      { name: 'Transportation', color: '#3498db' },
      { name: 'Shopping', color: '#9b59b6' },
      { name: 'Entertainment', color: '#f39c12' },
      { name: 'Bills & Utilities', color: '#2ecc71' },
      { name: 'Healthcare', color: '#1abc9c' },
      { name: 'Education', color: '#34495e' },
      { name: 'Other', color: '#95a5a6' }
    ];

    const insertCategory = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
    const insertMany = db.transaction((categories) => {
      for (const cat of categories) {
        insertCategory.run(cat.name, cat.color);
      }
    });
    insertMany(defaultCategories);
  }

  console.log('Database initialized successfully');
  return db;
}

/**
 * Get the database instance
 * @returns {Database} The database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDb,
  closeDatabase
};
