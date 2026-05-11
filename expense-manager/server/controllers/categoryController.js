/**
 * Category controller for handling business logic
 * @module server/controllers/categoryController
 */
const categoryModel = require('../models/categoryModel');

/**
 * Validate category data
 * @param {Object} data - Category data to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateCategoryData(data) {
  const errors = [];

  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Category name is required');
  } else if (data.name.trim().length === 0) {
    errors.push('Category name cannot be empty');
  } else if (data.name.length > 50) {
    errors.push('Category name must not exceed 50 characters');
  }

  // Validate color (optional)
  if (data.color) {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(data.color)) {
      errors.push('Invalid color format. Use hexadecimal format (e.g., #3498db)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all categories
 * @returns {Array} List of categories
 */
async function getAllCategories() {
  return categoryModel.getAllCategories();
}

/**
 * Get a single category by ID
 * @param {number} id - Category ID
 * @returns {Object|null} The category
 */
async function getCategory(id) {
  return categoryModel.getCategoryById(id);
}

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Object} The created category
 * @throws {Error} If validation fails
 */
async function createCategory(categoryData) {
  const validation = validateCategoryData(categoryData);
  
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  return categoryModel.createCategory({
    name: categoryData.name.trim(),
    color: categoryData.color || '#3498db'
  });
}

/**
 * Update an existing category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Object|null} The updated category
 * @throws {Error} If validation fails or category not found
 */
async function updateCategory(id, categoryData) {
  const existing = categoryModel.getCategoryById(id);
  if (!existing) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateCategoryData(categoryData);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = validation.errors;
    throw error;
  }

  const updated = categoryModel.updateCategory(id, {
    name: categoryData.name.trim(),
    color: categoryData.color
  });

  if (!updated) {
    const error = new Error('Failed to update category');
    error.statusCode = 500;
    throw error;
  }

  return updated;
}

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {boolean} True if deleted
 * @throws {Error} If category not found
 */
async function deleteCategory(id) {
  const existing = categoryModel.getCategoryById(id);
  if (!existing) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return categoryModel.deleteCategory(id);
}

module.exports = {
  validateCategoryData,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
