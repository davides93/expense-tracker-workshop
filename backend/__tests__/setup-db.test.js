// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const db = require('../config/database');

describe('Database Setup Script', () => {
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

  describe('createTables function', () => {
    it('should create all required tables successfully', async () => {
      // Mock successful queries for all table creation steps
      db.query.mockResolvedValue({ rows: [] });

      const setupDb = require('../setup-db');
      
      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('🔨 Creating expense tracker database tables...');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Users table created');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Categories table created');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Expenses table created');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Budgets table created');
    });

    it('should check for existing categories before inserting defaults', async () => {
      // Mock no existing categories, then successful inserts
      db.query
        .mockResolvedValueOnce({ rows: [] }) // users table
        .mockResolvedValueOnce({ rows: [] }) // categories table
        .mockResolvedValueOnce({ rows: [] }) // expenses table
        .mockResolvedValueOnce({ rows: [] }) // budgets table
        .mockResolvedValueOnce({ rows: [] }) // recurring_expenses table
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // check existing categories
        .mockResolvedValueOnce({ rows: [] }) // insert default categories
        .mockResolvedValueOnce({ rows: [] }) // create indexes
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      require('../setup-db');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Default categories inserted');
    });

    it('should skip inserting default categories if they already exist', async () => {
      // Mock existing categories
      db.query
        .mockResolvedValueOnce({ rows: [] }) // users table
        .mockResolvedValueOnce({ rows: [] }) // categories table
        .mockResolvedValueOnce({ rows: [] }) // expenses table
        .mockResolvedValueOnce({ rows: [] }) // budgets table
        .mockResolvedValueOnce({ rows: [] }) // recurring_expenses table
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // check existing categories
        .mockResolvedValueOnce({ rows: [] }) // create indexes
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      require('../setup-db');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Default categories already exist');
    });

    it('should create database indexes', async () => {
      db.query.mockResolvedValue({ rows: [] });

      require('../setup-db');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Indexes created');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      db.query.mockRejectedValue(error);

      require('../setup-db');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error creating tables:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should log completion message on success', async () => {
      db.query.mockResolvedValue({ rows: [] });

      require('../setup-db');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('🎉 Database setup completed successfully!');
    });
  });
});