const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { isValidAmount, isValidDescription, isValidDate, isValidId, sanitizeString } = require('../utils/validators');

/**
 * GET /api/expenses
 * Obtiene todos los gastos con soporte para filtros
 * Query params: startDate, endDate, categoryId, limit, offset
 */
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate, categoryId, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        e.created_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate && isValidDate(startDate)) {
      query += ' AND e.date >= ?';
      params.push(startDate);
    }
    
    if (endDate && isValidDate(endDate)) {
      query += ' AND e.date <= ?';
      params.push(endDate);
    }
    
    if (categoryId && isValidId(categoryId)) {
      query += ' AND e.category_id = ?';
      params.push(parseInt(categoryId, 10));
    }
    
    query += ' ORDER BY e.date DESC, e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));
    
    const stmt = db.prepare(query);
    const expenses = stmt.all(...params);
    
    // Contar total de registros para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM expenses WHERE 1=1';
    const countParams = [];
    
    if (startDate && isValidDate(startDate)) {
      countQuery += ' AND date >= ?';
      countParams.push(startDate);
    }
    
    if (endDate && isValidDate(endDate)) {
      countQuery += ' AND date <= ?';
      countParams.push(endDate);
    }
    
    if (categoryId && isValidId(categoryId)) {
      countQuery += ' AND category_id = ?';
      countParams.push(parseInt(categoryId, 10));
    }
    
    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams);
    
    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      }
    });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/expenses/:id
 * Obtiene un gasto por su ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de gasto inválido'
      });
    }
    
    const db = getDB();
    const stmt = db.prepare(`
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        e.created_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `);
    
    const expense = stmt.get(parseInt(id, 10));
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error al obtener gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/expenses
 * Crea un nuevo gasto
 */
router.post('/', (req, res) => {
  try {
    const { description, amount, categoryId, date } = req.body;
    
    // Validaciones
    if (!isValidDescription(description)) {
      return res.status(400).json({
        success: false,
        message: 'Descripción inválida (debe tener entre 1 y 255 caracteres)'
      });
    }
    
    if (!isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido (debe ser un número positivo)'
      });
    }
    
    if (!isValidId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría inválida'
      });
    }
    
    const expenseDate = date || new Date().toISOString().split('T')[0];
    
    if (!isValidDate(expenseDate)) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida (formato esperado: YYYY-MM-DD)'
      });
    }
    
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO expenses (description, amount, category_id, date)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      sanitizeString(description),
      parseFloat(amount),
      parseInt(categoryId, 10),
      expenseDate
    );
    
    // Obtener el gasto creado
    const newExpense = db.prepare(`
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        e.created_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: newExpense
    });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/expenses/:id
 * Actualiza un gasto existente
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, categoryId, date } = req.body;
    
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de gasto inválido'
      });
    }
    
    // Verificar que el gasto existe
    const db = getDB();
    const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(parseInt(id, 10));
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    // Validaciones de campos opcionales
    if (description !== undefined && !isValidDescription(description)) {
      return res.status(400).json({
        success: false,
        message: 'Descripción inválida'
      });
    }
    
    if (amount !== undefined && !isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }
    
    if (categoryId !== undefined && !isValidId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría inválida'
      });
    }
    
    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida'
      });
    }
    
    // Construir update dinámico
    const updates = [];
    const params = [];
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(sanitizeString(description));
    }
    
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(parseFloat(amount));
    }
    
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(parseInt(categoryId, 10));
    }
    
    if (date !== undefined) {
      updates.push('date = ?');
      params.push(date);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }
    
    params.push(parseInt(id, 10));
    
    const stmt = db.prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    // Obtener el gasto actualizado
    const updatedExpense = db.prepare(`
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        e.created_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `).get(parseInt(id, 10));
    
    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/expenses/:id
 * Elimina un gasto
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de gasto inválido'
      });
    }
    
    const db = getDB();
    
    // Verificar que el gasto existe
    const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(parseInt(id, 10));
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(parseInt(id, 10));
    
    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
