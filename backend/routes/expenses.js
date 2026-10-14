const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/expenses - Get all expenses for a user
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, category_id, start_date, end_date } = req.query;
    
    // Security: Validate and sanitize limit (1-100) and offset (>=0) to prevent DoS or SQL syntax errors
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category_id) {
      const parsedCatId = parseInt(category_id, 10);
      if (!isNaN(parsedCatId)) {
        paramCount++;
        query += ` AND e.category_id = $${paramCount}`;
        params.push(parsedCatId);
      }
    }

    if (start_date) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY e.expense_date DESC, e.created_at DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parsedLimit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parsedOffset);

    const result = await db.query(query, params);
    res.json({
      expenses: result.rows,
      total: result.rows.length,
      limit: parsedLimit,
      offset: parsedOffset
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses - Create a new expense
router.post('/', async (req, res) => {
  try {
    const { amount, currency, description, expense_date, category_id, receipt_url } = req.body;
    
    // Basic validation
    if (amount === undefined || amount === null || !expense_date) {
      return res.status(400).json({ error: 'Amount and expense_date are required' });
    }

    // Security: Validate amount is a positive finite number
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Security: Ensure receipt_url uses http or https protocol if provided
    if (receipt_url && !/^https?:\/\//i.test(receipt_url)) {
      return res.status(400).json({ error: 'Receipt URL must use http or https protocol' });
    }

    const query = `
      INSERT INTO expenses (amount, currency, description, expense_date, category_id, receipt_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      numericAmount,
      currency || 'EUR', 
      description, 
      expense_date, 
      category_id, 
      receipt_url
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update an expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, description, expense_date, category_id, receipt_url } = req.body;

    // Security: Validate amount if provided
    let numericAmount = amount;
    if (amount !== undefined && amount !== null) {
      numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
    }

    // Security: Ensure receipt_url uses http or https protocol if provided
    if (receipt_url && !/^https?:\/\//i.test(receipt_url)) {
      return res.status(400).json({ error: 'Receipt URL must use http or https protocol' });
    }
    
    const query = `
      UPDATE expenses 
      SET amount = $1, currency = $2, description = $3, expense_date = $4, 
          category_id = $5, receipt_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await db.query(query, [
      numericAmount, currency, description, expense_date, category_id, receipt_url, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;