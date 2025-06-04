import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('API Utilities', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
    
    // Mock axios.create to return our mock instance
    axios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('API Functions', () => {
    it('should export all required API functions', () => {
      // Reset modules and require the API module fresh
      jest.resetModules();
      const api = require('../utils/api');
      
      expect(typeof api.fetchExpenses).toBe('function');
      expect(typeof api.createExpense).toBe('function');
      expect(typeof api.updateExpense).toBe('function');
      expect(typeof api.deleteExpense).toBe('function');
      expect(typeof api.fetchCategories).toBe('function');
      expect(typeof api.createCategory).toBe('function');
      expect(typeof api.fetchBudgets).toBe('function');
      expect(typeof api.createBudget).toBe('function');
      expect(typeof api.fetchDashboardStats).toBe('function');
      expect(typeof api.fetchMonthlyStats).toBe('function');
    });

    it('should create axios instance with correct configuration', () => {
      require('../utils/api');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use environment API URL when available', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'http://localhost:3001/api';

      // Clear module cache and re-require to test environment variable
      jest.resetModules();
      axios.create.mockReturnValue(mockAxiosInstance);

      require('../utils/api');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3001/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Restore original environment
      process.env.REACT_APP_API_URL = originalEnv;
    });
  });

  describe('Expenses API', () => {
    it('should fetch expenses', async () => {
      const { fetchExpenses } = require('../utils/api');
      const mockResponse = { data: { expenses: [{ id: 1, amount: 100 }] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchExpenses();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/expenses', { params: {} });
    });

    it('should create expense', async () => {
      const { createExpense } = require('../utils/api');
      const mockExpense = { amount: 50, description: 'Lunch' };
      const mockResponse = { data: { id: 1, ...mockExpense } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createExpense(mockExpense);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/expenses', mockExpense);
    });

    it('should update expense', async () => {
      const { updateExpense } = require('../utils/api');
      const mockResponse = { data: { id: 1, amount: 75 } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await updateExpense(1, { amount: 75 });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/expenses/1', { amount: 75 });
    });

    it('should delete expense', async () => {
      const { deleteExpense } = require('../utils/api');
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await deleteExpense(1);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/expenses/1');
    });
  });

  describe('Categories API', () => {
    it('should fetch categories', async () => {
      const { fetchCategories } = require('../utils/api');
      const mockResponse = { data: [{ id: 1, name: 'Food' }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchCategories();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/categories');
    });

    it('should create category', async () => {
      const { createCategory } = require('../utils/api');
      const mockCategory = { name: 'Entertainment' };
      const mockResponse = { data: { id: 1, ...mockCategory } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createCategory(mockCategory);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/categories', mockCategory);
    });
  });

  describe('Budgets API', () => {
    it('should fetch budgets', async () => {
      const { fetchBudgets } = require('../utils/api');
      const mockResponse = { data: [{ id: 1, amount: 500 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchBudgets();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/budgets');
    });

    it('should create budget', async () => {
      const { createBudget } = require('../utils/api');
      const mockBudget = { amount: 300, category_id: 1 };
      const mockResponse = { data: { id: 1, ...mockBudget } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createBudget(mockBudget);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/budgets', mockBudget);
    });
  });

  describe('Stats API', () => {
    it('should fetch dashboard stats', async () => {
      const { fetchDashboardStats } = require('../utils/api');
      const mockResponse = { data: { currentMonth: { total: 500 } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchDashboardStats();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/stats/dashboard');
    });

    it('should fetch monthly stats', async () => {
      const { fetchMonthlyStats } = require('../utils/api');
      const mockResponse = { data: [{ month: '2023-01-01', total: 1500 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchMonthlyStats();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/stats/monthly');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { fetchExpenses } = require('../utils/api');
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(fetchExpenses()).rejects.toThrow('Network error');
    });
  });
});