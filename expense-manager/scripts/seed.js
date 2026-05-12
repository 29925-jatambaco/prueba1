/**
 * Script para poblar datos de prueba
 * Útil para desarrollo y demostración
 */

const Database = require('../server/models/database');

console.log('🌱 Poblando datos de prueba...');

try {
  const db = Database.getInstance();
  
  // Insertar gastos de prueba si no existen
  const existingExpenses = db.prepare('SELECT COUNT(*) as count FROM expenses').get();
  
  if (existingExpenses.count === 0) {
    const insertExpense = db.prepare(`
      INSERT INTO expenses (amount, category_id, date, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const testExpenses = [
      [150.00, 1, today, 'Compra de supermercado semanal', new Date().toISOString()],
      [45.99, 2, today, 'Suscripción Netflix mensual', new Date().toISOString()],
      [89.50, 3, today, 'Cena en restaurante', new Date().toISOString()],
      [200.00, 4, today, 'Tank full gasoline', new Date().toISOString()],
      [35.00, 5, today, 'Medicamentos farmacia', new Date().toISOString()],
      [120.00, 6, today, 'Clases de gimnasio mensual', new Date().toISOString()],
      [55.00, 7, today, 'Regalo cumpleaños amigo', new Date().toISOString()],
      [29.99, 8, today, 'Libro técnico programación', new Date().toISOString()],
      [320.00, 1, lastMonth, 'Compra grande supermercado', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()],
      [180.00, 4, lastMonth, 'Mantenimiento vehículo', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()],
    ];
    
    const insertMany = db.transaction((expenses) => {
      for (const expense of expenses) {
        insertExpense.run(...expense);
      }
    });
    
    insertMany(testExpenses);
    console.log(`✅ ${testExpenses.length} gastos de prueba insertados`);
  } else {
    console.log('ℹ️  Ya existen gastos en la base de datos');
  }
  
  console.log('\n✨ Datos de prueba listos!');
  
} catch (error) {
  console.error('❌ Error al poblar datos:', error.message);
  process.exit(1);
}
