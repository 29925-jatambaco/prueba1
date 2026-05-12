const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB, closeDB } = require('./db');

// Rutas de la API
const expensesRoutes = require('./routes/expenses');
const statsRoutes = require('./routes/stats');

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del cliente
app.use(express.static(path.join(__dirname, '..', 'client')));

// Rutas de la API
app.use('/api/expenses', expensesRoutes);
app.use('/api/stats', statsRoutes);

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Ruta por defecto - servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Inicializar base de datos y arrancar servidor
initDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
    console.log(`💾 Base de datos: expenses.db\n`);
  });

  // Cierre graceful
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    closeDB();
    server.close(() => {
      console.log('✅ Servidor cerrado');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    closeDB();
    server.close(() => {
      console.log('✅ Servidor cerrado');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('❌ Error al inicializar la base de datos:', err);
  process.exit(1);
});

module.exports = app;
