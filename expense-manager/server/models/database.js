/**
 * Database initialization and configuration
 * @module server/models/database
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
let SQL = null;

/**
 * Initialize the SQLite database with required tables
 * @returns {Promise<Database>} The database instance
 */
async function initDatabase() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/expenses.db');
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize sql.js
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('New database created');
    }
  } catch (err) {
    console.error('Error loading database, creating new one:', err.message);
    db = new SQL.Database();
  }

  // Create categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3498db',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create expenses table
  db.run(`
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
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id)`);

  // Insert default categories if none exist
  const existingCategories = db.exec('SELECT COUNT(*) as count FROM categories');
  const count = existingCategories.length > 0 ? existingCategories[0].values[0][0] : 0;
  
  if (count === 0) {
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

    defaultCategories.forEach(cat => {
      db.run('INSERT INTO categories (name, color) VALUES (?, ?)', [cat.name, cat.color]);
    });
    saveDatabase();
    console.log('Default categories inserted');
  }

  console.log('Database initialized successfully');
  return db;
}

/**
 * Save the database to disk (only for file-based databases)
 */
function saveDatabase() {
  if (db && SQL) {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/expenses.db');
    // Skip saving for in-memory databases
    if (dbPath === ':memory:') {
      return;
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
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
    saveDatabase();
    db.close();
    db = null;
    SQL = null;
  }
}

module.exports = {
  initDatabase,
  getDb,
  closeDatabase,
  saveDatabase
};
