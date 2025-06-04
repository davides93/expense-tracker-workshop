// Mock pg module before requiring database
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  };
  return {
    Pool: jest.fn(() => mockPool)
  };
});

describe('Database Configuration', () => {
  let Pool;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    Pool = require('pg').Pool;
  });

  describe('Database Connection', () => {
    it('should create a Pool with correct configuration', () => {
      // Re-require the database module to trigger Pool creation
      require('../config/database');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: expect.any(String),
        ssl: expect.any(Boolean)
      });
    });

    it('should use environment DATABASE_URL if provided', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@testhost:5432/testdb';
      
      // Re-require the database module
      require('../config/database');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: 'postgresql://test:test@testhost:5432/testdb',
        ssl: expect.any(Boolean)
      });
      
      delete process.env.DATABASE_URL;
    });

    it('should use default connection string when DATABASE_URL not provided', () => {
      delete process.env.DATABASE_URL;
      
      require('../config/database');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/expense_tracker',
        ssl: expect.any(Boolean)
      });
    });

    it('should enable SSL in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      require('../config/database');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: expect.any(String),
        ssl: { rejectUnauthorized: false }
      });
      
      delete process.env.NODE_ENV;
    });

    it('should disable SSL in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      
      require('../config/database');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: expect.any(String),
        ssl: false
      });
      
      delete process.env.NODE_ENV;
    });
  });

  describe('Database Methods', () => {
    it('should export query method that calls pool.query', async () => {
      const queryText = 'SELECT * FROM expenses';
      const params = [1, 2, 3];
      const mockResult = { rows: [{ id: 1 }] };

      // Set up the mock pool to be returned by Pool constructor
      const mockPool = Pool();
      mockPool.query.mockResolvedValue(mockResult);

      const database = require('../config/database');
      const result = await database.query(queryText, params);

      expect(mockPool.query).toHaveBeenCalledWith(queryText, params);
      expect(result).toBe(mockResult);
    });

    it('should export pool instance', () => {
      const mockPool = Pool();
      const database = require('../config/database');
      
      expect(database.pool).toBe(mockPool);
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      const mockPool = Pool();
      mockPool.query.mockRejectedValue(error);

      const database = require('../config/database');
      
      await expect(database.query('SELECT 1')).rejects.toThrow('Query failed');
    });
  });

  describe('Connection Testing', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log success message on successful connection', () => {
      const mockPool = Pool();
      const mockRelease = jest.fn();
      
      mockPool.connect.mockImplementation((callback) => {
        callback(null, {}, mockRelease);
      });

      require('../config/database');

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Database connected successfully');
      expect(mockRelease).toHaveBeenCalled();
    });

    it('should log error message on connection failure', () => {
      const mockPool = Pool();
      const mockError = new Error('Connection failed');
      
      mockPool.connect.mockImplementation((callback) => {
        callback(mockError);
      });

      require('../config/database');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error connecting to the database:',
        mockError.stack
      );
    });
  });
});