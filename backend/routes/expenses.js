const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/expenses - Get all expenses for a user
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, category_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category_id) {
      paramCount++;
      query += ` AND e.category_id = $${paramCount}`;
      params.push(category_id);
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
    
    // Sanitize and bound limit (1-100, default 50) and offset (>=0, default 0) to prevent DoS & bad queries
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(safeLimit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(safeOffset);

    const result = await db.query(query, params);
    res.json({
      expenses: result.rows,
      total: result.rows.length,
      limit: safeLimit,
      offset: safeOffset
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Helper function for validating expense inputs
function validateExpenseInput(amount, expense_date) {
  const numAmount = Number(amount);
  if (amount === undefined || amount === null || !Number.isFinite(numAmount) || numAmount <= 0) {
    return 'Valid positive amount is required';
  }
  if (!expense_date || isNaN(Date.parse(expense_date))) {
    return 'Valid expense_date is required';
  }
  return null;
}

// POST /api/expenses - Create a new expense
router.post('/', async (req, res) => {
  try {
    const { amount, currency, description, expense_date, category_id, receipt_url } = req.body;
    
    const validationError = validateExpenseInput(amount, expense_date);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const query = `
      INSERT INTO expenses (amount, currency, description, expense_date, category_id, receipt_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      amount, 
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

    const validationError = validateExpenseInput(amount, expense_date);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    const query = `
      UPDATE expenses 
      SET amount = $1, currency = $2, description = $3, expense_date = $4, 
          category_id = $5, receipt_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await db.query(query, [
      amount, currency, description, expense_date, category_id, receipt_url, id
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