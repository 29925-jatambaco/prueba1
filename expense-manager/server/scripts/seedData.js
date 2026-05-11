/**
 * Script para inicializar la base de datos con datos de prueba
 * @module server/scripts/seedData
 */

const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Configurar ruta de la base de datos
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/expenses.db');

// Asegurar que el directorio data existe
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Eliminar base de datos existente si existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Base de datos anterior eliminada');
}

// Crear nueva base de datos
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Inicializando base de datos con datos de prueba...');

// Crear tablas
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
    category_id INTEGER NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )
`);

// Crear índices
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
`);

// Insertar categorías
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
const insertManyCategories = db.transaction((categories) => {
  for (const cat of categories) {
    insertCategory.run(cat.name, cat.color);
  }
});

insertManyCategories(defaultCategories);
console.log(`✓ ${defaultCategories.length} categorías insertadas`);

// Obtener IDs de categorías
const categories = db.prepare('SELECT id, name FROM categories').all();
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name] = cat.id;
});

// Datos de prueba para gastos
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();
const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

const testExpenses = [
  // Gastos del mes actual
  { amount: 45.50, category: 'Food & Dining', description: 'Almuerzo en restaurante', month: currentMonth, year: currentYear, day: 1 },
  { amount: 120.00, category: 'Bills & Utilities', description: 'Factura de electricidad', month: currentMonth, year: currentYear, day: 3 },
  { amount: 35.99, category: 'Entertainment', description: 'Suscripción Netflix', month: currentMonth, year: currentYear, day: 5 },
  { amount: 85.00, category: 'Transportation', description: 'Tanque de gasolina', month: currentMonth, year: currentYear, day: 7 },
  { amount: 250.00, category: 'Shopping', description: 'Ropa nueva', month: currentMonth, year: currentYear, day: 10 },
  { amount: 65.00, category: 'Food & Dining', description: 'Supermercado semanal', month: currentMonth, year: currentYear, day: 12 },
  { amount: 150.00, category: 'Healthcare', description: 'Consulta médica', month: currentMonth, year: currentYear, day: 14 },
  { amount: 45.00, category: 'Education', description: 'Libros de curso', month: currentMonth, year: currentYear, day: 15 },
  { amount: 30.00, category: 'Entertainment', description: 'Entradas cine', month: currentMonth, year: currentYear, day: 17 },
  { amount: 95.00, category: 'Food & Dining', description: 'Cena aniversario', month: currentMonth, year: currentYear, day: 18 },
  { amount: 200.00, category: 'Bills & Utilities', description: 'Internet y teléfono', month: currentMonth, year: currentYear, day: 20 },
  { amount: 55.00, category: 'Transportation', description: 'Uber varios viajes', month: currentMonth, year: currentYear, day: 22 },
  { amount: 180.00, category: 'Shopping', description: 'Zapatos deportivos', month: currentMonth, year: currentYear, day: 23 },
  { amount: 40.00, category: 'Other', description: 'Regalo cumpleaños', month: currentMonth, year: currentYear, day: 25 },
  { amount: 75.00, category: 'Food & Dining', description: 'Supermercado quincenal', month: currentMonth, year: currentYear, day: 26 },
  
  // Gastos del mes anterior (para comparativa)
  { amount: 38.50, category: 'Food & Dining', description: 'Almuerzo oficina', month: lastMonth, year: lastMonthYear, day: 2 },
  { amount: 115.00, category: 'Bills & Utilities', description: 'Electricidad mes pasado', month: lastMonth, year: lastMonthYear, day: 4 },
  { amount: 35.99, category: 'Entertainment', description: 'Netflix mes pasado', month: lastMonth, year: lastMonthYear, day: 5 },
  { amount: 90.00, category: 'Transportation', description: 'Gasolina mes pasado', month: lastMonth, year: lastMonthYear, day: 8 },
  { amount: 320.00, category: 'Shopping', description: 'Electrónicos', month: lastMonth, year: lastMonthYear, day: 12 },
  { amount: 58.00, category: 'Food & Dining', description: 'Supermercado semana 1', month: lastMonth, year: lastMonthYear, day: 14 },
  { amount: 80.00, category: 'Healthcare', description: 'Medicamentos', month: lastMonth, year: lastMonthYear, day: 16 },
  { amount: 120.00, category: 'Education', description: 'Curso online', month: lastMonth, year: lastMonthYear, day: 18 },
  { amount: 25.00, category: 'Entertainment', description: 'Streaming servicios', month: lastMonth, year: lastMonthYear, day: 20 },
  { amount: 65.00, category: 'Food & Dining', description: 'Restaurantes varias veces', month: lastMonth, year: lastMonthYear, day: 22 },
  { amount: 190.00, category: 'Bills & Utilities', description: 'Servicios básicos', month: lastMonth, year: lastMonthYear, day: 24 },
  { amount: 45.00, category: 'Transportation', description: 'Transporte público', month: lastMonth, year: lastMonthYear, day: 26 },
  { amount: 150.00, category: 'Shopping', description: 'Accesorios', month: lastMonth, year: lastMonthYear, day: 28 },
  { amount: 35.00, category: 'Other', description: 'Varios', month: lastMonth, year: lastMonthYear, day: 29 },
];

const insertExpense = db.prepare(`
  INSERT INTO expenses (amount, category_id, description, date) 
  VALUES (?, ?, ?, ?)
`);

const insertManyExpenses = db.transaction((expenses) => {
  for (const expense of expenses) {
    const categoryId = categoryMap[expense.category];
    const date = new Date(expense.year, expense.month, expense.day);
    const formattedDate = date.toISOString().split('T')[0];
    insertExpense.run(expense.amount, categoryId, expense.description, formattedDate);
  }
});

insertManyExpenses(testExpenses);
console.log(`✓ ${testExpenses.length} gastos insertados`);

// Calcular totales
const totalCurrentMonth = db.prepare(`
  SELECT SUM(amount) as total 
  FROM expenses e 
  JOIN categories c ON e.category_id = c.id 
  WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
`).get(String(currentYear), String(currentMonth + 1).padStart(2, '0'));

const totalLastMonth = db.prepare(`
  SELECT SUM(amount) as total 
  FROM expenses e 
  JOIN categories c ON e.category_id = c.id 
  WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
`).get(String(lastMonthYear), String(lastMonth + 1).padStart(2, '0'));

console.log('\n📊 Resumen de datos insertados:');
console.log(`   Total mes actual: $${totalCurrentMonth.total?.toFixed(2) || '0.00'}`);
console.log(`   Total mes anterior: $${totalLastMonth.total?.toFixed(2) || '0.00'}`);

// Cerrar conexión
db.close();

console.log('\n✅ Base de datos inicializada correctamente con datos de prueba!');
console.log(`   Ubicación: ${dbPath}\n`);
