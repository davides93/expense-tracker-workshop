const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/budgets - Get all budgets
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT b.*, c.name as category_name, c.color as category_color,
             COALESCE(spent.total, 0) as spent_amount
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN (
        SELECT category_id, SUM(amount) as total
        FROM expenses 
        WHERE expense_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category_id
      ) spent ON b.category_id = spent.category_id
      ORDER BY b.created_at DESC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets - Create a new budget
router.post('/', async (req, res) => {
  try {
    const { amount, category_id, period_start, period_end, user_id } = req.body;
    
    if (!amount || !period_start || !period_end) {
      return res.status(400).json({ error: 'Amount, period_start, and period_end are required' });
    }

    const query = `
      INSERT INTO budgets (amount, category_id, period_start, period_end, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [amount, category_id, period_start, period_end, user_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

module.exports = router;