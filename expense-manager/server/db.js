const Database = require('better-sqlite3');
const path = require('path');

// Ruta de la base de datos SQLite (archivo local)
const DB_PATH = path.join(__dirname, '..', 'expenses.db');

let db;

/**
 * Inicializa la conexión a la base de datos y crea las tablas si no existen
 */
function initDB() {
  db = new Database(DB_PATH);
  
  // Habilitar foreign keys
  db.pragma('foreign_keys = ON');
  
  // Crear tabla de categorías
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3498db',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Crear tabla de gastos
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);
  
  // Insertar categorías por defecto si no existen
  const defaultCategories = [
    { name: 'Alimentación', color: '#e74c3c' },
    { name: 'Transporte', color: '#3498db' },
    { name: 'Vivienda', color: '#2ecc71' },
    { name: 'Ocio', color: '#f39c12' },
    { name: 'Salud', color: '#9b59b6' },
    { name: 'Educación', color: '#1abc9c' },
    { name: 'Ropa', color: '#e67e22' },
    { name: 'Otros', color: '#95a5a6' }
  ];
  
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)');
  
  defaultCategories.forEach(cat => {
    insertCategory.run(cat.name, cat.color);
  });
  
  console.log('✅ Base de datos inicializada correctamente');
  return db;
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDB() {
  if (!db) {
    return initDB();
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 */
function closeDB() {
  if (db) {
    db.close();
    console.log('🔒 Base de datos cerrada');
  }
}

module.exports = {
  initDB,
  getDB,
  closeDB
};
