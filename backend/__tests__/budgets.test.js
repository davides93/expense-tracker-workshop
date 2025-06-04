const request = require('supertest');
const express = require('express');
const budgetRoutes = require('../routes/budgets');

// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const db = require('../config/database');

// Create a test app with the budget routes
const app = express();
app.use(express.json());
app.use('/api/budgets', budgetRoutes);

describe('Budget Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/budgets', () => {
    it('should fetch all budgets with spending information', async () => {
      const mockBudgets = [
        {
          id: 1,
          amount: 500.00,
          category_id: 1,
          period_start: '2023-12-01',
          period_end: '2023-12-31',
          category_name: 'Food & Dining',
          category_color: '#FF6B6B',
          spent_amount: 250.50
        },
        {
          id: 2,
          amount: 200.00,
          category_id: 2,
          period_start: '2023-12-01',
          period_end: '2023-12-31',
          category_name: 'Transportation',
          category_color: '#4ECDC4',
          spent_amount: 0
        }
      ];

      db.query.mockResolvedValue({ rows: mockBudgets });

      const response = await request(app)
        .get('/api/budgets')
        .expect(200);

      expect(response.body).toEqual(mockBudgets);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT b.*, c.name as category_name')
      );
    });

    it('should include spent amount calculation', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/budgets')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('COALESCE(spent.total, 0) as spent_amount')
      );
    });

    it('should join with categories and expenses for spending calculation', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/budgets')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN categories c ON')
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN (')
      );
    });

    it('should order budgets by creation date descending', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/budgets')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY b.created_at DESC')
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/budgets')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch budgets');
    });
  });

  describe('POST /api/budgets', () => {
    it('should create a new budget successfully', async () => {
      const newBudget = {
        amount: 300.00,
        category_id: 1,
        period_start: '2023-12-01',
        period_end: '2023-12-31',
        user_id: 1
      };

      const mockResult = {
        rows: [{ id: 3, ...newBudget }]
      };

      db.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/budgets')
        .send(newBudget)
        .expect(201);

      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.amount).toBe(300.00);
      expect(response.body.category_id).toBe(1);
    });

    it('should validate required fields', async () => {
      const invalidBudget = {
        category_id: 1
        // Missing amount, period_start, period_end
      };

      const response = await request(app)
        .post('/api/budgets')
        .send(invalidBudget)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Amount, period_start, and period_end are required');
    });

    it('should accept budget without category_id', async () => {
      const budgetWithoutCategory = {
        amount: 1000.00,
        period_start: '2023-12-01',
        period_end: '2023-12-31'
      };

      db.query.mockResolvedValue({
        rows: [{ id: 4, ...budgetWithoutCategory, category_id: null }]
      });

      const response = await request(app)
        .post('/api/budgets')
        .send(budgetWithoutCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id', 4);
      expect(response.body.category_id).toBeNull();
    });

    it('should accept budget without user_id', async () => {
      const budgetWithoutUser = {
        amount: 500.00,
        period_start: '2023-12-01',
        period_end: '2023-12-31'
      };

      db.query.mockResolvedValue({
        rows: [{ id: 5, ...budgetWithoutUser, user_id: null }]
      });

      const response = await request(app)
        .post('/api/budgets')
        .send(budgetWithoutUser)
        .expect(201);

      expect(response.body).toHaveProperty('id', 5);
      expect(response.body.user_id).toBeNull();
    });

    it('should handle database errors during creation', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const budget = {
        amount: 300.00,
        period_start: '2023-12-01',
        period_end: '2023-12-31'
      };

      const response = await request(app)
        .post('/api/budgets')
        .send(budget)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create budget');
    });

    it('should pass all parameters to database query', async () => {
      const budget = {
        amount: 750.00,
        category_id: 2,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        user_id: 2
      };

      db.query.mockResolvedValue({ rows: [{ id: 6, ...budget }] });

      await request(app)
        .post('/api/budgets')
        .send(budget)
        .expect(201);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [750.00, 2, '2024-01-01', '2024-01-31', 2]
      );
    });
  });
});