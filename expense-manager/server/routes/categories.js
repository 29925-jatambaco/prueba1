/**
 * Category routes
 * @module server/routes/categories
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

/**
 * @route GET /api/categories
 * @description Get all categories
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryController.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/categories/:id
 * @description Get a single category by ID
 * @param {string} id - Category ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryController.getCategory(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/categories
 * @description Create a new category
 * @body {string} name - Category name (required, max 50 chars)
 * @body {string} color - Category color in hex format (optional, default: #3498db)
 */
router.post('/', async (req, res, next) => {
  try {
    const category = await categoryController.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ 
        error: error.message, 
        details: error.details 
      });
    }
    if (error.message === 'Category name already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * @route PUT /api/categories/:id
 * @description Update an existing category
 * @param {string} id - Category ID
 * @body {string} name - Category name (required, max 50 chars)
 * @body {string} color - Category color in hex format (optional)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const category = await categoryController.updateCategory(req.params.id, req.body);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ 
        error: error.message, 
        details: error.details 
      });
    }
    if (error.message === 'Category name already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * @route DELETE /api/categories/:id
 * @description Delete a category
 * @param {string} id - Category ID
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await categoryController.deleteCategory(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
