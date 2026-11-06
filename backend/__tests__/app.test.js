const request = require('supertest');
const app = require('../index');

// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn(),
    end: jest.fn()
  }
}));

const db = require('../config/database');

describe('Express App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status when database is connected', async () => {
      db.query.mockResolvedValue({
        rows: [{ status: 1 }]
      });

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('database', 'healthy');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return error status when database connection fails', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('error', 'Database connection failed');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Readiness Check Endpoint', () => {
    it('should return ready status when services are ready', async () => {
      db.query.mockResolvedValue({ rows: [{}] });

      const response = await request(app)
        .get('/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return not ready status when services are not ready', async () => {
      db.query.mockRejectedValue(new Error('Service not ready'));

      const response = await request(app)
        .get('/ready')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'not ready');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('CORS and Middleware', () => {
    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/health')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should parse JSON bodies', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 1, amount: 100 }]
      });

      const response = await request(app)
        .post('/api/expenses')
        .send({ amount: 100, expense_date: '2023-12-01' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle errors in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock a route that throws an error
      const express = require('express');
      const testApp = express();
      testApp.use(express.json());
      testApp.get('/test-error', () => {
        throw new Error('Test error message');
      });
      
      // Add the same error handling middleware from index.js
      testApp.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ 
          error: 'Something went wrong!',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      });

      const response = await request(testApp)
        .get('/test-error')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Something went wrong!');
      expect(response.body).toHaveProperty('message', 'Test error message');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock a route that throws an error
      const express = require('express');
      const testApp = express();
      testApp.use(express.json());
      testApp.get('/test-error', () => {
        throw new Error('Test error message');
      });
      
      // Add the same error handling middleware from index.js
      testApp.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ 
          error: 'Something went wrong!',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      });

      const response = await request(testApp)
        .get('/test-error')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Something went wrong!');
      expect(response.body).toHaveProperty('message', 'Internal server error');

      process.env.NODE_ENV = originalEnv;
    });
  });
});