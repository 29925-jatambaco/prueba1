const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Ruta de la base de datos SQLite (archivo local)
const DB_PATH = path.join(__dirname, '..', 'expenses.db');

let db = null;
let SQL = null;

/**
 * Inicializa la conexión a la base de datos y crea las tablas si no existen
 */
async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Cargar base de datos existente o crear nueva
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (err) {
    console.error('Error loading database:', err);
    db = new SQL.Database();
  }
  
  // Crear tabla de categorías
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#3498db',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Crear tabla de gastos
  db.run(`
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
  
  defaultCategories.forEach(cat => {
    db.run('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)', [cat.name, cat.color]);
  });
  
  // Guardar cambios iniciales
  saveDB();
  
  console.log('✅ Base de datos inicializada correctamente');
  return db;
}

/**
 * Guarda la base de datos en disco
 */
function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 */
function closeDB() {
  if (db) {
    saveDB();
    db.close();
    console.log('🔒 Base de datos cerrada');
  }
}

module.exports = {
  initDB,
  getDB,
  closeDB,
  saveDB
};
