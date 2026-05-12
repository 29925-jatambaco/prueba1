/**
 * @jest-environment node
 */

const request = require('supertest');
const app = require('../server/index');
const { initDatabase } = require('../server/models/database');
const Expense = require('../server/models/Expense');
const Category = require('../server/models/Category');

describe('API Endpoints', () => {
  let categoryId;
  let expenseId;

  beforeAll(() => {
    initDatabase();
    const categories = Category.getAll();
    categoryId = categories[0].id;
  });

  // Categories API Tests
  describe('GET /api/categories', () => {
    test('should return all categories', async () => {
      const response = await request(app).get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/categories', () => {
    test('should create a new category', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'API Test Category',
          color: '#123456'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('API Test Category');
      expect(response.body.color).toBe('#123456');
      
      // Cleanup
      Category.delete(response.body.id);
    });

    test('should reject invalid color format', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Invalid Color Category',
          color: 'invalid'
        });
      
      expect(response.status).toBe(400);
    });
  });

  // Expenses API Tests
  describe('GET /api/expenses', () => {
    test('should return paginated expenses', async () => {
      const response = await request(app).get('/api/expenses?page=1&limit=10');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/expenses?category=${categoryId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/expenses', () => {
    test('should create a new expense', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          amount: 99.99,
          description: 'API Test Expense',
          categoryId: categoryId,
          date: '2024-01-15'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(99.99);
      expect(response.body.description).toBe('API Test Expense');
      
      expenseId = response.body.id;
    });

    test('should reject expense with amount <= 0', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          amount: 0,
          description: 'Invalid expense',
          categoryId: categoryId,
          date: '2024-01-15'
        });
      
      expect(response.status).toBe(400);
    });

    test('should reject expense without category', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          amount: 50,
          description: 'No category expense',
          date: '2024-01-15'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/expenses/:id', () => {
    test('should get expense by id', async () => {
      // Create expense first
      const createResponse = await request(app)
        .post('/api/expenses')
        .send({
          amount: 75.50,
          description: 'Get test expense',
          categoryId: categoryId,
          date: '2024-01-15'
        });
      
      const id = createResponse.body.id;
      
      const response = await request(app).get(`/api/expenses/${id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      
      // Cleanup
      Expense.delete(id);
    });

    test('should return 404 for non-existent expense', async () => {
      const response = await request(app).get('/api/expenses/999999');
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    test('should update an expense', async () => {
      // Create expense first
      const createResponse = await request(app)
        .post('/api/expenses')
        .send({
          amount: 100,
          description: 'Original',
          categoryId: categoryId,
          date: '2024-01-15'
        });
      
      const id = createResponse.body.id;
      
      const response = await request(app)
        .put(`/api/expenses/${id}`)
        .send({
          amount: 150.75,
          description: 'Updated'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(150.75);
      expect(response.body.description).toBe('Updated');
      
      // Cleanup
      Expense.delete(id);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    test('should delete an expense', async () => {
      // Create expense first
      const createResponse = await request(app)
        .post('/api/expenses')
        .send({
          amount: 50,
          description: 'To delete',
          categoryId: categoryId,
          date: '2024-01-15'
        });
      
      const id = createResponse.body.id;
      
      const response = await request(app).delete(`/api/expenses/${id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Expense deleted successfully');
    });
  });

  describe('GET /api/summary', () => {
    test('should return summary statistics', async () => {
      const response = await request(app).get('/api/summary');
      
      expect(response.status).toBe(200);
      expect(response.body.currentMonth).toBeDefined();
      expect(response.body.categoryBreakdown).toBeDefined();
      expect(response.body.topExpenses).toBeDefined();
    });
  });

  describe('GET /api/expenses/export', () => {
    test('should export expenses as JSON', async () => {
      const response = await request(app).get('/api/expenses/export');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/expenses/import', () => {
    test('should import expenses from JSON array', async () => {
      const testData = [
        {
          amount: 25.00,
          description: 'Imported expense 1',
          category_name: 'Food',
          date: '2024-01-10'
        },
        {
          amount: 35.00,
          description: 'Imported expense 2',
          category_name: 'Transport',
          date: '2024-01-11'
        }
      ];
      
      const response = await request(app)
        .post('/api/expenses/import')
        .send(testData);
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    test('should reject non-array data', async () => {
      const response = await request(app)
        .post('/api/expenses/import')
        .send({ not: 'an array' });
      
      expect(response.status).toBe(400);
    });
  });
});
