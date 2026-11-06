// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const db = require('../config/database');

describe('Add Sample Data Script', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    
    // Clear module cache to ensure fresh requires
    jest.resetModules();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('addSampleData function', () => {
    it('should add sample data when none exists', async () => {
      // Mock database responses
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // no existing expenses
        .mockResolvedValueOnce({ // categories query
          rows: [
            { id: 1, name: 'Food & Dining' },
            { id: 2, name: 'Transportation' },
            { id: 3, name: 'Shopping' },
            { id: 4, name: 'Entertainment' },
            { id: 5, name: 'Bills & Utilities' },
            { id: 6, name: 'Healthcare' }
          ]
        })
        .mockResolvedValue({ rows: [{ id: 1 }] }); // successful inserts

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('🎯 Adding sample expense data...');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Added'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('sample expenses'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('sample budgets'));
    });

    it('should skip adding data when sample data already exists', async () => {
      // Mock existing expenses
      db.query.mockResolvedValueOnce({ rows: [{ count: '10' }] });

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Sample data already exists');
    });

    it('should handle case when no categories exist', async () => {
      // Mock no existing expenses but also no categories
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // no existing expenses
        .mockResolvedValueOnce({ rows: [] }); // no categories

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('❌ No categories found. Run setup-db.js first.');
    });

    it('should use category mapping correctly', async () => {
      // Mock database responses with specific categories
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ 
          rows: [
            { id: 1, name: 'Food & Dining' },
            { id: 2, name: 'Transportation' }
          ]
        })
        .mockResolvedValue({ rows: [{ id: 1 }] });

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify that inserts were called with correct category IDs
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO expenses'),
        expect.arrayContaining([1]) // Food & Dining category ID
      );
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      db.query.mockRejectedValue(error);

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error adding sample data:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should add both expenses and budgets', async () => {
      // Mock successful flow
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ 
          rows: [
            { id: 1, name: 'Food & Dining' },
            { id: 2, name: 'Transportation' },
            { id: 3, name: 'Shopping' },
            { id: 4, name: 'Entertainment' }
          ]
        })
        .mockResolvedValue({ rows: [{ id: 1 }] });

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should insert expenses and budgets
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO expenses'),
        expect.any(Array)
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO budgets'),
        expect.any(Array)
      );
    });

    it('should log completion message on success', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, name: 'Food & Dining' }]
        })
        .mockResolvedValue({ rows: [{ id: 1 }] });

      require('../add-sample-data');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('🎉 Sample data added successfully!');
    });
  });
});