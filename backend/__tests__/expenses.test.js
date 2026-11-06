const request = require('supertest');
const express = require('express');
const expenseRoutes = require('../routes/expenses');

// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const db = require('../config/database');

// Create a test app with the expense routes
const app = express();
app.use(express.json());
app.use('/api/expenses', expenseRoutes);

describe('Expense Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/expenses', () => {
    it('should fetch all expenses successfully', async () => {
      const mockExpenses = [
        {
          id: 1,
          amount: 50.00,
          currency: 'EUR',
          description: 'Lunch',
          expense_date: '2023-12-01',
          category_name: 'Food',
          category_color: '#FF0000'
        }
      ];

      db.query.mockResolvedValue({ rows: mockExpenses });

      const response = await request(app)
        .get('/api/expenses')
        .expect(200);

      expect(response.body).toHaveProperty('expenses');
      expect(response.body.expenses).toEqual(mockExpenses);
      expect(response.body).toHaveProperty('total', 1);
      expect(response.body).toHaveProperty('limit', 50);
      expect(response.body).toHaveProperty('offset', 0);
    });

    it('should filter expenses by category_id', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/expenses?category_id=1')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('AND e.category_id = $1'),
        expect.arrayContaining(['1', 50, 0])
      );
    });

    it('should filter expenses by date range', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/expenses?start_date=2023-01-01&end_date=2023-12-31')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('AND e.expense_date >= $1'),
        expect.arrayContaining(['2023-01-01', '2023-12-31', 50, 0])
      );
    });

    it('should handle pagination correctly', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/expenses?limit=10&offset=20')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1 OFFSET $2'),
        expect.arrayContaining([10, 20])
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/expenses')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch expenses');
    });
  });

  describe('POST /api/expenses', () => {
    it('should create a new expense successfully', async () => {
      const newExpense = {
        amount: 25.50,
        currency: 'EUR',
        description: 'Coffee',
        expense_date: '2023-12-01',
        category_id: 1
      };

      const mockResult = {
        rows: [{ id: 1, ...newExpense }]
      };

      db.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/expenses')
        .send(newExpense)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.amount).toBe(25.50);
    });

    it('should validate required fields', async () => {
      const invalidExpense = {
        description: 'Coffee'
        // Missing amount and expense_date
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(invalidExpense)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Amount and expense_date are required');
    });

    it('should use default currency when not provided', async () => {
      const expense = {
        amount: 25.50,
        description: 'Coffee',
        expense_date: '2023-12-01'
      };

      db.query.mockResolvedValue({ rows: [{ id: 1, ...expense, currency: 'EUR' }] });

      await request(app)
        .post('/api/expenses')
        .send(expense)
        .expect(201);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([25.50, 'EUR', 'Coffee', '2023-12-01', undefined, undefined])
      );
    });

    it('should handle database errors during creation', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const expense = {
        amount: 25.50,
        expense_date: '2023-12-01'
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expense)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create expense');
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update an expense successfully', async () => {
      const updatedExpense = {
        amount: 30.00,
        currency: 'EUR',
        description: 'Updated Coffee',
        expense_date: '2023-12-02',
        category_id: 1
      };

      db.query.mockResolvedValue({ rows: [{ id: 1, ...updatedExpense }] });

      const response = await request(app)
        .put('/api/expenses/1')
        .send(updatedExpense)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.amount).toBe(30.00);
    });

    it('should return 404 when expense not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/expenses/999')
        .send({ amount: 30.00 })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Expense not found');
    });

    it('should handle database errors during update', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/expenses/1')
        .send({ amount: 30.00 })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to update expense');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense successfully', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const response = await request(app)
        .delete('/api/expenses/1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Expense deleted successfully');
    });

    it('should return 404 when expense not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .delete('/api/expenses/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Expense not found');
    });

    it('should handle database errors during deletion', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/expenses/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to delete expense');
    });
  });
});