/**
 * Integration tests for expenses API
 */
const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../server/models/database');
const expenseModel = require('../../server/models/expenseModel');

// Mock app for testing
const express = require('express');
const expensesRouter = require('../../server/routes/expenses');
const app = express();
app.use(express.json());
app.use('/api/expenses', expensesRouter);

describe('Expenses API', () => {
  let testCategoryId;

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    initDatabase();
    
    // Create a test category using the model directly
    const categoryModel = require('../../server/models/categoryModel');
    const category = categoryModel.createCategory({ name: 'API Test', color: '#123456' });
    testCategoryId = category.id;
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    const { getDb } = require('../../server/models/database');
    const db = getDb();
    db.exec('DELETE FROM expenses');
  });

  describe('GET /api/expenses', () => {
    it('should return empty list when no expenses', async () => {
      const response = await request(app).get('/api/expenses');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return paginated expenses', async () => {
      // Create test expenses
      expenseModel.createExpense({
        amount: 50,
        category_id: testCategoryId,
        description: 'Test 1',
        date: '2024-01-15'
      });
      expenseModel.createExpense({
        amount: 75,
        category_id: testCategoryId,
        description: 'Test 2',
        date: '2024-01-16'
      });

      const response = await request(app).get('/api/expenses');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const newExpense = {
        amount: 100.50,
        category_id: testCategoryId,
        description: 'New test expense',
        date: '2024-01-20'
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(newExpense);

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(100.50);
      expect(response.body.category_id).toBe(testCategoryId);
      expect(response.body.description).toBe('New test expense');
    });

    it('should reject expense with invalid amount', async () => {
      const newExpense = {
        amount: -10,
        category_id: testCategoryId,
        date: '2024-01-20'
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(newExpense);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject expense without category', async () => {
      const newExpense = {
        amount: 50,
        date: '2024-01-20'
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(newExpense);

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Category is required');
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update an existing expense', async () => {
      const created = expenseModel.createExpense({
        amount: 50,
        category_id: testCategoryId,
        description: 'Original',
        date: '2024-01-15'
      });

      const updated = {
        amount: 150,
        category_id: testCategoryId,
        description: 'Updated',
        date: '2024-01-16'
      };

      const response = await request(app)
        .put(`/api/expenses/${created.id}`)
        .send(updated);

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(150);
      expect(response.body.description).toBe('Updated');
    });

    it('should return 404 for non-existent expense', async () => {
      const response = await request(app)
        .put('/api/expenses/99999')
        .send({
          amount: 100,
          category_id: testCategoryId,
          date: '2024-01-15'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense', async () => {
      const created = expenseModel.createExpense({
        amount: 50,
        category_id: testCategoryId,
        date: '2024-01-15'
      });

      const response = await request(app).delete(`/api/expenses/${created.id}`);
      
      expect(response.status).toBe(204);
      
      // Verify deletion
      const found = expenseModel.getExpenseById(created.id);
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent expense', async () => {
      const response = await request(app).delete('/api/expenses/99999');
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should return a single expense', async () => {
      const created = expenseModel.createExpense({
        amount: 75.25,
        category_id: testCategoryId,
        description: 'Single expense',
        date: '2024-01-15'
      });

      const response = await request(app).get(`/api/expenses/${created.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(created.id);
      expect(response.body.amount).toBe(75.25);
    });

    it('should return 404 for non-existent expense', async () => {
      const response = await request(app).get('/api/expenses/99999');
      
      expect(response.status).toBe(404);
    });
  });
});
