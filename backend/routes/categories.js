const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM categories 
      ORDER BY is_default DESC, name ASC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, color, icon, user_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const query = `
      INSERT INTO categories (name, color, icon, user_id, is_default)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `;
    
    const result = await db.query(query, [name, color, icon, user_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

module.exports = router;