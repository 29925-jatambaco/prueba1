const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

/**
 * GET /api/stats/summary
 * Obtiene estadísticas resumidas: totales, desglose por categoría, comparativa mensual
 * Query params: startDate, endDate (opcional, por defecto mes actual)
 */
router.get('/summary', (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate } = req.query;
    
    // Determinar rango de fechas (por defecto: mes actual)
    let start = startDate;
    let end = endDate;
    
    if (!start || !end) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      start = start || `${year}-${month}-01`;
      
      // Último día del mes
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      end = end || `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    }
    
    // Total gastado en el periodo
    const totalStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE date >= ? AND date <= ?
    `);
    const { total } = totalStmt.get(start, end);
    
    // Desglose por categoría
    const categoryStmt = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.color,
        COALESCE(SUM(e.amount), 0) as amount,
        COUNT(e.id) as count
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id AND e.date >= ? AND e.date <= ?
      GROUP BY c.id, c.name, c.color
      HAVING amount > 0
      ORDER BY amount DESC
    `);
    const byCategory = categoryStmt.all(start, end);
    
    // Gastos diarios (para promedio)
    const dailyStmt = db.prepare(`
      SELECT 
        date,
        SUM(amount) as daily_amount
      FROM expenses
      WHERE date >= ? AND date <= ?
      GROUP BY date
    `);
    const dailyExpenses = dailyStmt.all(start, end);
    
    // Calcular promedio diario
    const daysInPeriod = Math.max(
      1,
      Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1
    );
    const averageDaily = total / daysInPeriod;
    
    // Top 5 gastos más altos
    const topStmt = db.prepare(`
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        c.name as category_name,
        c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.date >= ? AND e.date <= ?
      ORDER BY e.amount DESC
      LIMIT 5
    `);
    const topExpenses = topStmt.all(start, end);
    
    // Comparativa con el mes anterior
    const prevMonthStart = new Date(start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(end);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
    
    const prevMonthStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE date >= ? AND date <= ?
    `);
    const { total: prevTotal } = prevMonthStmt.get(
      prevMonthStart.toISOString().split('T')[0],
      prevMonthEnd.toISOString().split('T')[0]
    );
    
    const variation = prevTotal > 0 
      ? ((total - prevTotal) / prevTotal) * 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        period: { start, end },
        total: parseFloat(total.toFixed(2)),
        averageDaily: parseFloat(averageDaily.toFixed(2)),
        daysInPeriod,
        byCategory,
        topExpenses,
        comparison: {
          previousMonth: parseFloat(prevTotal.toFixed(2)),
          variation: parseFloat(variation.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/stats/categories
 * Obtiene todas las categorías disponibles
 */
router.get('/categories', (req, res) => {
  try {
    const db = getDB();
    const stmt = db.prepare('SELECT id, name, color FROM categories ORDER BY name');
    const categories = stmt.all();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
