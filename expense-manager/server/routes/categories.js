/**
 * Categories Router - API endpoints for category management
 * @module server/routes/categories
 */
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

/**
 * @route GET /api/categories
 * @description Get all categories
 */
router.get('/', (req, res) => {
  try {
    const categories = Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

/**
 * @route POST /api/categories
 * @description Create a new category
 * @body {string} name - Category name
 * @body {string} color - Category color (hex format: #RRGGBB)
 */
router.post('/', (req, res) => {
  try {
    const category = Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/categories/:id
 * @description Get a single category by ID
 * @param {number} id - Category ID
 */
router.get('/:id', (req, res) => {
  try {
    const category = Category.getById(parseInt(req.params.id));
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

/**
 * @route PUT /api/categories/:id
 * @description Update an existing category
 * @param {number} id - Category ID
 * @body {string} name - Category name
 * @body {string} color - Category color (hex format: #RRGGBB)
 */
router.put('/:id', (req, res) => {
  try {
    const category = Category.update(parseInt(req.params.id), req.body);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/categories/:id
 * @description Delete a category
 * @param {number} id - Category ID
 */
router.delete('/:id', (req, res) => {
  try {
    const deleted = Category.delete(parseInt(req.params.id));
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
