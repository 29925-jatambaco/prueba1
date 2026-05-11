/**
 * Unit tests for expense model
 */
const { getDb, initDatabase, closeDatabase } = require('../../server/models/database');
const expenseModel = require('../../server/models/expenseModel');
const categoryModel = require('../../server/models/categoryModel');

describe('Expense Model', () => {
  let db;
  let testCategoryId;

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    db = initDatabase();
    
    // Create a test category
    const category = categoryModel.createCategory({ name: 'Test Category', color: '#ff0000' });
    testCategoryId = category.id;
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    // Clean up expenses before each test
    db.exec('DELETE FROM expenses');
  });

  describe('createExpense', () => {
    it('should create a new expense', () => {
      const expenseData = {
        amount: 50.00,
        category_id: testCategoryId,
        description: 'Test expense',
        date: '2024-01-15'
      };

      const result = expenseModel.createExpense(expenseData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(50.00);
      expect(result.category_id).toBe(testCategoryId);
      expect(result.description).toBe('Test expense');
    });

    it('should create expense without description', () => {
      const expenseData = {
        amount: 25.50,
        category_id: testCategoryId,
        date: '2024-01-15'
      };

      const result = expenseModel.createExpense(expenseData);

      expect(result).toBeDefined();
      expect(result.description).toBeNull();
    });
  });

  describe('getExpenseById', () => {
    it('should return expense by id', () => {
      const expenseData = {
        amount: 100.00,
        category_id: testCategoryId,
        description: 'Get by ID test',
        date: '2024-01-15'
      };

      const created = expenseModel.createExpense(expenseData);
      const found = expenseModel.getExpenseById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.amount).toBe(100.00);
    });

    it('should return null for non-existent expense', () => {
      const result = expenseModel.getExpenseById(99999);
      expect(result).toBeNull();
    });
  });

  describe('getAllExpenses', () => {
    it('should return paginated expenses', () => {
      // Create multiple expenses
      for (let i = 1; i <= 15; i++) {
        expenseModel.createExpense({
          amount: i * 10,
          category_id: testCategoryId,
          description: `Expense ${i}`,
          date: '2024-01-15'
        });
      }

      const result = expenseModel.getAllExpenses({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter by category', () => {
      const otherCategory = categoryModel.createCategory({ name: 'Other Test', color: '#00ff00' });
      
      expenseModel.createExpense({
        amount: 50,
        category_id: testCategoryId,
        date: '2024-01-15'
      });
      
      expenseModel.createExpense({
        amount: 75,
        category_id: otherCategory.id,
        date: '2024-01-15'
      });

      const result = expenseModel.getAllExpenses({ category: testCategoryId });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].category_id).toBe(testCategoryId);
    });
  });

  describe('updateExpense', () => {
    it('should update an existing expense', () => {
      const created = expenseModel.createExpense({
        amount: 50,
        category_id: testCategoryId,
        description: 'Original',
        date: '2024-01-15'
      });

      const updated = expenseModel.updateExpense(created.id, {
        amount: 100,
        category_id: testCategoryId,
        description: 'Updated',
        date: '2024-01-16'
      });

      expect(updated).toBeDefined();
      expect(updated.amount).toBe(100);
      expect(updated.description).toBe('Updated');
    });

    it('should return null for non-existent expense', () => {
      const result = expenseModel.updateExpense(99999, {
        amount: 100,
        category_id: testCategoryId,
        date: '2024-01-15'
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense', () => {
      const created = expenseModel.createExpense({
        amount: 50,
        category_id: testCategoryId,
        date: '2024-01-15'
      });

      const deleted = expenseModel.deleteExpense(created.id);
      expect(deleted).toBe(true);

      const found = expenseModel.getExpenseById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent expense', () => {
      const result = expenseModel.deleteExpense(99999);
      expect(result).toBe(false);
    });
  });
});
