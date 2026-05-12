/**
 * Script de inicialización de base de datos
 * Crea tablas y datos iniciales si no existen
 */

const { initDatabase } = require('../server/models/database');

console.log('🚀 Inicializando base de datos...');

try {
  const db = initDatabase();
  
  // Verificar que las tablas existen
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('✅ Tablas existentes:', tables.map(t => t.name).join(', '));
  
  // Verificar categorías
  const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  console.log(`✅ Categorías registradas: ${categories.count}`);
  
  // Verificar gastos
  const expenses = db.prepare('SELECT COUNT(*) as count FROM expenses').get();
  console.log(`✅ Gastos registrados: ${expenses.count}`);
  
  console.log('\n✨ Base de datos inicializada correctamente!');
  
} catch (error) {
  console.error('❌ Error al inicializar la base de datos:', error.message);
  process.exit(1);
}
