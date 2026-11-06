const request = require('supertest');
const express = require('express');
const statsRoutes = require('../routes/stats');

// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const db = require('../config/database');

// Create a test app with the stats routes
const app = express();
app.use(express.json());
app.use('/api/stats', statsRoutes);

describe('Stats Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stats/dashboard', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockCurrentMonth = { rows: [{ total_expenses: 10, total_amount: 500.00 }] };
      const mockCategories = { 
        rows: [
          { category: 'Food', color: '#FF0000', count: 5, total: 250.00 },
          { category: 'Transport', color: '#00FF00', count: 3, total: 150.00 }
        ] 
      };
      const mockRecentExpenses = { 
        rows: [
          { date: '2023-12-01', total: 50.00 },
          { date: '2023-12-02', total: 75.00 }
        ] 
      };
      const mockBudgets = { 
        rows: [
          { 
            budget_amount: 300.00, 
            category: 'Food', 
            color: '#FF0000', 
            spent_amount: 250.00, 
            percentage_used: 83.33 
          }
        ] 
      };

      // Mock Promise.all by returning values in sequence
      db.query
        .mockResolvedValueOnce(mockCurrentMonth)
        .mockResolvedValueOnce(mockCategories)
        .mockResolvedValueOnce(mockRecentExpenses)
        .mockResolvedValueOnce(mockBudgets);

      const response = await request(app)
        .get('/api/stats/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('currentMonth');
      expect(response.body).toHaveProperty('expensesByCategory');
      expect(response.body).toHaveProperty('recentExpenses');
      expect(response.body).toHaveProperty('budgetOverview');
      
      expect(response.body.currentMonth).toEqual({ total_expenses: 10, total_amount: 500.00 });
      expect(response.body.expensesByCategory).toHaveLength(2);
      expect(response.body.recentExpenses).toHaveLength(2);
      expect(response.body.budgetOverview).toHaveLength(1);
    });

    it('should execute all required queries', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/stats/dashboard')
        .expect(200);

      // Should call db.query 4 times for the 4 different statistics
      expect(db.query).toHaveBeenCalledTimes(4);
      
      // Check that it queries for current month stats
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE_TRUNC(\'month\', expense_date) = DATE_TRUNC(\'month\', CURRENT_DATE)')
      );
      
      // Check that it queries for category breakdown
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN expenses e ON c.id = e.category_id')
      );
      
      // Check that it queries for recent expenses (last 7 days)
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('expense_date >= CURRENT_DATE - INTERVAL \'7 days\'')
      );
      
      // Check that it queries for budget overview
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('budgets b')
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/stats/dashboard')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch dashboard statistics');
    });

    it('should calculate percentage used in budget query', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/stats/dashboard')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('COALESCE(spent.total, 0) / b.amount * 100')
      );
    });

    it('should filter budgets by current date period', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/stats/dashboard')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE b.period_start <= CURRENT_DATE AND b.period_end >= CURRENT_DATE')
      );
    });
  });

  describe('GET /api/stats/monthly', () => {
    it('should fetch monthly statistics successfully', async () => {
      const mockMonthlyStats = [
        { month: '2023-01-01', total: 1500.00, count: 25 },
        { month: '2023-02-01', total: 1200.00, count: 20 },
        { month: '2023-03-01', total: 1800.00, count: 30 }
      ];

      db.query.mockResolvedValue({ rows: mockMonthlyStats });

      const response = await request(app)
        .get('/api/stats/monthly')
        .expect(200);

      expect(response.body).toEqual(mockMonthlyStats);
      expect(response.body).toHaveLength(3);
    });

    it('should query for last 12 months data', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/stats/monthly')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('expense_date >= CURRENT_DATE - INTERVAL \'12 months\'')
      );
    });

    it('should group by month and order chronologically', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/stats/monthly')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY DATE_TRUNC(\'month\', expense_date)')
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY month ASC')
      );
    });

    it('should include total amount and count for each month', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/stats/monthly')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('COALESCE(SUM(amount), 0) as total')
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as count')
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/stats/monthly')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch monthly statistics');
    });
  });
});