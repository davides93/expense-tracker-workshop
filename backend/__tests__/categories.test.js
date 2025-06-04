const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../routes/categories');

// Mock the database module
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const db = require('../config/database');

// Create a test app with the category routes
const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('Category Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should fetch all categories successfully', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Food & Dining',
          color: '#FF6B6B',
          icon: 'restaurant',
          is_default: true
        },
        {
          id: 2,
          name: 'Transportation',
          color: '#4ECDC4',
          icon: 'directions_car',
          is_default: true
        }
      ];

      db.query.mockResolvedValue({ rows: mockCategories });

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toEqual(mockCategories);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories')
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/categories')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch categories');
    });

    it('should order categories correctly (defaults first, then alphabetical)', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/api/categories')
        .expect(200);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY is_default DESC, name ASC')
      );
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category successfully', async () => {
      const newCategory = {
        name: 'Custom Category',
        color: '#FF0000',
        icon: 'custom_icon',
        user_id: 1
      };

      const mockResult = {
        rows: [{ id: 3, ...newCategory, is_default: false }]
      };

      db.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.name).toBe('Custom Category');
      expect(response.body.is_default).toBe(false);
    });

    it('should validate required name field', async () => {
      const invalidCategory = {
        color: '#FF0000',
        icon: 'custom_icon'
        // Missing name
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Name is required');
    });

    it('should create category with minimal data', async () => {
      const minimalCategory = {
        name: 'Minimal Category'
      };

      db.query.mockResolvedValue({
        rows: [{ id: 4, ...minimalCategory, is_default: false }]
      });

      const response = await request(app)
        .post('/api/categories')
        .send(minimalCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id', 4);
      expect(response.body.name).toBe('Minimal Category');
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['Minimal Category', undefined, undefined, undefined]
      );
    });

    it('should handle database errors during creation', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const category = {
        name: 'Test Category'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(category)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create category');
    });

    it('should set is_default to false for user-created categories', async () => {
      const category = {
        name: 'User Category',
        user_id: 1
      };

      db.query.mockResolvedValue({
        rows: [{ id: 5, ...category, is_default: false }]
      });

      await request(app)
        .post('/api/categories')
        .send(category)
        .expect(201);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_default)'),
        expect.arrayContaining(['User Category', undefined, undefined, 1])
      );
    });
  });
});