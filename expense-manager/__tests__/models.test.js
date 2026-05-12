/**
 * @jest-environment node
 */

const { getDatabase, initDatabase } = require('../server/models/database');
const Expense = require('../server/models/Expense');
const Category = require('../server/models/Category');

describe('Database', () => {
  test('should initialize database successfully', () => {
    const db = initDatabase();
    expect(db).toBeDefined();
  });
});

describe('Category Model', () => {
  beforeAll(() => {
    initDatabase();
  });

  test('should get all categories', () => {
    const categories = Category.getAll();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  test('should get category by id', () => {
    const category = Category.getById(1);
    expect(category).toBeDefined();
    expect(category.id).toBe(1);
  });

  test('should create a new category', () => {
    const newCategory = Category.create({
      name: 'Test Category',
      color: '#FF5733'
    });
    expect(newCategory).toBeDefined();
    expect(newCategory.name).toBe('Test Category');
    expect(newCategory.color).toBe('#FF5733');
    
    // Cleanup
    Category.delete(newCategory.id);
  });

  test('should throw error for duplicate category name', () => {
    expect(() => {
      Category.create({
        name: 'Food',
        color: '#FF5733'
      });
    }).toThrow();
  });

  test('should update category', () => {
    const category = Category.create({
      name: 'Update Test',
      color: '#123456'
    });
    
    const updated = Category.update(category.id, {
      name: 'Updated Test',
      color: '#654321'
    });
    
    expect(updated.name).toBe('Updated Test');
    expect(updated.color).toBe('#654321');
    
    // Cleanup
    Category.delete(category.id);
  });

  test('should delete category', () => {
    const category = Category.create({
      name: 'Delete Test',
      color: '#ABCDEF'
    });
    
    const deleted = Category.delete(category.id);
    expect(deleted).toBe(true);
    
    const afterDelete = Category.getById(category.id);
    expect(afterDelete).toBeNull();
  });
});

describe('Expense Model', () => {
  let categoryId;
  
  beforeAll(() => {
    initDatabase();
    const categories = Category.getAll();
    categoryId = categories[0].id;
  });

  test('should validate amount > 0', () => {
    expect(() => {
      Expense.create({
        amount: 0,
        description: 'Test expense',
        categoryId: categoryId,
        date: '2024-01-15'
      });
    }).toThrow('Amount must be greater than 0');
  });

  test('should validate description required', () => {
    expect(() => {
      Expense.create({
        amount: 100,
        description: '',
        categoryId: categoryId,
        date: '2024-01-15'
      });
    }).toThrow('Description is required');
  });

  test('should validate description max length', () => {
    expect(() => {
      Expense.create({
        amount: 100,
        description: 'a'.repeat(201),
        categoryId: categoryId,
        date: '2024-01-15'
      });
    }).toThrow('Description must be less than 200 characters');
  });

  test('should validate category required', () => {
    expect(() => {
      Expense.create({
        amount: 100,
        description: 'Test expense',
        categoryId: null,
        date: '2024-01-15'
      });
    }).toThrow('Category is required');
  });

  test('should validate date format', () => {
    expect(() => {
      Expense.create({
        amount: 100,
        description: 'Test expense',
        categoryId: categoryId,
        date: 'invalid-date'
      });
    }).toThrow('Valid date is required');
  });

  test('should create expense successfully', () => {
    const expense = Expense.create({
      amount: 150.50,
      description: 'Test grocery shopping',
      categoryId: categoryId,
      date: '2024-01-15'
    });
    
    expect(expense).toBeDefined();
    expect(expense.amount).toBe(150.50);
    expect(expense.description).toBe('Test grocery shopping');
    
    // Cleanup
    Expense.delete(expense.id);
  });

  test('should get expense by id', () => {
    const expense = Expense.create({
      amount: 200,
      description: 'Test for get',
      categoryId: categoryId,
      date: '2024-01-15'
    });
    
    const found = Expense.getById(expense.id);
    expect(found).toBeDefined();
    expect(found.id).toBe(expense.id);
    
    // Cleanup
    Expense.delete(expense.id);
  });

  test('should update expense', () => {
    const expense = Expense.create({
      amount: 100,
      description: 'Original',
      categoryId: categoryId,
      date: '2024-01-15'
    });
    
    const updated = Expense.update(expense.id, {
      amount: 250.75,
      description: 'Updated description'
    });
    
    expect(updated.amount).toBe(250.75);
    expect(updated.description).toBe('Updated description');
    
    // Cleanup
    Expense.delete(expense.id);
  });

  test('should delete expense', () => {
    const expense = Expense.create({
      amount: 50,
      description: 'To be deleted',
      categoryId: categoryId,
      date: '2024-01-15'
    });
    
    const deleted = Expense.delete(expense.id);
    expect(deleted).toBe(true);
    
    const afterDelete = Expense.getById(expense.id);
    expect(afterDelete).toBeNull();
  });

  test('should get summary', () => {
    const summary = Expense.getSummary();
    expect(summary).toBeDefined();
    expect(summary.currentMonth).toBeDefined();
    expect(summary.categoryBreakdown).toBeDefined();
    expect(summary.topExpenses).toBeDefined();
  });
});
